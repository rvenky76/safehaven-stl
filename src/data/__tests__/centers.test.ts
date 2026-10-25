import { CENTERS } from '../centers';

describe('CENTERS dataset integrity', () => {
  it('has a reasonable number of St. Louis centers', () => {
    expect(CENTERS.length).toBeGreaterThanOrEqual(25);
  });

  it('every center has valid St. Louis coordinates and required fields', () => {
    for (const c of CENTERS) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.address).toMatch(/MO 63\d{3}/);
      expect(c.services.length).toBeGreaterThan(0);
      // St. Louis metro bounding box sanity.
      expect(c.location.latitude).toBeGreaterThan(38.5);
      expect(c.location.latitude).toBeLessThan(38.8);
      expect(c.location.longitude).toBeLessThan(-90.1);
      expect(c.location.longitude).toBeGreaterThan(-90.4);
      expect(c.source).toBeTruthy();
    }
  });

  it('center ids are unique', () => {
    const ids = CENTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has both warming and cooling centers', () => {
    expect(CENTERS.some((c) => c.services.includes('warming'))).toBe(true);
    expect(CENTERS.some((c) => c.services.includes('cooling'))).toBe(true);
  });
});
