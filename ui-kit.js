/* Beyond Client — UI Kit (vanilla JS, no build) */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Back link: return to the dashboard when we came from it ---------- */
const fromDash = new URLSearchParams(location.search).get('from') === 'dashboard';
$$('#kitBack, #kitBack2').forEach(a => { a.href = fromDash ? 'index.html#dashboard' : 'index.html'; });

/* ---------- Copy helper ---------- */
async function copy(text, el, cls = 'copied') {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (_) {} t.remove();
  }
  el.classList.add(cls); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove(cls), 1100);
}

/* ==========================================================
   COLOURS — [name, css var | null, hex/value, note]
   Anything with a css var is read live from styles.css :root.
   ========================================================== */
const COLORS = {
  brand: [
    ['Navy', '--navy', '#0F1B3D', 'Top bar, primary buttons'],
    ['Ink', '--ink', '#0A1A4F', 'Headings, body text'],
    ['Blue', '--blue', '#2F6BFF', 'Focus ring, chart line'],
    ['Blue Dark', '--blue-d', '#1E4FE0', 'Links, Load text'],
    ['Amber', '--amber', '#F5A700', 'Secondary chart series'],
    ['Amber Dark', '--amber-d', '#B07A00', 'Eyebrow, amber text'],
    ['Sun', null, 'linear-gradient(135deg,#FFE27A,#FFB800)', 'Logo, active tab'],
    ['Gold', null, '#FFC93C', 'Interest pill, arrow accent'],
  ],
  text: [
    ['Ink', '--ink', '#0A1A4F', 'Primary text'],
    ['Muted 2', '--muted-2', '#4B5B8C', 'Labels, secondary text'],
    ['Muted', '--muted', '#6B7AA8', 'Captions, table headers'],
    ['Faint', '--faint', '#8793B8', 'Placeholders, hints'],
    ['Ghost', '--ghost', '#A3AED0', 'Zeros, disabled values'],
  ],
  surface: [
    ['White', null, '#FFFFFF', 'Page, cards'],
    ['Soft', '--soft', '#F5F8FE', 'Inputs, tiles'],
    ['Head', '--head', '#F1F5FF', 'Table header'],
    ['Line', '--line', '#E3EAF7', 'Input & tab borders'],
    ['Line 2', '--line-2', '#E6ECF7', 'Card borders'],
    ['Row line', '--row-line', 'rgba(10,26,79,.07)', 'Table row dividers'],
    ['Blue tint', null, '#E8EFFF', 'First tile, load chip'],
    ['Blue tint 2', null, '#EEF3FF', 'Count, ghost button'],
  ],
  status: [
    ['Live green', '--green', '#4ADE80', 'Live dot, positive delta'],
    ['Success', null, '#17B26A', 'Hero KPI, toast, surplus'],
    ['Red', '--red', '#E0334A', 'Errors, hot idle'],
    ['Red soft', null, '#FF8A8A', 'Negative delta on navy'],
    ['Red tint', null, '#FDECEE', 'Modal icon background'],
    ['Interest hero', null, 'linear-gradient(117.5deg,#C8F7DC,#5EE0A0 50%,#17B26A)', 'Interest KPI card'],
  ],
  metric: [
    ['Load', null, '#2F6BFF', 'Chip #E8EFFF · column #D6E3FF'],
    ['Contacted', null, '#0A6C9B', 'Chip #D2F1FF · column #CDEFFF'],
    ['Contacted dot', null, '#00A3E0', 'Table header dot'],
    ['Interest', null, '#FFC93C', 'Pill · column #FFE9A6'],
    ['Interest text', null, '#7A4E00', 'Text on amber column'],
    ['Heat', null, 'rgba(30,79,224,.12)', 'Heat cells: .12 → .73 alpha'],
  ],
};
let nColors = 0;
$$('[data-sw]').forEach(host => {
  const list = COLORS[host.dataset.sw] || [];
  nColors += list.length;
  host.innerHTML = list.map(([name, v, val, note]) => {
    const live = v ? (cssVar(v) || val) : val;
    const alpha = /rgba|gradient/.test(live);
    return `<button type="button" class="sw" data-copy="${esc(v ? `var(${v})` : live)}" data-hex="${esc(live)}" aria-label="Copy ${esc(name)}">
      <div class="sw-c${alpha ? ' checker' : ''}"><i style="background:${esc(live)}"></i></div>
      <div class="sw-t"><b>${esc(name)}</b><code>${esc(live.length > 26 ? 'gradient' : live.toUpperCase().replace('RGBA', 'rgba'))}</code>${v ? `<code>${v}</code>` : ''}<em>${esc(note)}</em></div>
      <span class="sw-copied">COPIED</span></button>`;
  }).join('');
});
$('[data-stat="colors"]').textContent = nColors;
document.addEventListener('click', e => {
  const sw = e.target.closest('.sw'); if (!sw) return;
  copy(e.shiftKey ? sw.dataset.copy : sw.dataset.hex, sw); /* click = value, shift-click = var(--token) */
});

/* ==========================================================
   TYPOGRAPHY SCALE
   ========================================================== */
const TYPE = [
  ['KPI value', 'Poppins 700 · 44/1.5 · −1 px', 'KPI cards (clamps 34–44)', 'font:700 44px/1.2 var(--font-d);letter-spacing:-1px', '7,103'],
  ['Page title', 'Poppins 700 · 32/1.25 · −0.6 px', '.title', 'font:700 32px/1.25 var(--font-d);letter-spacing:-.6px', 'Performance Overview'],
  ['Login heading', 'Poppins 700 · 28/1.2 · −0.6 px', '.login-head h1', 'font:700 28px/1.2 var(--font-d);letter-spacing:-.6px', 'Welcome back'],
  ['Modal title', 'Poppins 700 · 24/1.2 · −0.4 px', '.modal h3', 'font:700 24px/1.2 var(--font-d);letter-spacing:-.4px', 'Log out?'],
  ['Panel title', 'Poppins 700 · 20/1.3 · −0.3 px', '.ph2 h2', 'font:700 20px/1.3 var(--font-d);letter-spacing:-.3px', 'Performance Agent'],
  ['Card title', 'Poppins 700 · 16/1.3', '.ch-h h2, .ta-h h2', 'font:700 16px/1.3 var(--font-d)', 'Time Average'],
  ['Body', 'Inter 400 · 14/1.4', 'body, inputs, descriptions', 'font:400 14px/1.4 var(--font-u)', 'Log in to your performance dashboard'],
  ['Label', 'Inter 600 · 13', '.field label, .nm, .mi', 'font:600 13px/1.4 var(--font-u)', 'Username'],
  ['Caption', 'Inter 400 · 12', '.kpi-cmp, .hint, footers', 'font:400 12px/1.4 var(--font-u);color:var(--muted)', 'vs 5,501 last month'],
  ['Eyebrow', 'Inter 600 · 12 · +1.2 px · upper', '.eyebrow', 'font:600 12px/1.25 var(--font-u);letter-spacing:1.2px;text-transform:uppercase;color:var(--amber-d)', 'Tuesday, 3 November 2026'],
  ['Overline', 'Inter 700 · 11 · +1 px · upper', '.kpi-lbl, .chip', 'font:700 11px/1.4 var(--font-u);letter-spacing:1px;text-transform:uppercase;color:var(--muted)', 'Avg idle time'],
  ['Micro', 'Inter 600 · 10 · +1 px · upper', '.tile b', 'font:600 10px/1.4 var(--font-u);letter-spacing:1px;text-transform:uppercase;color:var(--muted)', 'Coaching'],
];
$('#typeScale').innerHTML = TYPE.map(([n, spec, use, st, sample]) =>
  `<div class="ty"><div class="ty-s" style="${st}">${esc(sample)}</div><div class="ty-m"><b>${esc(n)}</b><span>${esc(spec)}</span><span>${esc(use)}</span></div></div>`).join('');

/* ==========================================================
   RADIUS / SPACING / SHADOW
   ========================================================== */
const RADII = [[6, 'kbd'], [8, 'badge, rep'], [10, 'dp-d, tip'], [12, 'btn-dl, search'], [14, 'input, tab'], [16, 'btn-login, tile'], [18, 'popover'], [20, 'nav, tabs'], [24, 'card'], [28, 'modal, login'], [999, 'pill, chip']];
$('#radiusGrid').innerHTML = RADII.map(([r, u]) => `<div class="rd"><i style="border-radius:${r}px"></i><b>${r === 999 ? 'Full' : r + ' px'}</b><span>${u}</span></div>`).join('');

const SPACING = [[4, 'tab gap'], [6, 'tabs padding'], [8, 'icon / label gap'], [10, 'pill row gap'], [12, 'control gap'], [14, 'section gap in cards'], [16, 'grid & card gap'], [20, 'card padding · page gap'], [24, 'demo padding'], [28, 'login gap'], [32, 'page padding'], [40, 'card padding (login)']];
$('#spacingList').innerHTML = SPACING.map(([s, u]) => `<div class="sp"><b>${s} px</b><span>${(s / 16).toFixed(3).replace(/\.?0+$/, '')} rem</span><div style="display:flex;align-items:center"><i style="width:${s * 4}px"></i><em>${u}</em></div></div>`).join('');

const SHADOWS = [
  ['Card', '--card-shadow', '0 8px 24px rgba(10,26,79,.08)', ''],
  ['Card hover', null, '0 14px 32px rgba(10,26,79,.12)', ''],
  ['Popover', null, '0 16px 36px rgba(10,26,79,.15)', ''],
  ['Login card', null, '0 24px 56px rgba(10,26,79,.12)', ''],
  ['Modal', null, '0 28px 64px rgba(10,26,79,.25)', ''],
  ['Navy bar', null, '0 10px 28px rgba(15,27,61,.25)', 'dk'],
  ['Toast', null, '0 16px 32px rgba(15,27,61,.35)', 'dk'],
  ['Primary button', null, '0 10px 22px rgba(15,27,61,.25)', 'dk'],
  ['Active tab (amber)', null, '0 6px 16px rgba(255,184,0,.4)', ''],
  ['Hero KPI (green)', null, '0 16px 36px rgba(23,178,106,.4)', ''],
];
$('#shadowGrid').innerHTML = SHADOWS.map(([n, v, val, c]) => {
  const live = v ? (cssVar(v) || val) : val;
  return `<div class="sh ${c}"><i style="box-shadow:${esc(live)}"></i><div><b>${n}</b><code>${esc(live)}</code></div></div>`;
}).join('');

/* ==========================================================
   MOTION
   ========================================================== */
const EASES = [
  ['ease-out', '--ease-out', 'cubic-bezier(.23, 1, .32, 1)', 'Press, hover, entrances'],
  ['ease-io', '--ease-io', 'cubic-bezier(.65, 0, .35, 1)', 'Exits, chart draw'],
  ['spring', '--spring', 'cubic-bezier(.34, 1.4, .64, 1)', 'Modal & toast pop-in'],
];
$('#easeGrid').innerHTML = EASES.map(([n, v, val, use]) => {
  const live = cssVar(v) || val;
  return `<div class="mo"><div class="mo-track" data-ease="${esc(live)}"><div class="mo-dot" style="transition:transform ${reduce ? 0 : 700}ms ${esc(live)}"></div></div>
    <div><b>${n}</b><br><code>${esc(live)}</code><br><span class="kit-note">${use}</span></div>
    <button class="btn-dl btn-ghost mo-play" type="button" style="justify-self:start">Play</button></div>`;
}).join('');
const runDist = t => Math.max(0, t.clientWidth - 6 - 32 - 6);
$$('.mo').forEach(m => {
  const track = $('.mo-track', m);
  $('.mo-play', m).addEventListener('click', () => {
    track.style.setProperty('--run', runDist(track) + 'px');
    track.classList.toggle('go');
  });
});

/* ==========================================================
   HEATMAP
   ========================================================== */
const binCall = v => v === 0 ? 0 : v <= 12 ? .12 : v <= 39 ? .24 : v <= 59 ? .36 : v <= 99 ? .54 : .73;
const heatCell = (v, bin) => {
  const a = bin(v);
  if (a === 0) return `<div class="hcell"><div class="hc z" style="background:#F3F6FF">${v}</div></div>`;
  return `<div class="hcell"><div class="hc${a >= .73 ? ' w' : ''}" style="background:rgba(30,79,224,${a})">${v}</div></div>`;
};
const HEAT_ROWS = [
  ['LATIFAH FITRI NAYLA', 146, [23, 39, 42, 22, 25, 64, 2], 217],
  ['Nova Widia Ulan Sari', 146, [22, 40, 63, 19, 63, 97, 1], 305],
  ['RR Fausta Xeviera Estuningtyas', 146, [29, 46, 56, 43, 62, 103, 3], 342],
  ['DIAN CHAERUNISAH', 145, [22, 80, 47, 38, 13, 56, 0], 256],
];
const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];
$('#heatDemo').innerHTML =
  `<div class="tr th" role="row"><div>#</div><div>Agent Name</div><div class="c-load"><i class="d" style="background:#2F6BFF"></i>Load</div>${HOURS.map((h, i) => `<div class="hr${i > 6 ? ' off' : ''}">${h}</div>`).join('')}<div class="tt">Total</div></div>` +
  HEAT_ROWS.map(([n, l, h, t], i) => `<div class="tr td" role="row"><div><span class="badge">${i + 1}</span></div><div><span class="nm">${esc(n)}</span></div><div class="s-load2">${l}</div>${[...h, 0, 0, 0].map(v => heatCell(v, binCall)).join('')}<div><span class="tot2">${t}</span></div></div>`).join('') +
  `<div class="tr td avg" role="row"><div></div><div><span class="nm">Average</span></div><div class="s-load2" style="background:transparent">145</div>${[29, 53, 53, 48, 25, 73, 3, 0, 0, 0].map(v => `<div class="hcell"><div class="hc">${v}</div></div>`).join('')}<div><span class="tot2">284</span></div></div>`;

const BUCKETS = [['0', 0], ['1 – 12', .12], ['13 – 39', .24], ['40 – 59', .36], ['60 – 99', .54], ['100 +', .73]];
$('#heatScale').innerHTML = BUCKETS.map(([r, a]) => `<div class="kit-cap"><div class="hc${a >= .73 ? ' w' : ''}${a === 0 ? ' z' : ''}" style="width:96px;height:44px;border-radius:12px;background:${a === 0 ? '#F3F6FF' : `rgba(30,79,224,${a})`};box-shadow:none">${r}</div><small>${a === 0 ? '#F3F6FF' : `alpha ${a}`}</small></div>`).join('');

/* ==========================================================
   DATE PICKER (static: November 2026)
   ========================================================== */
(() => {
  const el = $('#dpDemo'); if (!el) return;
  const m = 10, first = new Date(2026, m, 1), dim = new Date(2026, m + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
  let cells = '<span></span>'.repeat(off);
  for (let d = 1; d <= dim; d++) {
    const dis = d > 22, sel = d === 3, td = d === 22;
    cells += `<button type="button" class="dp-d${sel ? ' sel' : ''}${td ? ' today' : ''}" ${dis ? 'disabled' : ''} aria-label="${d} November 2026">${d}</button>`;
  }
  el.innerHTML = `<div class="dp-h"><button class="dp-b" type="button" aria-label="Previous month">‹</button><b>November 2026</b><button class="dp-b" type="button" disabled aria-label="Next month">›</button></div>
    <div class="dp-w">${['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(w => `<span>${w}</span>`).join('')}</div><div class="dp-g">${cells}</div>
    <div class="dp-f"><span>Data available until 22 Nov 2026</span><button class="dp-t" type="button">Today</button></div>`;
  el.addEventListener('click', e => {
    const d = e.target.closest('.dp-d'); if (!d || d.disabled) return;
    $$('.dp-d.sel', el).forEach(x => x.classList.remove('sel')); d.classList.add('sel');
  });
})();

/* ==========================================================
   ICONS
   ========================================================== */
const ICONS = [
  ['user', 'Field · 20', '0 0 20 20', 1.7, '<circle cx="10" cy="7" r="3.5"/><path d="M3.5 17c.6-3.2 3.2-5 6.5-5s5.9 1.8 6.5 5"/>'],
  ['lock', 'Field · 20', '0 0 20 20', 1.7, '<rect x="4" y="9" width="12" height="8" rx="2.2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>'],
  ['eye', 'Toggle · 20', '0 0 20 20', 1.7, '<path d="M1.8 10S5 4.5 10 4.5 18.2 10 18.2 10 15 15.5 10 15.5 1.8 10 1.8 10Z"/><circle cx="10" cy="10" r="2.4"/>'],
  ['arrow-right', 'Button · 20', '0 0 20 20', 2.2, '<path d="M4 10h12M11 5l5 5-5 5"/>'],
  ['logout', 'Bar · 16', '0 0 16 16', 1.8, '<path d="M6.5 2.5h-2a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 1.5 1.5h2M10 5l3 3-3 3M13 8H6.5"/>'],
  ['chevron-down', 'Pill · 16', '0 0 16 16', 2, '<path d="M3.5 6l4.5 4.5L12.5 6"/>'],
  ['download', 'Button · 16', '0 0 16 16', 1.8, '<path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/>'],
  ['check', 'Menu / toast · 16', '0 0 16 16', 2, '<path d="M3 8.5 6.5 12 13 4.5"/>'],
  ['arrow-left', 'Back · 16', '0 0 16 16', 1.8, '<path d="M13 8H3M7 4 3 8l4 4"/>'],
];
const svgOf = ([, , vb, sw, body], size) => `<svg ${size ? `width="${size}" height="${size}" ` : ''}viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const TRI = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1.5l4 7H1z" fill="currentColor"/></svg>';
$('#iconGrid').innerHTML = ICONS.map(ic => `<button type="button" class="ic" data-svg="${esc(svgOf(ic))}" aria-label="Copy ${ic[0]} icon">${svgOf(ic)}<b>${ic[0]}</b><small>${ic[1]}</small></button>`).join('')
  + `<button type="button" class="ic" data-svg="${esc(TRI)}" aria-label="Copy triangle icon">${TRI}<b>triangle</b><small>Delta · 10 (fill)</small></button>`;
document.addEventListener('click', e => { const ic = e.target.closest('.ic'); if (ic) copy(ic.dataset.svg, ic); });

/* ==========================================================
   LIVE DEMOS
   ========================================================== */
/* password eye */
const eye = $('#kitEye');
if (eye) eye.addEventListener('click', () => {
  const inp = $('#kf2'), show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  eye.setAttribute('aria-pressed', String(show)); eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

/* pill chevron */
const pc = $('#pillChev');
if (pc) pc.addEventListener('click', () => pc.setAttribute('aria-expanded', String(pc.getAttribute('aria-expanded') !== 'true')));

/* tabs */
const tabs = $('#kitTabs'), ind = $('#kitTabInd');
function placeInd() {
  const t = $('.tab[aria-selected="true"]', tabs); if (!t || !t.offsetWidth) return;
  if (!ind.dataset.placed) { ind.style.transition = 'none'; ind.dataset.placed = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { ind.style.transition = ''; })); }
  ind.style.width = t.offsetWidth + 'px'; ind.style.transform = `translateX(${t.offsetLeft}px)`;
}
function selectTab(b) { $$('.tab', tabs).forEach(x => x.setAttribute('aria-selected', String(x === b))); placeInd(); }
tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) selectTab(b); });
tabs.addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const all = $$('.tab', tabs), i = all.indexOf(document.activeElement);
  const n = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length]; n.focus(); selectTab(n); e.preventDefault();
});
addEventListener('resize', placeInd);
placeInd();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInd);

/* live modal + toast (mirror app.js behaviour) */
const layer = $('#layer');
function closeModal() {
  const s = $('.scrim'); if (!s) return;
  if (reduce) s.remove(); else { s.classList.add('out'); setTimeout(() => s.remove(), 180); }
  const o = $('#kitOpenModal'); if (o) o.focus();
}
$('#kitOpenModal').addEventListener('click', () => {
  const s = document.createElement('div'); s.className = 'scrim';
  s.innerHTML = `<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="mT" aria-describedby="mP">
    <div class="m-ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 2.5h-2a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 1.5 1.5h2M10 5l3 3-3 3M13 8H6.5"/></svg></div>
    <h3 id="mT">Log out?</h3><p id="mP">This is a preview. Nothing will happen when you confirm.</p>
    <div class="m-btns"><button class="m-cancel" type="button">Cancel</button><button class="m-ok" type="button">Log out</button></div></div>`;
  layer.appendChild(s);
  s.addEventListener('pointerdown', e => { if (e.target === s) closeModal(); });
  $$('button', s).forEach(b => b.addEventListener('click', closeModal));
  s.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const b = $$('button', s), i = b.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { b[b.length - 1].focus(); e.preventDefault(); }
    else if (!e.shiftKey && i === b.length - 1) { b[0].focus(); e.preventDefault(); }
  });
  $('.m-cancel', s).focus();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('.scrim')) closeModal(); });

let toastT;
$('#kitShowToast').addEventListener('click', () => {
  $$('#layer .toast').forEach(t => t.remove()); clearTimeout(toastT);
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
  t.innerHTML = `<div class="toast-i"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:#fff"><path d="M3 8.5 6.5 12 13 4.5"/></svg></div><div class="toast-t"><b>Download started</b><span>performance_agent_2026-11-03.csv</span></div><div class="toast-bar"></div>`;
  layer.appendChild(t);
  toastT = setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 200); }, 2400);
});

/* ==========================================================
   SCROLL-SPY (sidebar)
   ========================================================== */
const links = $$('.kit-side a'), byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
const setActive = id => links.forEach(a => a.setAttribute('aria-current', String(a === byId.get(id))));
const secs = $$('.kit-sec');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => {
    const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (vis) setActive(vis.target.id);
  }, { rootMargin: '-96px 0px -65% 0px', threshold: 0 });
  secs.forEach(s => io.observe(s));
}
setActive((location.hash || '#overview').slice(1));
links.forEach(a => a.addEventListener('click', () => setActive(a.getAttribute('href').slice(1))));
})();
