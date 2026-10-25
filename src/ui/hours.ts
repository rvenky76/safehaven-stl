/**
 * Tolerant parser for the free-text "hours" strings published by the City and
 * the MO DHSS feed, plus an "open now" check against a clock.
 *
 * Published formats vary wildly, e.g.:
 *   "Mon–Fri 8:00am–3:00pm"
 *   "Mon-Thu - 9:00am to 8:00pm, Fri and Sat - 9:00am to 5:00pm"
 *   "Monday-Friday: 9:00am to 3:00pm"
 *   "Mon-Fri 9am - 5pm"
 * We parse what we confidently can and return `null` for anything we cannot,
 * so the UI can honestly say "hours unknown — call to confirm" rather than
 * guessing a center is open or closed.
 */

export interface OpenWindow {
  /** Days this window applies to, 0=Sun .. 6=Sat. */
  days: number[];
  /** Minutes from midnight. */
  startMin: number;
  endMin: number;
}

const DAY_INDEX: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

/** Parse "8:00am" / "9am" / "12:00pm(Noon)" -> minutes from midnight, or null. */
function parseTime(raw: string): number | null {
  const m = raw.toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3];
  if (h === 12) h = 0;
  if (ap === 'pm') h += 12;
  return h * 60 + min;
}

/** Expand a day token like "Mon-Fri", "Mon–Thu", "Fri and Sat", "Mon" -> day indices. */
function parseDays(raw: string): number[] {
  // Strip label noise and punctuation that surrounds the day tokens, e.g.
  // "Monday-Friday:", "Hours: Mon-Fri", "General Hours Monday through Friday".
  let s = raw.toLowerCase().replace(/[–—]/g, '-');
  s = s.replace(/\bthrough\b/g, '-'); // "Monday through Friday"
  s = s.replace(/[^a-z\s,&-]/g, ' '); // drop colons, digits, parens
  s = s.replace(/\b(hours|general|availability|availbility|info|warming|cooling|center|drop|in|overnight|shelter)\b/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  const out = new Set<number>();
  for (const part of s.split(/\s*(?:and|,|&)\s*/)) {
    const range = part.split('-').map((x) => x.trim()).filter(Boolean);
    if (range.length === 2 && DAY_INDEX[range[0]] != null && DAY_INDEX[range[1]] != null) {
      let a = DAY_INDEX[range[0]];
      const b = DAY_INDEX[range[1]];
      for (let i = 0; i < 7; i++) {
        out.add(a);
        if (a === b) break;
        a = (a + 1) % 7;
      }
    } else if (DAY_INDEX[part.trim()] != null) {
      out.add(DAY_INDEX[part.trim()]);
    }
  }
  return [...out];
}

/**
 * Parse an hours string into open windows. Returns [] if nothing could be
 * confidently parsed (caller treats that as "unknown").
 */
export function parseHours(hours: string | undefined): OpenWindow[] {
  if (!hours) return [];
  const text = hours.replace(/\s+/g, ' ').trim();
  const windows: OpenWindow[] = [];

  // Split into clauses on newlines / semicolons / " and " between day-blocks.
  const clauses = text.split(/[\n;]|,(?=\s*(?:mon|tue|wed|thu|fri|sat|sun))/i);
  for (const clause of clauses) {
    // day part + time range, separated by ":" or "-" or whitespace before a digit
    const timeMatch = clause.match(
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*(?:to|-|–|—)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
    );
    if (!timeMatch) continue;
    const start = parseTime(timeMatch[1]);
    const end = parseTime(timeMatch[2]);
    if (start == null || end == null) continue;

    // The day part is everything before the time range.
    const dayPart = clause.slice(0, clause.indexOf(timeMatch[0]));
    const days = parseDays(dayPart);
    if (days.length === 0) continue;
    windows.push({ days, startMin: start, endMin: end });
  }
  return windows;
}

export type OpenState = 'open' | 'closed' | 'unknown';

/** Is a center open at `now` given its hours string? */
export function openNow(hours: string | undefined, now: Date = new Date()): OpenState {
  const windows = parseHours(hours);
  if (windows.length === 0) return 'unknown';
  const day = now.getDay();
  const minute = now.getHours() * 60 + now.getMinutes();
  for (const w of windows) {
    if (!w.days.includes(day)) continue;
    // handle normal (start<end) windows; overnight windows split rarely occur here
    if (w.startMin <= w.endMin) {
      if (minute >= w.startMin && minute < w.endMin) return 'open';
    } else {
      if (minute >= w.startMin || minute < w.endMin) return 'open';
    }
  }
  return 'closed';
}

export function openStateLabel(state: OpenState): string {
  return state === 'open' ? 'Open now' : state === 'closed' ? 'Closed now' : 'Hours vary';
}
