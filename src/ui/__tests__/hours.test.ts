import { parseHours, openNow } from '../hours';

describe('parseHours', () => {
  it('parses a simple range with a day range', () => {
    const w = parseHours('Mon-Fri 8:00am to 3:00pm');
    expect(w.length).toBe(1);
    expect(w[0].days).toEqual([1, 2, 3, 4, 5]);
    expect(w[0].startMin).toBe(8 * 60);
    expect(w[0].endMin).toBe(15 * 60);
  });

  it('parses colon-separated day labels', () => {
    const w = parseHours('Monday-Friday: 9:00am to 3:00pm');
    expect(w[0].days).toEqual([1, 2, 3, 4, 5]);
  });

  it('parses multi-clause hours', () => {
    const w = parseHours('Mon-Thu 9:00am to 8:00pm; Fri and Sat 9:00am to 5:00pm');
    expect(w.length).toBe(2);
    expect(w[1].days.sort()).toEqual([5, 6]);
  });

  it('returns [] for unparseable text', () => {
    expect(parseHours('See library site for hours')).toEqual([]);
    expect(parseHours(undefined)).toEqual([]);
  });
});

describe('openNow', () => {
  const hours = 'Mon-Fri 9:00am to 5:00pm';
  it('is open during the window on a weekday', () => {
    // Wednesday 2026-10-28 at 12:00
    const d = new Date(2026, 9, 28, 12, 0);
    expect(openNow(hours, d)).toBe('open');
  });
  it('is closed outside the window', () => {
    const d = new Date(2026, 9, 28, 20, 0); // 8pm
    expect(openNow(hours, d)).toBe('closed');
  });
  it('is closed on a day not covered', () => {
    const d = new Date(2026, 9, 25, 12, 0); // Sunday
    expect(openNow(hours, d)).toBe('closed');
  });
  it('is unknown when hours cannot be parsed', () => {
    expect(openNow('refer to website', new Date())).toBe('unknown');
  });
});
