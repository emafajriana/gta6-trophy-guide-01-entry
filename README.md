[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/emafajriana/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/emafajriana/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Fieldbook — GTA VI Trophy Guide & Tracker

**168 steps. 237 source citations. Every step sourced.**

A complete, offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5 — all 55 official trophies with their exact names, descriptions and grades — built around one rule most guides skip: **every step of every trophy's guide names the publication it rests on**, printed under the step itself. No uncited claims, no "trust me": if a step cites nothing, it is not in the book. The hand-in program enforces the rule — it refuses to build the dossier if any step lacks a citation — and the app counts the totals live from its own data, so the numbers above are the numbers in the output.

## What it does

- **Tracker** — tick trophies off as they pop; progress bar and per-grade counts; your state saves in your browser (localStorage) and never leaves it. Counter trophies (250 stunt jumps, 500 profile actions, $250,000 laundered…) get steppers and numeric inputs that clamp at the official PSN target.
- **Cited guidance** — each trophy carries a plain-words guide plus numbered steps, and every step ends with its sources (PowerPyx, PSNProfiles, Exophase, GTABase, OutputLag, HowToVideoGame). The Sources & method tab lists all 7 publications and shows, counted live, how many steps cite each one.
- **Roadmap to the Platinum** — four stages rendered from the data (story → people & pastimes → the long tail → the 100% push), each naming the trophies it clears, plus the three rules that protect the run: no cheats before the Platinum, manual saves at every chapter edge, and the Chapter 1 meditation.
- **Missables, honestly labelled** — exactly one trophy is even *possibly* missable (Positive Mental Attitude, a Chapter 1 deadline), flagged from the official descriptions; a watch-list covers the near-misses. Six trophies whose methods no publication has confirmed are labelled **Method unconfirmed** in the app, with the leading idea marked as a guess — never dressed up as fact.
- **Spoiler setting** — the 28 hidden trophies stay covered (name, description and guide) until you earn them, or until you switch the setting off.
- **Filters & search** — by grade, kind (story / side characters / activities / collectibles / crime / exploration / secret / completion), missable-only, unconfirmed-only, earned state, and full-text search across names, descriptions, guides and steps.
- **Export / import** — progress moves between browsers and machines as a small JSON file keyed by trophy name; notes per trophy included.
- **Offline by construction** — plain static files, no build step, no network references, no Rockstar logo or official artwork; the look is the fieldbook's own.

## Verification

Name, official description and grade for all 55 trophies were cross-checked between Exophase and PSNProfiles (the two agree on all 55); the hidden split — 28 hidden: 12 story, 6 side-character, 10 secret — was cross-checked against AlcastHQ; PSN progress targets are PSNProfiles' figures. Guide steps rest on the publications cited under each step. What could not be verified is labelled, in the app and here: 6 trophies have no confirmed published method yet, and 1 is possibly missable.

## Run it

Node 22, standard library only, nothing to install:

```
node serve.ts            # serves app/ on http://localhost:8080
```

or open `app/index.html` in a desktop browser. Deep links: `?view=roadmap`, `?view=missables`, `?view=sources`, `?view=trophy&open=28`, `?spoilers=off`, `?demo=1` (a seeded demo state, used for the screenshots).

## Repository layout

- `app/` — the guide itself: `index.html` (checklist, roadmap, missables, sources and detail views), `style.css`, `app.js` (tracker state, filters, export/import), `render.js` (the HTML builders and the citation counter), `data/trophies.json` (all 55 trophies: official text, guides, cited steps, the source list, the roadmap stages).
- `screenshots/` — four JPEGs of the running app at 1280×800, inventoried in `shots.json`.
- `main.ts` — the hand-in program (see below). `serve.ts` — the local preview server.
- `vendor/makefun-frontend.ts` — the kit's vendored dossier library, byte-identical to the kit's copy, as the run contract requires.

## Hand-in (make.fun)

```
MAKEFUN_OUTPUT_DIR=<output dir> node main.ts
```

copies `app/` and `screenshots/` into the output directory, audits the copied data (blank guide or uncited step = hard failure, with the citation totals printed), and writes `dossier.json` — the entry summary the judge reads — with the kit's vendored `buildDossier`, under the gate's caps (at most 4 screenshots of at most 256 KiB, dossier text at most 160 KiB, app/ at most 993 entries and 48 MiB). The run is deterministic: two runs from the same tree produce byte-identical output.
