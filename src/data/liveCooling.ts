import type { Center, CenterKind } from '@/types/center';

/**
 * LIVE cooling-center source: Missouri DHSS public ArcGIS feature service.
 *   https://gis.mo.gov/arcgis/rest/services/DHSS/Cooling_Center/MapServer/0
 * "Data is updated seasonally and on an irregular basis depending on the
 * current weather conditions." Fields include FACILITY, ADDRESS, CITY, ZIP,
 * PHONE, HOURS_OF_OPERATION, LAT/LON, ADA_ACCESS, TRANSPORTATION.
 *
 * Native (Android/iOS) fetches this directly. The web build is CORS-blocked by
 * the browser, so it reads EXPO_PUBLIC_DHSS_URL to point at a local proxy;
 * otherwise it falls back to the curated dataset (handled by the caller).
 */

const DEFAULT_URL =
  'https://gis.mo.gov/arcgis/rest/services/DHSS/Cooling_Center/MapServer/0/query';

const ENV_URL =
  typeof process !== 'undefined' && process.env
    ? process.env.EXPO_PUBLIC_DHSS_URL
    : undefined;

interface ArcgisFeature {
  attributes: {
    OBJECTID: number;
    FACILITY?: string;
    ADDRESS?: string;
    CITY?: string;
    STATE?: string;
    ZIP?: string;
    PHONE?: string;
    HOURS_OF_OPERATION?: string;
    LATITUDE?: number;
    LONGITUDE?: number;
    ADA_ACCESS?: string | null;
    TRANSPORTATION?: string | null;
  };
}

function kindFor(name: string): CenterKind {
  const n = name.toLowerCase();
  if (n.includes('library')) return 'library';
  if (n.includes('senior')) return 'senior';
  if (n.includes('recreation') || n.includes('rec center')) return 'recreation';
  if (n.includes('church') || n.includes('cathedral') || n.includes('salvation')) return 'church';
  if (n.includes('hospital') || n.includes('va ') || n.includes('medical')) return 'medical';
  if (n.includes('shelter') || n.includes('housing') || n.includes('patrick')) return 'shelter';
  return 'community';
}

/** Fetch + map live St. Louis-area cooling centers. Throws on network error. */
export async function fetchLiveCoolingCenters(
  fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis),
): Promise<Center[]> {
  const base = ENV_URL ?? DEFAULT_URL;
  // St. Louis city + county by CITY name match; request JSON.
  const params = new URLSearchParams({
    where: "CITY LIKE '%Louis%'",
    outFields: '*',
    outSR: '4326',
    f: 'json',
  });
  const res = await fetchImpl(`${base}?${params.toString()}`);
  if (!res.ok) throw new Error(`DHSS HTTP ${res.status}`);
  const data = (await res.json()) as { features?: ArcgisFeature[] };
  const feats = data.features ?? [];

  const out: Center[] = [];
  for (const f of feats) {
    const a = f.attributes;
    const name = (a.FACILITY ?? '').trim();
    const lat = a.LATITUDE;
    const lon = a.LONGITUDE;
    if (!name || typeof lat !== 'number' || typeof lon !== 'number') continue;

    const notes: string[] = [];
    if (a.ADA_ACCESS && /y/i.test(a.ADA_ACCESS)) notes.push('ADA accessible');
    if (a.TRANSPORTATION && /y/i.test(a.TRANSPORTATION)) notes.push('transportation available');

    out.push({
      id: `dhss-${a.OBJECTID}`,
      name,
      kind: kindFor(name),
      services: ['cooling'],
      address: [a.ADDRESS, a.CITY, `${a.STATE ?? 'MO'} ${a.ZIP ?? ''}`.trim()]
        .filter(Boolean)
        .join(', '),
      zip: (a.ZIP ?? '').trim(),
      location: { latitude: lat, longitude: lon },
      phone: a.PHONE?.trim() || undefined,
      hours: a.HOURS_OF_OPERATION?.replace(/\s+/g, ' ').trim() || undefined,
      notes: notes.length ? notes.join(' · ') : undefined,
      source: 'Missouri DHSS Cooling Center service (live)',
    });
  }
  return out;
}
