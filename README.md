# SafeHaven STL

A St. Louis **warming & cooling center finder** — one place to find a safe,
temperature-controlled space when the weather turns dangerous, built for the
people who need it most: the unhoused, the elderly, and anyone without a car or
a reliable phone.

Built with **Expo SDK 52 + React Native + TypeScript** and **expo-router**.
Runs on Android, iOS, and web.

## The problem

When St. Louis declares Code Blue (extreme cold) or a heat emergency, the City
opens warming and cooling centers — but that information is scattered across
press releases, PDFs, and separate web pages. There is no single app. SafeHaven
puts every center in one place.

## What it does

- **Find help** — all St. Louis warming/cooling centers, **nearest first**, each
  with one-tap **Directions** and **Call**.
- **Live cooling data** — cooling centers come live from the **Missouri DHSS** feed
  (58 St. Louis centers); warming is curated from the City list (no warming API).
- **Open now** — each center shows a live Open / Closed / Hours-vary badge computed
  from its hours, with a one-tap **Open now** filter.
- **Filter** — 🔥 Warming / ❄️ Cooling / All, plus 📍 **Near me** (GPS, 3/5/10 mi).
- **Emergency banner** — surfaces when Code Blue / a heat emergency is active.
- **Center detail** — hours, services, the real phone number, and an honest
  "call 2-1-1 to confirm" note.
- **Built for crisis use** — big tap targets, works offline, light/dark/system
  theme, screen-reader labels, favorites.

## Honest scope

- **Cooling data is live** from the Missouri DHSS ArcGIS feed (updates irregularly,
  weather-driven — not second-by-second). **Warming is curated** from the City's
  published list, because the City offers no warming API (only "call 2-1-1"). The
  app merges both, labels which is which, and **falls back to the curated set** if
  the live feed is unreachable (native fetches it directly; the web build uses
  `scripts/dhss-cors-proxy.cjs`).
- "Open now" means "open per listed hours" — hours can change and sites close in
  severe weather, so the app always says "call to confirm."
- Still a **community reference, not an official City service.**
  `EXPO_PUBLIC_FORCE_ACTIVE=warming|cooling|both` forces the emergency banner on for
  demos; `EXPO_PUBLIC_DHSS_URL` points the web build at the CORS proxy.

## Architecture

```
app/                       expo-router screens
  (tabs)/ index|about|settings
  center/[id].tsx          center detail
src/
  types/center.ts          domain model
  data/
    centers.ts             curated St. Louis dataset (warming + fallback)
    liveCooling.ts         LIVE MO DHSS cooling-center adapter
    dataset.ts             centers + activation state
    storage.ts             AsyncStorage JSON cache
  store/AppStore.tsx       settings, favorites, location, live-merge
  ui/ theme.tsx geo.ts hours.ts components.tsx
scripts/dhss-cors-proxy.cjs  web-only CORS proxy for the DHSS feed
```

## Run it

```bash
npm install
npm run web      # browser preview
npm run android  # emulator / device
npm run typecheck
npm test
```

## Build an installable APK

```bash
./build-apk.sh   # pins Node 20, runs eas login/init/build -p android --profile preview
```

## Data sources

- City of St. Louis — Warming Centers: https://www.stlouis-mo.gov/live-work/warming-centers.cfm
- City of St. Louis — Cooling Sites: https://www.stlouis-mo.gov/live-work/summer/cooling-centers.cfm
- United Way 2-1-1: https://www.211helps.org/
