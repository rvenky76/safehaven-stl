# SafeHaven STL — Congressional App Challenge Submission

## What is your app and what does it do?

**SafeHaven STL** is a mobile app that helps people in St. Louis find a warming or
cooling center — a safe, temperature-controlled place — when the weather turns
dangerous. It puts every center in one place: nearest to you first, with one tap to
get directions or make a call, and it keeps working even on a cheap phone with
little or no data.

Open the app and you immediately see St. Louis warming and cooling centers. Tap
🔥 Warming or ❄️ Cooling to filter, or turn on 📍 Near me to show only the centers
within a few miles of where you're standing — closest on top. Each center shows its
address, hours, and the two things a person in crisis actually needs: a big
**Directions** button and a big **Call** button. A banner at the top surfaces when
the City has declared Code Blue (extreme cold) or a heat emergency.

## What problem does it solve, and why does it matter?

When St. Louis hits dangerous cold or heat, the City opens warming and cooling
centers. But that information is **scattered** — across separate web pages, PDFs,
press releases, and a 2-1-1 phone line. The people who need a safe place the most —
people experiencing homelessness, the elderly, people with disabilities, and anyone
without a car — are often the same people least able to dig through government
websites to find one. In extreme weather, that gap isn't an inconvenience. People
die of exposure every year.

I built SafeHaven so that finding shelter from the weather takes seconds, not a
search through city websites — and so it works for the person who actually needs it:
someone outside, under stress, with an old phone, a dying battery, and no data plan.

## How is this different from what already exists?

There are broad "social services" directories — national apps like findhelp, and
local web pages like CompassionSTL — but they share the same blind spots SafeHaven
is built around:

- **No single St. Louis app aggregates the warming/cooling centers.** The city's
  own lists are the source of truth, and they live on two separate web pages.
- **It uses live government data and tells you what's open now.** Cooling centers
  come live from the Missouri DHSS feed, and the app computes open/closed from each
  center's hours — so you don't set out for a place that's already closed.
- **The existing tools assume a connection.** They're online directories, built for
  a caseworker at a desk. SafeHaven ships a curated fallback in the app and works
  fully offline — the point of failure for the person who needs it most.
- **None are built for a crisis.** SafeHaven is: two giant buttons (Directions,
  Call), no account, no forms, no typing, large tap targets, light/dark themes, and
  a full screen-reader experience.

## How does it work? (technical summary)

SafeHaven is built with **React Native, Expo (SDK 52), and TypeScript**, so one
codebase runs on Android, iOS, and the web.

- **Live data where a government feed exists.** Cooling centers come LIVE from the
  **Missouri DHSS public cooling-center feed** (an ArcGIS service the state updates
  as the weather changes) — 58 St. Louis-area centers with real hours. Warming
  centers are curated from the City's published list, because the City offers no
  warming API, only "call 2-1-1." The app merges the two and labels which is which.
- **"Open now."** The app parses each center's published hours and shows a live
  Open / Closed / Hours-vary badge against the device clock, with a one-tap "Open
  now" filter — so you don't walk to a center that's already closed.
- **Clean, swappable architecture.** Every screen reads from a single store; the
  data layer is isolated behind one seam, so the live source drops in (and falls
  back to the curated list on any failure) without touching a screen. The geo,
  distance, and hours-parsing logic is unit-tested.
- **Works offline.** The curated set ships in the bundle, so even if the live feed
  or the network is unavailable, the app still shows centers and works.
- **Location + near-me.** GPS with a timeout and a last-known-position fallback, a
  radius filter (3/5/10 mi), and nearest-first sorting using a haversine distance.
- **Accessibility + theming** are first-class: screen-reader labels on every
  control, a live-region emergency banner, and a light / dark / system theme.

## Honesty as a design principle

A tool for vulnerable people has to be truthful, so SafeHaven never overstates what
it knows. Cooling data is genuinely live from the Missouri DHSS feed — but I label
exactly what *is* and *isn't* live: warming centers are a curated city list (no
warming API exists), the DHSS feed updates irregularly (weather-driven, not
second-by-second), hours can change, and sites can close in severe weather. So every
center says "call 2-1-1 or the center to confirm," approximate coordinates are
flagged, "open now" is clearly "open per listed hours," and the app is labeled a
community reference, not an official City service. Being honest about the edges of
what I know is the whole point when someone is trusting the app in dangerous weather.

## What was the hardest part, and what did I learn?

The hardest part wasn't the UI — it was the **data and the honesty**. The City
publishes warming/cooling centers across scattered pages with no API, so I curated a
real dataset by hand — then went looking for live sources and found the Missouri
DHSS cooling feed, which I wired in behind a clean data seam so it merges with the
curated warming list and falls back gracefully when it's down. The hard judgment
was representing what I *can't* know — warming has no live feed, the DHSS feed
updates irregularly, hours change — without misleading someone whose safety depends
on it. I learned that for a civic app, trustworthiness is a feature you design
("call to confirm," "open per listed hours," labeling live-vs-curated), not a
disclaimer you bury. And I learned how much a clean architecture pays off: the live
feed, near-me, open-now, theming, and accessibility all slotted in without rewrites.

## What would I add next?

- Sync warming-center activation from the City's Code Blue status (no API yet — would
  need scraping or a city partnership).
- Let community partners submit hour corrections, verified before they publish.
- Add nearby food pantries and overnight shelters behind the same data seam.
- Multilingual support (Spanish, Bosnian, Vietnamese — large St. Louis communities).

---

*Built with React Native / Expo / TypeScript. Live cooling data from the Missouri
DHSS public feed; warming centers curated from the City of St. Louis's published
list. A community reference, not an official City service — call 2-1-1 to confirm.
Original work created during the 2025–2026 CAC eligibility window. Runs on Android,
iOS, and web.*
