import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as Location from 'expo-location';

import type { Activation, Center, CenterService, GeoPoint } from '@/types/center';
import { loadDataset } from '@/data/dataset';
import { fetchLiveCoolingCenters } from '@/data/liveCooling';
import { KEYS, readJSON, writeJSON } from '@/data/storage';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  /** Which service to show: warming, cooling, or both. */
  service: CenterService | 'both';
  /** Show only centers within nearbyRadiusMiles of the user. */
  nearbyOnly: boolean;
  nearbyRadiusMiles: number;
  /** Show only centers that are open right now (by published hours). */
  openNowOnly: boolean;
  /** Pull live cooling-center data from the MO DHSS feed when available. */
  liveData: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  service: 'both',
  nearbyOnly: false,
  nearbyRadiusMiles: 5,
  openNowOnly: false,
  liveData: true,
};

interface StoreState {
  centers: Center[];
  activations: Activation[];
  curatedAt: number;
  settings: AppSettings;
  favorites: string[];
  userLocation: GeoPoint | null;
  locationStatus: 'idle' | 'granted' | 'denied' | 'unavailable';
  /** Status of the live cooling-data fetch. */
  liveStatus: 'off' | 'loading' | 'live' | 'fallback';
  /** Count of centers currently coming from the live feed. */
  liveCount: number;
}

interface StoreActions {
  updateSettings: (patch: Partial<AppSettings>) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  requestLocation: () => Promise<void>;
  activationFor: (service: CenterService) => Activation | undefined;
}

type StoreValue = StoreState & StoreActions;

const StoreContext = createContext<StoreValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const dataset = useMemo(() => loadDataset(), []);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<StoreState['locationStatus']>('idle');
  const [liveCooling, setLiveCooling] = useState<Center[] | null>(null);
  const [liveStatus, setLiveStatus] = useState<StoreState['liveStatus']>('off');
  const hydrated = useRef(false);

  // Fetch live cooling centers from MO DHSS when liveData is on. Cooling-only
  // feed, so we MERGE: curated warming + live cooling (live replaces curated
  // cooling). Falls back silently to the curated dataset on any error.
  useEffect(() => {
    if (!settings.liveData) {
      setLiveStatus('off');
      setLiveCooling(null);
      return;
    }
    let cancelled = false;
    setLiveStatus('loading');
    fetchLiveCoolingCenters()
      .then((live) => {
        if (cancelled) return;
        if (live.length > 0) {
          setLiveCooling(live);
          setLiveStatus('live');
        } else {
          setLiveCooling(null);
          setLiveStatus('fallback');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLiveCooling(null);
        setLiveStatus('fallback');
      });
    return () => {
      cancelled = true;
    };
  }, [settings.liveData]);

  // Effective center list: when live cooling is present, use curated non-cooling
  // (warming-only) + live cooling; otherwise the full curated dataset.
  const centers = useMemo<Center[]>(() => {
    if (!liveCooling) return dataset.centers;
    const curatedNonCoolingOnly = dataset.centers.filter(
      (c) => !(c.services.length === 1 && c.services[0] === 'cooling'),
    );
    return [...curatedNonCoolingOnly, ...liveCooling];
  }, [dataset.centers, liveCooling]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedSettings, savedFavs] = await Promise.all([
        readJSON<AppSettings>(KEYS.settings, DEFAULT_SETTINGS),
        readJSON<string[]>(KEYS.favorites, []),
      ]);
      if (cancelled) return;
      setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      setFavorites(savedFavs);
      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated.current) void writeJSON(KEYS.settings, settings);
  }, [settings]);
  useEffect(() => {
    if (hydrated.current) void writeJSON(KEYS.favorites, favorites);
  }, [favorites]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        setUserLocation(null);
        return;
      }
      const getFresh = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 8000),
      );
      let coords: GeoPoint | null = null;
      try {
        const pos = (await Promise.race([getFresh, timeout])) as Location.LocationObject;
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch {
        const last = await Location.getLastKnownPositionAsync();
        if (last) coords = { latitude: last.coords.latitude, longitude: last.coords.longitude };
      }
      if (coords) {
        setUserLocation(coords);
        setLocationStatus('granted');
      } else {
        setLocationStatus('unavailable');
      }
    } catch {
      setLocationStatus('unavailable');
      setUserLocation(null);
    }
  }, []);

  useEffect(() => {
    if (settings.nearbyOnly && !userLocation && locationStatus === 'idle') {
      void requestLocation();
    }
  }, [settings.nearbyOnly, userLocation, locationStatus, requestLocation]);

  const activationFor = useCallback(
    (service: CenterService) => dataset.activations.find((a) => a.service === service),
    [dataset.activations],
  );

  const value = useMemo<StoreValue>(
    () => ({
      centers,
      activations: dataset.activations,
      curatedAt: dataset.curatedAt,
      settings,
      favorites,
      userLocation,
      locationStatus,
      liveStatus,
      liveCount: liveCooling?.length ?? 0,
      updateSettings,
      toggleFavorite,
      isFavorite,
      requestLocation,
      activationFor,
    }),
    [
      centers,
      dataset,
      settings,
      favorites,
      userLocation,
      locationStatus,
      liveStatus,
      liveCooling,
      updateSettings,
      toggleFavorite,
      isFavorite,
      requestLocation,
      activationFor,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within AppProvider');
  return ctx;
}
