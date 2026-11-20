// Leonida Fieldbook — the hand-in program for gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is the static web app in app/ beside this file: plain files, no build step, opened
// at app/index.html and working with the network off. This program hands it in: it copies app/ and
// screenshots/ into the output directory and writes dossier.json there — the summary the judge reads
// (the screenshots, the first load's files and bytes, and the source outline) — using the kit's
// vendored library. vendor/makefun-frontend.ts stays exactly as the kit ships it: the scorer rebuilds
// the dossier with its own copy and requires the two to match byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps are the scorer's own (the gate's limits): at most 4 screenshots of at most 256 KiB each,
// at most 993 files and directories and 48 MiB in app/, and the dossier's text capped at 160 KiB.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// The fieldbook's promise, enforced at hand-in: every step of every trophy's guide names at least
// one source. Read the copied data back and refuse to hand in a guide with an uncited step — the
// counts printed here are the same counts the app shows its readers.
const data = JSON.parse(readFileSync(join(out, 'app', 'data', 'trophies.json'), 'utf8'));
let steps = 0;
let citations = 0;
for (const trophy of data.trophies) {
  if (!trophy.guide || !trophy.guide.trim()) throw new Error(`trophy ${trophy.id} has a blank guide`);
  for (const step of trophy.steps ?? []) {
    steps += 1;
    if (!step.sources || step.sources.length === 0) {
      throw new Error(`trophy ${trophy.id} (${trophy.name}) has an uncited step: ${step.text}`);
    }
    citations += step.sources.length;
  }
}
console.log(`Leonida Fieldbook: ${data.trophies.length} trophies, ${steps} steps, ${citations} citations — every step sourced.`);
console.log(`Dossier written: ${Buffer.byteLength(dossier)} bytes.`);
