// Leonida Fieldbook — rendering. Pure builders that turn the data file (app/data/trophies.json)
// and the tracker's state into HTML strings. app.js owns the state and the events; this file owns
// the shapes: trophy cards with their cited steps, the detail view, the staged roadmap, and the
// sources page. The citation statistics are computed here from the data itself, so the numbers the
// app prints are always the numbers the data holds.

export const KIND_LABELS = {
  story: 'Story', side: 'Side character', activity: 'Activity', collectible: 'Collectible',
  crime: 'Crime', exploration: 'Exploration', secret: 'Secret',
  completion: '100% completion', platinum: 'Platinum',
};

// Short names for step-level citations; the full labels and links live in the data's sources list.
export const SOURCE_SHORT = {
  exophase: 'Exophase',
  psnprofiles: 'PSNProfiles',
  powerpyx: 'PowerPyx',
  gtabase: 'GTABase',
  outputlag: 'OutputLag',
  howtovideogame: 'HowToVideoGame',
  alcasthq: 'AlcastHQ',
};

export function esc(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

// The signature count: every step of every trophy, every citation on those steps, and how the
// citations spread across the publications. Counted from the data, never typed by hand.
export function citationStats(doc) {
  let steps = 0;
  let citations = 0;
  const perSource = new Map();
  for (const t of doc.trophies) {
    for (const step of t.steps ?? []) {
      steps += 1;
      for (const key of step.sources ?? []) {
        citations += 1;
        perSource.set(key, (perSource.get(key) ?? 0) + 1);
      }
    }
  }
  return { steps, citations, publications: perSource.size, perSource };
}

export function citationLine(doc) {
  const s = citationStats(doc);
  return `${s.steps} steps · ${s.citations} source citations · every step sourced`;
}

function gradeBadge(t) {
  return `<span class="badge ${t.grade}">${t.grade}</span>`;
}

export function badges(t) {
  const out = [gradeBadge(t)];
  if (t.kind !== t.grade) out.push(`<span class="badge kind">${KIND_LABELS[t.kind] ?? t.kind}</span>`);
  out.push(`<span class="badge stage">Stage ${t.stage}</span>`);
  if (t.hidden) out.push('<span class="badge hidden-flag">Hidden</span>');
  if (t.missable) out.push('<span class="badge missable">Possibly missable</span>');
  if (!t.confirmed) out.push('<span class="badge unconfirmed">Method unconfirmed</span>');
  return out.join('');
}

// One trophy's steps as a numbered list, each step carrying its own citations beneath it —
// the fieldbook's signature: no step stands without the publication it rests on.
export function stepsHTML(t) {
  const items = (t.steps ?? []).map((step) => {
    const names = (step.sources ?? []).map((k) => SOURCE_SHORT[k] ?? k).join(', ');
    return `<li>${esc(step.text)}<span class="step-src">${esc(names)}</span></li>`;
  }).join('');
  return `<ol class="steps">${items}</ol>`;
}

export function citesLine(t) {
  const n = (t.steps ?? []).length;
  const c = (t.steps ?? []).reduce((sum, s) => sum + (s.sources ?? []).length, 0);
  return `${n} steps · ${c} citations`;
}

export function counterHTML(t, value) {
  if (!t.target) return '';
  return `<div class="counter"><button type="button" data-dec="${t.id}" aria-label="Decrease counter">−</button><input type="number" min="0" max="${t.target}" value="${value}" data-counter="${t.id}" aria-label="Progress towards ${t.target}"><button type="button" data-inc="${t.id}" aria-label="Increase counter">+</button><span class="target-label">/ ${t.target.toLocaleString('en-US')}</span></div>`;
}

// A checklist card. ctx: { earned, hidden (spoiler-concealed), counterValue }.
export function cardHTML(t, ctx) {
  const head = `<div class="card-head">
      <input type="checkbox" ${ctx.earned ? 'checked' : ''} data-earn="${t.id}" aria-label="Mark ${ctx.hidden ? 'hidden trophy' : esc(t.name)} earned">
      <div class="card-title">
        <h3>${ctx.hidden ? 'Hidden trophy' : `<button type="button" data-open="${t.id}">${esc(t.name)}</button>`}</h3>
        ${ctx.hidden ? '' : `<p class="official">&ldquo;${esc(t.description)}&rdquo;</p>`}
        <div class="badges">${badges(t)}</div>
      </div>
    </div>`;
  const body = ctx.hidden
    ? `<p class="hidden-note">Hidden on PlayStation until earned — its name, description and guide stay covered until you earn it in the game (or switch the spoiler setting off). Tick it off once it pops.</p>`
    : `<p class="guide">${esc(t.guide)}</p>${stepsHTML(t)}${counterHTML(t, ctx.counterValue)}<p class="card-cites">${citesLine(t)} — each step names its source above.</p>`;
  return `<article class="card grade-${t.grade}${ctx.earned ? ' earned' : ''}${t.missable ? ' missable-card' : ''}" data-id="${t.id}">${head}${body}</article>`;
}

// The single-trophy view: official text, the full guide, every cited step, the counter, and the
// reader's own notes box. ctx: { earned, hidden, counterValue, note }.
export function detailHTML(t, ctx) {
  const head = `<div class="card-head">
      <input type="checkbox" ${ctx.earned ? 'checked' : ''} data-earn="${t.id}" aria-label="Mark ${ctx.hidden ? 'hidden trophy' : esc(t.name)} earned">
      <div class="card-title">
        <h3>${ctx.hidden ? 'Hidden trophy' : esc(t.name)}</h3>
        <div class="badges">${badges(t)}</div>
      </div>
    </div>`;
  const body = ctx.hidden
    ? `<p class="hidden-note">Hidden on PlayStation until earned — its name, description and guide stay covered until you earn it in the game (or switch the spoiler setting off). Tick it off once it pops.</p>`
    : `<p class="official">Official description: &ldquo;${esc(t.description)}&rdquo;</p>
       <p class="guide">${esc(t.guide)}</p>
       ${stepsHTML(t)}
       ${counterHTML(t, ctx.counterValue)}
       <p class="card-cites">${citesLine(t)} — every step above names the publication it rests on; the full source list is in the Sources &amp; method tab.</p>
       <div class="note-box"><label for="note-${t.id}">Your notes</label><textarea id="note-${t.id}" data-note="${t.id}" placeholder="Where you found it, what worked, what to try next&hellip;">${esc(ctx.note)}</textarea></div>`;
  return `<article class="card detail grade-${t.grade}${ctx.earned ? ' earned' : ''}${t.missable ? ' missable-card' : ''}">${head}${body}</article>`;
}

// The roadmap: the data's four stages, each with its text and a chip per trophy it clears.
// ctx helpers: isEarned(t), isHidden(t) — spoiler state applied to the chips.
export function roadmapHTML(doc, ctx) {
  return doc.roadmap.map((stage) => {
    const chips = doc.trophies.filter((t) => t.stage === stage.stage).map((t) => {
      const label = ctx.isHidden(t) ? 'Hidden trophy' : esc(t.name);
      return `<span class="chip ${t.grade}${ctx.isEarned(t) ? ' earned' : ''}${t.missable ? ' missable' : ''}">${label}</span>`;
    }).join('');
    return `<section class="stage">
      <div class="stage-head"><span class="stage-num">${stage.stage}</span><h3>${esc(stage.title)}</h3><span class="stage-meta">${esc(stage.meta)}</span></div>
      <p class="stage-text">${esc(stage.text)}</p>
      <div class="chips">${chips}</div>
    </section>`;
  }).join('');
}

// The sources page: every publication, what it covers, and — counted live — how many steps cite it.
export function sourcesHTML(doc) {
  const stats = citationStats(doc);
  return doc.sources.map((s) => {
    const n = stats.perSource.get(s.key) ?? 0;
    const cited = n > 0
      ? `<p class="cited-in">Cited by ${n} step${n === 1 ? '' : 's'} in this fieldbook.</p>`
      : `<p class="cited-in">Cited in the verification above.</p>`;
    return `<div class="source-item"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a><p>${esc(s.covers)}</p>${cited}</div>`;
  }).join('');
}
