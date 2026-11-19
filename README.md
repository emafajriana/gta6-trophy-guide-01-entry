[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/emafajriana/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/emafajriana/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden). Open `app/index.html` in a desktop browser — it works with the network off and never fetches anything.

## What it does

- **Checklist** — every trophy with its exact official name, description and grade, a tick box saved in your browser (localStorage), and a progress bar with per-grade counts.
- **Guides in our own words** — every trophy has a guide (what to do, where, how, when it can be missed) with its sources named. No guide text is copied from anywhere.
- **Counters** — trophies with a PSN progress target (250 stunts, 42 Shooting Range golds, 18 meditations, 500 profile actions…) get a stepper that saves your count.
- **Filters** — by grade, kind, missable, unconfirmed, earned/remaining, plus full-text search.
- **Spoiler setting** — on by default: the 28 hidden trophies stay hidden until you earn them (or switch the setting off).
- **Roadmap to the Platinum** — four steps from the story to 100% completion, with the three rules that protect the Platinum (~200 hours, difficulty 4/10, one playthrough, no online trophies).
- **Missables** — exactly one trophy can be missed: *Positive Mental Attitude* (Lucia's Chapter 1 balcony meditation). Everything else can be finished in free-roam after the story.
- **Export / import** — save your progress as a JSON file and bring it back on any machine. Notes per trophy, saved with it.
- **Sources & method** — every source is listed, with what was verified and what was not.

## Verification (19 November 2026)

All 55 names, descriptions and grades were checked against **Exophase** and **PSNProfiles**, which agree on all 55. PSN progress targets are from PSNProfiles. Guide method comes from PowerPyx, GTABase, AlcastHQ, OutputLag and HowToVideoGame, cited per trophy.

**Honest gaps:** no published guide had confirmed a method for *In The Beginning…*, *Capital Offense*, *Bad Luck, I Guess*, *The Truth Is Out There* and *Ten Pin* when this was built, and the exact animal for *Fair Game* was still being confirmed. Those guides say so plainly instead of inventing a location — use the “Unconfirmed only” filter to see them.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

Or just open `app/index.html` directly (served over HTTP is recommended; the app fetches its own `app/data/trophies.json`).

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.

## Screenshots

1. `1-checklist.jpg` — checklist, spoiler hiding on, 13 of 55 earned.
2. `2-guide.jpg` — detail view: *Cunning Stunts*, counter 87/250, sources.
3. `3-roadmap.jpg` — the road to the Platinum.
4. `4-missables.jpg` — the one possibly-missable trophy.

## About

An unofficial, fan-made guide. Not affiliated with Rockstar Games; no Rockstar logo or official artwork is used. License: MIT.
