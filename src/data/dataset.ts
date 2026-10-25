import type { Activation, CenterDataset } from '@/types/center';
import { CENTERS } from '@/data/centers';

/**
 * Current City emergency activation state.
 *
 * IMPORTANT: this is curated/operator-set metadata, NOT a live government feed.
 * The City declares "Code Blue" (cold) and "Heat Emergency" (hot); centers
 * meaningfully open during those windows. We seed a default "inactive" state
 * and let the UI explain that the rider should call 211 to confirm. A future
 * version would sync this from the City's Code Blue status page.
 *
 * `EXPO_PUBLIC_FORCE_ACTIVE` can force a service active for demos ("warming",
 * "cooling", or "both").
 */
function buildActivations(): Activation[] {
  const now = Date.now();
  const force =
    typeof process !== 'undefined' && process.env
      ? process.env.EXPO_PUBLIC_FORCE_ACTIVE
      : undefined;

  const warmingActive = force === 'warming' || force === 'both';
  const coolingActive = force === 'cooling' || force === 'both';

  return [
    {
      service: 'warming',
      active: warmingActive,
      label: warmingActive ? 'Code Blue active' : 'No Code Blue declared',
      asOf: now,
    },
    {
      service: 'cooling',
      active: coolingActive,
      label: coolingActive ? 'Heat emergency active' : 'No heat emergency declared',
      asOf: now,
    },
  ];
}

export function loadDataset(): CenterDataset {
  return {
    centers: CENTERS,
    activations: buildActivations(),
    curatedAt: Date.parse('2026-10-24T00:00:00Z'),
  };
}
