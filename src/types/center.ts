/**
 * Core domain types for SafeHaven STL — a finder for warming and cooling
 * centers (and related emergency resources) in St. Louis.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** What kind of relief a center provides. A site can offer both. */
export type CenterService = 'warming' | 'cooling';

/** Broad category of the facility, for context + filtering. */
export type CenterKind =
  | 'library'
  | 'recreation'
  | 'senior'
  | 'shelter'
  | 'church'
  | 'medical'
  | 'community';

export interface Center {
  id: string;
  name: string;
  kind: CenterKind;
  /** Which relief services this site provides. */
  services: CenterService[];
  address: string;
  /** e.g. "63103" — used for grouping/search. */
  zip: string;
  location: GeoPoint;
  /**
   * True when the coordinate is an approximate centroid (e.g. ZIP-level) rather
   * than a precise geocode. Surfaced in the UI so distances are honest.
   */
  approxLocation?: boolean;
  phone?: string;
  website?: string;
  /** Free-text hours as published by the city (not machine-parsed). */
  hours?: string;
  /** Extra services offered (meals, transportation, overnight, etc.). */
  notes?: string;
  /** Source of the record, for transparency. */
  source: string;
}

/**
 * City emergency activation state. Warming/cooling centers meaningfully open
 * only when the City declares Code Blue (cold) or a Heat Emergency.
 * This is operator/seed-set metadata, NOT a live feed — labeled honestly.
 */
export interface Activation {
  service: CenterService;
  /** Is the emergency currently declared? */
  active: boolean;
  /** Human label, e.g. "Code Blue Level 2" or "No heat emergency". */
  label: string;
  /** When this activation status was last confirmed (epoch ms). */
  asOf: number;
}

export interface CenterDataset {
  centers: Center[];
  activations: Activation[];
  /** When the dataset was last curated (epoch ms). */
  curatedAt: number;
}
