# SafeHaven STL — Demo Video Narration Script

**Target ~2:45 (CAC video must be 1–3 minutes).** Read at a calm, clear pace.
On-screen = what the judge should see while you talk. Cut between a screen
recording of the app (clips in `demo/`) and the deck slides
(`demo/SafeHaven-CAC-deck.pptx`).

---

## 0:00 – 0:30 · The hook (problem)

> On-screen: Title slide, then the "problem" slide.

"Every winter and every summer, St. Louis opens warming and cooling centers to
keep people from dying of exposure — the unhoused, the elderly, people with
disabilities. But to find one, you have to dig through scattered city web pages,
PDFs, and a phone line. The people who need a safe place the most are the ones
least able to do that, on the worst day to be doing it.

I built SafeHaven so finding shelter from the weather takes seconds."

---

## 0:30 – 1:30 · The app (proof)

> On-screen: Screen recording — Find screen with the emergency banner → filter →
> a center → Directions/Call.

"This is SafeHaven, running on my phone. The moment it opens, I see St. Louis
warming and cooling centers — and when the City declares Code Blue or a heat
emergency, this banner tells me the centers are open right now.

I can filter to just warming or just cooling, or turn on 'near me' to see the
closest centers first, with the distance to each. And this cooling data is live —
it comes straight from the Missouri state health department's feed. I can tap 'open
now' to hide anywhere that's already closed, so I don't walk to a locked door.
Every center has the two things a person in crisis actually needs: a big Directions
button and a big Call button. No account. No forms. No typing.

And here's the part that matters most: there's a curated copy of everything in the
app, so if the live feed or the network is down, it still works — because the
person who needs it might have a dying prepaid phone and no connection at all."

---

## 1:30 – 2:10 · How it's built (credibility)

> On-screen: the three architecture slides.

"Under the hood, it's React Native and TypeScript, with a clean, tested
architecture. Cooling centers come live from the Missouri DHSS government feed;
warming centers are curated from the City's list, because the City has no warming
API. Every screen reads from a single store, and the data layer is isolated behind
one seam — so the live feed merges in, and falls back to the curated copy, without
touching a screen.

I was careful to be honest about what the app knows: it labels what's live versus
curated, 'open now' means open by listed hours, and every center says 'call 2-1-1
to confirm.' Because for a tool people trust with their safety, pretending to know
more than I do would be worse than useless."

---

## 2:10 – 2:40 · Close

> On-screen: the app on your real phone, then the closing slide.

"This is a real, installable app, with 29 St. Louis centers, that works on any
phone in any weather. Next I want to sync the City's live emergency status, add
food and overnight shelters, and translate it for St. Louis's Spanish, Bosnian,
and Vietnamese communities.

But the goal stays simple: when it's dangerous outside, a safe place should be
one tap away — for the people who need it most. Thanks for watching."

---

## Recording tips
- Screen-record the app (Android Quick Settings → Screen Record, or QuickTime on
  the web build). Turn ON location so 'near me' shows real distances.
- The honest framing ("community reference, call 2-1-1") is a strength — say it
  with confidence; judges respect a student who knows the limits of their data.
- If your district caps the video at a hard 3:00, this already fits with margin.
