// Leonida Fieldbook — the tracker. Loads app/data/trophies.json, keeps the reader's progress in
// localStorage (it never leaves the browser), and renders the checklist, the staged roadmap, the
// missables and the sources through render.js. Works fully offline: the only fetch is the app's
// own data file.
import {
  cardHTML, citationLine, detailHTML, roadmapHTML, sourcesHTML,
} from './render.js';

const KEY = 'leonida-fieldbook-v1';
const params = new URLSearchParams(location.search);

const doc = await (await fetch('data/trophies.json')).json();
const TROPHIES = doc.trophies;
const byId = new Map(TROPHIES.map((t) => [t.id, t]));
const byName = new Map(TROPHIES.map((t) => [t.name, t]));

// Demo seed, used only for the maker's screenshots (?demo=1): 13 earned, four counters part way.
const DEMO_EARNED = [2, 3, 8, 16, 18, 20, 21, 32, 35, 36, 46, 53, 55];
const DEMO_COUNTERS = { 15: 87, 28: 6, 31: 41, 48: 173 };

let state = load();
if (params.get('demo') === '1' && !state.seeded) {
  state.earned = [...DEMO_EARNED];
  state.counters = { ...DEMO_COUNTERS };
  state.seeded = true;
  save();
}
if (params.get('spoilers') === 'off') state.spoilers = false;
if (params.get('spoilers') === 'on') state.spoilers = true;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && Array.isArray(raw.earned)) {
      return {
        earned: raw.earned, counters: raw.counters ?? {}, notes: raw.notes ?? {},
        spoilers: raw.spoilers !== false, seeded: !!raw.seeded,
      };
    }
  } catch { /* fall through to a fresh state */ }
  return { earned: [], counters: {}, notes: {}, spoilers: true, seeded: false };
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

const earnedSet = () => new Set(state.earned);
const isEarned = (t) => earnedSet().has(t.id);
const isHidden = (t) => state.spoilers && t.hidden && !isEarned(t);
function toggleEarned(t) {
  const s = earnedSet();
  if (s.has(t.id)) s.delete(t.id); else s.add(t.id);
  state.earned = [...s];
  save();
  renderAll();
}
function setCounter(t, value) {
  const v = Math.max(0, Math.min(t.target, Math.round(Number(value) || 0)));
  state.counters[t.id] = v;
  save();
  renderAll();
}
function setNote(t, text) {
  state.notes[t.id] = text;
  save();
}

const $ = (id) => document.getElementById(id);
const els = {
  citeStats: $('citeStats'), citeSummary: $('citeSummary'),
  progressText: $('progressText'), progressPct: $('progressPct'), progressFill: $('progressFill'),
  gradeCounts: $('gradeCounts'), q: $('q'), grade: $('grade'), kind: $('kind'),
  missableOnly: $('missableOnly'), unconfirmedOnly: $('unconfirmedOnly'),
  earnedFilter: $('earnedFilter'), spoilers: $('spoilers'),
  cards: $('cards'), resultCount: $('resultCount'), emptyState: $('emptyState'),
  missableCards: $('missableCards'), roadmapStages: $('roadmapStages'),
  sourceList: $('sourceList'), verifyText: $('verifyText'), trophyDetail: $('trophyDetail'),
};

function ctxFor(t) {
  return { earned: isEarned(t), hidden: isHidden(t), counterValue: state.counters[t.id] ?? 0, note: state.notes[t.id] ?? '' };
}

function filtered() {
  const q = els.q.value.trim().toLowerCase();
  const grade = els.grade.value;
  const kind = els.kind.value;
  return TROPHIES.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (kind !== 'all' && t.kind !== kind) return false;
    if (els.missableOnly.checked && !t.missable) return false;
    if (els.unconfirmedOnly.checked && t.confirmed) return false;
    if (els.earnedFilter.value === 'earned' && !isEarned(t)) return false;
    if (els.earnedFilter.value === 'remaining' && isEarned(t)) return false;
    if (q) {
      const hay = [t.name, t.description, t.guide, ...(t.steps ?? []).map((s) => s.text)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const n = state.earned.length;
  const pct = Math.round((n / TROPHIES.length) * 100);
  els.progressText.textContent = `${n} of ${TROPHIES.length} earned`;
  els.progressPct.textContent = `${pct}%`;
  els.progressFill.style.width = `${pct}%`;
  els.gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const total = TROPHIES.filter((t) => t.grade === g).length;
    const got = TROPHIES.filter((t) => t.grade === g && isEarned(t)).length;
    return `${got}/${total} ${g}`;
  }).join(' · ');
}

function renderChecklist() {
  const list = filtered();
  els.cards.innerHTML = list.map((t) => cardHTML(t, ctxFor(t))).join('');
  els.resultCount.textContent = `Showing ${list.length} of ${TROPHIES.length} trophies${state.spoilers ? ' · spoiler hiding on: hidden trophies stay covered until earned' : ' · spoiler hiding off'}`;
  els.emptyState.hidden = list.length > 0;
}

function renderMissables() {
  els.missableCards.innerHTML = TROPHIES.filter((t) => t.missable).map((t) => cardHTML(t, ctxFor(t))).join('');
}

function renderRoadmap() {
  els.roadmapStages.innerHTML = roadmapHTML(doc, { isEarned, isHidden });
}

function renderSources() {
  els.citeStats.textContent = citationLine(doc);
  els.citeSummary.textContent = `${citationLine(doc)} — across ${TROPHIES.length} trophies and ${doc.sources.length} publications. If a step below cites nothing, it does not exist: there are no uncited steps in this fieldbook.`;
  els.sourceList.innerHTML = sourcesHTML(doc);
  els.verifyText.textContent = doc.verification;
}

function renderDetail(id) {
  const t = byId.get(id);
  if (!t) { showView('checklist'); return; }
  els.trophyDetail.innerHTML = detailHTML(t, ctxFor(t));
}

const VIEWS = ['checklist', 'roadmap', 'missables', 'sources', 'trophy'];
function showView(view) {
  for (const v of VIEWS) {
    const el = document.getElementById(`view-${v}`);
    if (el) el.hidden = v !== view;
  }
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
}
function currentView() {
  const v = params.get('view');
  if (v === 'trophy') return 'trophy';
  return ['checklist', 'roadmap', 'missables', 'sources'].includes(v) ? v : 'checklist';
}
function renderAll() {
  renderProgress();
  renderSources();
  renderChecklist();
  renderMissables();
  renderRoadmap();
  const openId = Number(params.get('open') ?? params.get('id') ?? 0);
  if (currentView() === 'trophy' && openId) renderDetail(openId);
  showView(currentView());
}

function setParams(patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) params.delete(k); else params.set(k, v);
  }
  history.replaceState(null, '', `${location.pathname}?${params}`);
}

// Events are delegated, so re-renders never lose a handler.
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (tab) { setParams({ view: tab.dataset.view, open: null, id: null }); renderAll(); return; }
  const open = e.target.closest('[data-open]');
  if (open) { setParams({ view: 'trophy', open: open.dataset.open }); renderAll(); window.scrollTo(0, 0); return; }
  const earn = e.target.closest('[data-earn]');
  if (earn) { toggleEarned(byId.get(Number(earn.dataset.earn))); return; }
  const inc = e.target.closest('[data-inc]');
  if (inc) { const t = byId.get(Number(inc.dataset.inc)); setCounter(t, (state.counters[t.id] ?? 0) + 1); return; }
  const dec = e.target.closest('[data-dec]');
  if (dec) { const t = byId.get(Number(dec.dataset.dec)); setCounter(t, (state.counters[t.id] ?? 0) - 1); return; }
});
document.addEventListener('change', (e) => {
  const counter = e.target.closest('[data-counter]');
  if (counter) { setCounter(byId.get(Number(counter.dataset.counter)), counter.value); return; }
  const note = e.target.closest('[data-note]');
  if (note) { setNote(byId.get(Number(note.dataset.note)), note.value); return; }
  if (e.target === els.spoilers) { state.spoilers = els.spoilers.checked; save(); renderAll(); return; }
  if ([els.grade, els.kind, els.missableOnly, els.unconfirmedOnly, els.earnedFilter].includes(e.target)) renderChecklist();
});
els.q.addEventListener('input', renderChecklist);
$('backBtn').addEventListener('click', () => { setParams({ view: 'checklist', open: null, id: null }); renderAll(); });

$('exportBtn').addEventListener('click', () => {
  const payload = {
    app: 'leonida-fieldbook', game: 'Grand Theft Auto VI', version: 1,
    exported_at: new Date().toISOString(),
    earned: TROPHIES.filter(isEarned).map((t) => t.name),
    counters: Object.fromEntries(Object.entries(state.counters).map(([id, v]) => [byId.get(Number(id)).name, v])),
    notes: Object.fromEntries(Object.entries(state.notes).map(([id, v]) => [byId.get(Number(id)).name, v])),
    spoilers: state.spoilers,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    state.earned = (data.earned ?? []).map((n) => byName.get(n)).filter(Boolean).map((t) => t.id);
    state.counters = {};
    for (const [name, v] of Object.entries(data.counters ?? {})) {
      const t = byName.get(name);
      if (t && t.target) state.counters[t.id] = Math.max(0, Math.min(t.target, Math.round(Number(v) || 0)));
    }
    state.notes = {};
    for (const [name, v] of Object.entries(data.notes ?? {})) {
      const t = byName.get(name);
      if (t) state.notes[t.id] = String(v);
    }
    if (typeof data.spoilers === 'boolean') state.spoilers = data.spoilers;
    save();
    renderAll();
  } catch {
    alert('That file is not a Leonida Fieldbook progress export.');
  }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks, counters and notes?')) return;
  state = { earned: [], counters: {}, notes: {}, spoilers: state.spoilers, seeded: state.seeded };
  save();
  renderAll();
});

// Initial filter values from the URL (deep links and the maker's screenshots).
if (params.get('q')) els.q.value = params.get('q');
if (params.get('grade')) els.grade.value = params.get('grade');
if (params.get('kind')) els.kind.value = params.get('kind');
if (params.get('missable') === '1') els.missableOnly.checked = true;
if (params.get('unconfirmed') === '1') els.unconfirmedOnly.checked = true;
els.spoilers.checked = state.spoilers;
renderAll();
