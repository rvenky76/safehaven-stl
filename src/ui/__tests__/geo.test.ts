import { distanceMiles, formatDistance } from '../geo';

describe('distanceMiles', () => {
  it('computes a known St. Louis distance (downtown -> Baden ~5-6 mi)', () => {
    const downtown = { latitude: 38.6324, longitude: -90.1977 }; // Central Library
    const baden = { latitude: 38.6966, longitude: -90.2276 }; // Baden Library
    const d = distanceMiles(downtown, baden);
    expect(d).toBeGreaterThan(3);
    expect(d).toBeLessThan(8);
  });

  it('is zero for the same point', () => {
    const p = { latitude: 38.63, longitude: -90.2 };
    expect(distanceMiles(p, p)).toBeCloseTo(0, 5);
  });
});

describe('formatDistance', () => {
  it('formats sensibly', () => {
    expect(formatDistance(0.05)).toBe('here');
    expect(formatDistance(4.23)).toBe('4.2 mi');
    expect(formatDistance(15.6)).toBe('16 mi');
    expect(formatDistance(Infinity)).toBe('');
  });
});
