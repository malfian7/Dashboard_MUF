/* Beyond Client — MUF Telesales Dashboard (vanilla JS, no build) */
(() => {
'use strict';
const D = window.BC_DATA;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const still = /still/.test(location.hash); if (still) document.documentElement.classList.add('still');
const reduce = still || matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 60) : ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtN = n => Number(n).toLocaleString('en-US');
const pad = n => String(n).padStart(2, '0');
const toSec = t => { const [h, m, s] = t.split(':').map(Number); return h * 3600 + m * 60 + s; };
const fmtT = s => { s = Math.max(0, Math.round(s)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`; };

/* ---------------- Static data ---------------- */
const TODAY = new Date(2026, 9 + 1, 3); // 3 Nov 2026
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const MONTHS_T = MONTHS.map(m => m[0] + m.slice(1).toLowerCase());
const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const CAMPAIGNS = ['MUF TELESALES', 'MUF COLLECTION', 'MUF RETENTION', 'MUF WELCOME CALL'];
const TABS = ['Summary', 'TL 1', 'TL 2', 'TL 3'];
const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];

const KPI = [
  { load: 7103, dLoad: 1602, loadPrev: 5501, con: 1244, dCon: -485, rate: '17.51%', conPrev: '1,729 (31.43%)', int: 31, dInt: 3, irate: '2.49%', intPrev: '28 (1.62%)', idle: '00:17:31', dIdle: 384, rel: '00:49:48', dRel: 23 },
  { load: 2464, dLoad: 556, loadPrev: 1908, con: 431, dCon: -169, rate: '17.49%', conPrev: '600 (31.45%)', int: 15, dInt: 1, irate: '3.48%', intPrev: '14 (2.33%)', idle: '00:20:27', dIdle: 560, rel: '00:47:05', dRel: -140 },
  { load: 2320, dLoad: 523, loadPrev: 1797, con: 381, dCon: -184, rate: '16.42%', conPrev: '565 (31.44%)', int: 8, dInt: 1, irate: '2.10%', intPrev: '7 (1.24%)', idle: '00:19:16', dIdle: 489, rel: '00:47:45', dRel: -100 },
  { load: 2319, dLoad: 523, loadPrev: 1796, con: 432, dCon: -132, rate: '18.63%', conPrev: '564 (31.40%)', int: 8, dInt: 1, irate: '1.85%', intPrev: '7 (1.24%)', idle: '00:12:42', dIdle: 96, rel: '00:55:27', dRel: 362 },
];
const TIME_AVG = [['Login', '04:09:21'], ['Work', '00:01:06'], ['Oncall', '00:01:02'], ['Idle', '00:00:04'], ['Coaching', '00:00:00'], ['Pray', '00:04:37'], ['Rest', '01:00:13'], ['Lunch', '00:48:29'], ['Toilet', '00:02:07'], ['Release', '00:35:42']];
const CALL_AVG = [[145, [29, 53, 53, 48, 25, 73, 3], 284], [145, [28, 56, 49, 47, 26, 68, 3], 278], [145, [29, 51, 54, 55, 26, 71, 4], 291], [145, [28, 52, 55, 42, 23, 81, 3], 284]];
const CON_AVG = [[145, [4, 6, 7, 4, 1, 4, 0], 25], [145, [4, 6, 7, 4, 1, 4, 0], 25], [145, [3, 6, 6, 4, 1, 3, 0], 24], [145, [4, 6, 7, 5, 0, 5, 0], 27]];

/* chart config — paths and coordinates extracted from the design */
const XS = [52, 144.4, 237, 329.2, 422, 514.1, 588];
const XL = [['Oct 5', 52], ['Oct 10', 144], ['Oct 15', 237], ['Oct 20', 329], ['Oct 25', 422], ['Oct 30', 514], ['Nov 3', 588]];
const DAYS = ['OCT 5', 'OCT 10', 'OCT 15', 'OCT 20', 'OCT 25', 'OCT 30', 'TODAY · 3 NOV'];
const CHARTS = [
  {
    id: 'ctc', title: 'CTC & Interest', sub: 'Daily · Last 30 days',
    legend: [['#2F6BFF', 'CTC (left)', '#0A1A4F'], ['#F5A700', 'Interest (right)', '#B07A00']],
    yl: ['2.4k', '1.8k', '1.2k', '600', '0'], yr: ['120', '90', '60', '30', '0'],
    line: D.charts.ctcPath, iline: D.charts.intPath, iy: 165.3,
    peak: 'Peak 1,920', low: 'Low 980',
    tl: ['CTC', 'Interest'],
    vals: [['1,320', '24'], ['1,480', '29'], ['1,830', '38'], ['1,480', '29'], ['1,190', '20'], ['1,340', '27'], ['1,244', '31']],
    by: [40, 29.3, 6, 29.3, 48.7, 38.7, 45.1].map(v => v + 92),
    ay: [22.7, 16, 4, 16, 28, 18.7, 13.4].map(v => v + 165.3),
  },
  {
    id: 'ppd', title: 'PPD Interest & PPD All', sub: 'Daily · Last 30 days',
    legend: [['#2F6BFF', 'PPD All', '#0A1A4F'], ['#F5A700', 'PPD Interest', '#B07A00']],
    yl: ['20', '15', '10', '5', '0'], yr: null,
    line: D.charts.ppdAllPath, iline: D.charts.ppdIntPath, iy: 172,
    peak: 'Peak 16', low: null,
    tl: ['PPD All', 'PPD Interest'],
    vals: [['4', '1'], ['8', '2'], ['14', '5'], ['9', '3'], ['5', '1'], ['8', '2'], ['6', '2']],
    by: [96, 64, 16, 56, 88, 64, 80].map(v => v + 92),
    ay: [40, 32, 8, 24, 40, 32, 32].map(v => v + 172),
  },
];

/* ---------------- Derived data ---------------- */
const agents = D.agents.map((a, i) => ({ ...a, idx: i + 1, tl: (i + 1) % 3 === 1 ? 1 : (i + 1) % 3 === 2 ? 2 : 3 }));
const tlOf = new Map(agents.map(a => [a.n.toLowerCase(), a.tl]));
const tlByName = (n, i) => tlOf.get(n.toLowerCase()) || ((i + 1) % 3 === 1 ? 1 : (i + 1) % 3 === 2 ? 2 : 3);

/* ---------------- State ---------------- */
const state = { tab: 0, date: new Date(TODAY), campaign: 0, loading: false, dpMonth: 10, q: '' };
const isToday = d => d.getFullYear() === 2026 && d.getMonth() === 10 && d.getDate() === 3;
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lastMonth = d => {
  const pm = d.getMonth() - 1; const dim = new Date(d.getFullYear(), pm + 1, 0).getDate();
  return new Date(d.getFullYear(), pm, Math.min(d.getDate(), dim));
};

/* ---------------- Icons ---------------- */
const TRI = up => `<svg viewBox="0 0 10 10" aria-hidden="true" style="${up ? '' : 'transform:rotate(180deg)'}"><path d="M5 1.5l4 7H1z" fill="currentColor"/></svg>`;
const ICO_DL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/></svg>';
const ICO_CHECK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5"/></svg>';

/* ---------------- Section builders ---------------- */
let rvI = 0;
const rv = () => `style="--i:${rvI++}"`;

function kpiHTML() {
  const k = KPI[state.tab];
  const dl = (v, good, fmt) => `<span class="delta ${good ? 'good' : 'bad'}">${TRI(v >= 0)}${fmt(v)}</span>`;
  const sgn = (v, f = fmtN) => (v >= 0 ? '+' : '-') + f(Math.abs(v));
  return `<section class="kpis" aria-label="Key metrics">
    <article class="card kpi rv" ${rv()}>
      <div class="kpi-top"><span class="chip load"><i></i>Load</span>${dl(k.dLoad, k.dLoad >= 0, v => sgn(v))}</div>
      <div class="kpi-val" data-n="${k.load}" data-k="n">${fmtN(k.load)}</div>
      <div class="kpi-bot"><span class="kpi-rate">Work ${fmtN(k.load)} · 100%</span><span class="kpi-cmp">vs ${fmtN(k.loadPrev)} last month</span></div>
    </article>
    <article class="card kpi rv" ${rv()}>
      <div class="kpi-top"><span class="chip con"><i></i>Contacted</span>${dl(k.dCon, k.dCon >= 0, v => sgn(v))}</div>
      <div class="kpi-val" data-n="${k.con}" data-k="n">${fmtN(k.con)}</div>
      <div class="kpi-bot"><span class="kpi-rate">${k.rate} contact rate</span><span class="kpi-cmp">vs ${k.conPrev}</span></div>
    </article>
    <article class="card kpi hero rv" ${rv()}>
      <div class="kpi-top"><span class="chip int"><i></i>Interest</span>${dl(k.dInt, k.dInt >= 0, v => sgn(v))}</div>
      <div class="kpi-val" data-n="${k.int}" data-k="n">${fmtN(k.int)}</div>
      <div class="kpi-bot"><span class="kpi-rate">${k.irate} interest rate</span><span class="kpi-cmp">vs ${k.intPrev}</span></div>
    </article>
    <article class="card kpi rv" ${rv()}>
      <div class="kpi-top"><span class="kpi-lbl">Avg idle time</span>${dl(k.dIdle, k.dIdle < 0, v => sgn(v, fmtT))}</div>
      <div class="kpi-val" data-n="${toSec(k.idle)}" data-k="t">${k.idle}</div>
      <div class="kpi-bot"><span class="kpi-rate">Avg release ${k.rel}</span><span class="kpi-cmp">vs ${fmtT(toSec(k.idle) - k.dIdle)}</span></div>
    </article>
  </section>`;
}

function timeAvgHTML() {
  return `<section class="card ta rv" ${rv()}>
    <div class="ta-h"><h2>Time Average</h2><span>Average duration per agent today</span></div>
    <div class="tiles">${TIME_AVG.map((t, i) => `<div class="tile${i === 0 ? ' first' : ''}"><b>${t[0]}</b><span>${t[1]}</span></div>`).join('')}</div>
  </section>`;
}

function detailHTML() {
  const k = KPI[state.tab];
  const d = state.date, lm = lastMonth(d);
  const relLM = fmtT(toSec(k.rel) - k.dRel);
  const idleLM = fmtT(toSec(k.idle) - k.dIdle);
  const sd = (v, cls) => `<span class="sd ${cls}">${TRI(v >= 0)}${fmtT(Math.abs(v))}</span>`;
  return `<section class="card panel rv" ${rv()}>
    <div class="ph2"><div class="ph2-l"><h2>Detailed Performance</h2><span class="hint">Today vs. same day last month</span></div>
      <div class="ph2-r"><button class="btn-dl" data-dl="perf">Download CSV</button></div></div>
    <div class="tscroll"><div class="tbl t-det" role="table">
      <div class="tr th" role="row"><div>Date</div><div>PPD Interest</div><div>Avg Release Time</div><div>Avg Idle Time</div></div>
      <div class="tr td" role="row"><div><span class="d-date" id="dDate">${iso(d)} <span class="tag" id="dTag">${isToday(d) ? 'Today' : 'Selected'}</span></span></div><div><span class="d-v g">0</span></div><div><span class="d-v">${k.rel}</span></div><div><span class="d-v">${k.idle}</span></div></div>
      <div class="tr td" role="row"><div><span class="d-date lm" id="dLm">${iso(lm)} <span class="tag lm">Last month</span></span></div><div><span class="d-v g">0</span></div><div><span class="d-v lm">${relLM}</span></div><div><span class="d-v lm">${idleLM}</span></div></div>
      <div class="tr td row-sd" role="row"><div><span class="sd-l"><b>SUR/DEF</b><span>Surplus / deficit</span></span></div><div><span class="d-v g">0</span></div><div>${sd(k.dRel, 'n')}</div><div>${sd(k.dIdle, k.dIdle > 0 ? 'r' : 'gr')}</div></div>
    </div></div>
  </section>`;
}

/* ---- charts ---- */
function chartHTML(c) {
  const sy = +c.line.match(/^M0 ([\d.]+)/)[1];
  const area = `${c.line}L536 128L0 128L0 ${sy}Z`;
  const grid = [60, 100, 140, 180].map(y => `<line x1="44" x2="596" y1="${y}" y2="${y}" stroke="rgba(10,26,79,.08)"/>`).join('') + '<line x1="44" x2="596" y1="220" y2="220" stroke="rgba(10,26,79,.16)"/>';
  const yl = c.yl.map((t, i) => `<text x="36" y="${60 + i * 40}" text-anchor="end" dominant-baseline="central">${t}</text>`).join('');
  const yr = c.yr ? c.yr.map((t, i) => `<text x="604" y="${60 + i * 40}" dominant-baseline="central" style="fill:#B07A00">${t}</text>`).join('') : '';
  const xl = XL.map((x, i) => `<text x="${x[1]}" y="239" text-anchor="middle" dominant-baseline="central"${i === 6 ? ' style="fill:#0A1A4F;font-weight:700"' : ''}>${x[0]}</text>`).join('');
  const peak = `<circle cx="366.2" cy="92" r="3.75" fill="#fff" stroke="#2F6BFF" stroke-width="2.5"/><text x="366" y="75" text-anchor="middle" dominant-baseline="central" style="fill:#1E4FE0;font-weight:700">${c.peak}</text>`;
  const low = c.low ? `<circle cx="162.9" cy="154.7" r="2.75" fill="#fff" stroke="#2F6BFF" stroke-width="2.5"/><text x="162" y="173" text-anchor="middle" dominant-baseline="central" style="fill:#6B7AA8;font-weight:700">${c.low}</text>` : '';
  const tb = c.by[6], ta = c.ay[6];
  const dots = `<circle cx="588" cy="${tb}" r="4.5" fill="#2F6BFF" stroke="#fff" stroke-width="3" style="filter:drop-shadow(0 2px 4px rgba(47,107,255,.5))"/><circle cx="588" cy="${ta}" r="4" fill="#F5A700" stroke="#fff" stroke-width="2.5"/>`;
  return `<article class="card chart rv" ${rv()} data-chart="${c.id}">
    <div class="ch-h"><div><h2>${c.title}</h2><p>${c.sub}</p></div>
      <div class="lg">${c.legend.map(l => `<span style="color:${l[2]}"><i style="background:${l[0]}"></i>${l[1]}</span>`).join('')}</div></div>
    <div class="pw"><div class="plot">
      <svg viewBox="0 0 638 262" role="img" aria-label="${c.title}, daily over the last 30 days">
        <defs><linearGradient id="g-${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F6BFF" stop-opacity=".251"/><stop offset="1" stop-color="#2F6BFF" stop-opacity="0"/></linearGradient></defs>
        ${grid}${yl}${yr}${xl}
        <line x1="588" x2="588" y1="32" y2="220" stroke="rgba(10,26,79,.2)" stroke-dasharray="3 3"/>
        <path class="ar" transform="translate(52 92)" d="${area}" fill="url(#g-${c.id})"/>
        <path class="ln" pathLength="1" transform="translate(52 ${c.iy})" d="${c.iline}" fill="none" stroke="#F5A700" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="ln" pathLength="1" transform="translate(52 92)" d="${c.line}" fill="none" stroke="#2F6BFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${peak}${low}${dots}
        <g class="hov"><line class="hl" y1="32" y2="220" stroke="rgba(10,26,79,.25)"/><circle class="hb" r="4.5" fill="#2F6BFF" stroke="#fff" stroke-width="3"/><circle class="ha" r="4" fill="#F5A700" stroke="#fff" stroke-width="2.5"/></g>
      </svg>
      <div class="tip"></div>
    </div></div>
  </article>`;
}
const chartsHTML = () => `<section class="charts" aria-label="Trends">${CHARTS.map(chartHTML).join('')}</section>`;

function bindChart(root) {
  const c = CHARTS.find(x => x.id === root.dataset.chart);
  const plot = $('.plot', root), tip = $('.tip', plot), hov = $('.hov', plot);
  const hl = $('.hl', hov), hb = $('.hb', hov), ha = $('.ha', hov);
  const show = idx => {
    const v = c.vals[idx];
    tip.innerHTML = `<small>${DAYS[idx]}</small><span>${c.tl[0]} ${v[0]}</span><em>${c.tl[1]} ${v[1]}</em>`;
    const W = plot.clientWidth, w = tip.offsetWidth, x = XS[idx] / 638 * W;
    tip.style.left = Math.max(0, Math.min(W - w, idx === 6 ? 596 / 638 * W - w : x - w / 2)) + 'px';
    if (idx === 6) { hov.classList.remove('on'); return; }
    hl.setAttribute('x1', XS[idx]); hl.setAttribute('x2', XS[idx]);
    hb.setAttribute('cx', XS[idx]); hb.setAttribute('cy', c.by[idx]);
    ha.setAttribute('cx', XS[idx]); ha.setAttribute('cy', c.ay[idx]);
    hov.classList.add('on');
  };
  show(6);
  plot.addEventListener('pointermove', e => {
    const r = plot.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 638;
    if (x < 30 || x > 606) return show(6);
    let best = 0, bd = 1e9;
    XS.forEach((p, i) => { const d = Math.abs(p - x); if (d < bd) { bd = d; best = i; } });
    show(best);
  });
  plot.addEventListener('pointerleave', () => show(6));
}

/* ---- agent table ---- */
const subset = () => agents.filter(a => state.tab === 0 || a.tl === state.tab);

function agentRows(list) {
  if (!list.length) return '<div class="empty-row">No agents match your search.</div>';
  return list.map((a, i) => {
    const hot = toSec(a.idle) > 3600;
    const inter = a.i > 0 ? `<span class="ipill">${a.i}</span><span class="ir">${a.ir}</span>` : '<span class="z">0</span><span class="z">0.00%</span>';
    return `<div class="tr td" role="row"><div><span class="badge">${a.rank}</span></div><div><span class="nm" title="${esc(a.n)}">${esc(a.n)}</span></div><div class="s-load">${a.l}</div><div class="s-con"><b>${a.c}</b><span>${a.cr}</span></div><div class="s-int">${inter}</div><div><span class="ppd">0</span></div><div><span class="tot">${a.t}</span></div><div><span class="rep">${a.rep}</span></div><div><span class="rel">${a.rel}</span></div><div><span class="idl${hot ? ' hot' : ''}">${a.idle}</span></div></div>`;
  }).join('');
}
function agentFoot(shown, total) {
  return shown === total ? `Showing all ${total} agents` : `Showing ${shown} of ${total} agents`;
}
function agentHTML() {
  const list = subset().map((a, i) => ({ ...a, rank: i + 1 }));
  return `<section class="card panel rv" ${rv()}>
    <div class="ph2"><div class="ph2-l"><h2>Performance Agent</h2><span class="count">${list.length} agents</span><span class="hint">Sorted by Load</span></div>
      <div class="ph2-r"><label class="search"><span class="sr">Search agent name</span><input id="q" type="search" placeholder="Search agent name…" autocomplete="off" spellcheck="false" value="${esc(state.q)}"><span class="kbd" aria-hidden="true">/</span></label>
      <button class="btn-dl" data-dl="agents">Download CSV</button></div></div>
    <div class="tscroll"><div class="tbl t-agent" role="table">
      <div class="tr th" role="row"><div>#</div><div>TL Name</div><div class="c-load"><i class="d" style="background:#2F6BFF"></i>Load</div><div class="c-con"><i class="d" style="background:#00A3E0"></i>Contacted</div><div class="c-int"><i class="d" style="background:#F5A700"></i>Interest</div><div>PPD Interest</div><div>Total Call</div><div class="th-rep">Repetition<small>T1 / T2 / T3</small></div><div>Release Time</div><div>Idle Time</div></div>
      <div id="agentBody">${agentRows(filterList(list))}</div>
    </div></div>
    <div class="t-foot" id="agentFoot">${agentFoot(filterList(list).length, list.length)}</div>
  </section>`;
}
function filterList(list) {
  const q = state.q.trim().toLowerCase();
  return q ? list.filter(a => a.n.toLowerCase().includes(q)) : list;
}

/* ---- touch counter ---- */
function touchHTML() {
  const cols = ['1st Touch', '2nd Touch', '3rd Touch', '4th Touch', '5th Touch', '6th Touch', '> 6th Touch'];
  return `<section class="card panel rv" ${rv()}>
    <div class="ph2"><div class="ph2-l"><h2>Agent Touch Repeat Counter</h2><span class="hint">Contract repeat per agent</span></div>
      <div class="ph2-r"><button class="btn-dl btn-ghost" data-dl="touch">Download CSV</button></div></div>
    <div class="tscroll"><div class="tbl t-touch" role="table">
      <div class="tr th" role="row"><div>Agent</div>${cols.map(c => `<div>${c}</div>`).join('')}</div>
      <div class="t-empty"><b>No contract repeats yet</b><span>Agents who touch a contract more than once will appear here.</span></div>
    </div></div>
  </section>`;
}

/* ---- heat tables ---- */
const binCall = v => v === 0 ? 0 : v <= 12 ? .12 : v <= 39 ? .24 : v <= 59 ? .36 : v <= 99 ? .54 : .73;
const binCon = v => v === 0 ? 0 : v <= 2 ? .12 : v <= 4 ? .24 : v <= 7 ? .36 : v <= 10 ? .54 : .73;
function heatCell(v, bin) {
  const a = bin(v);
  if (a === 0) return `<div class="hcell"><div class="hc z" style="background:#F3F6FF">${v}</div></div>`;
  return `<div class="hcell"><div class="hc${a >= .73 ? ' w' : ''}" style="background:rgba(30,79,224,${a})">${v}</div></div>`;
}
function heatRows(rows, bin, avg) {
  let h = rows.map((r, i) => {
    const cells = [...r.h, 0, 0, 0].slice(0, 10).map(v => heatCell(v, bin)).join('');
    return `<div class="tr td" role="row"><div><span class="badge">${i + 1}</span></div><div><span class="nm" title="${esc(r.n)}">${esc(r.n)}</span></div><div class="s-load2">${r.l}</div>${cells}<div><span class="tot2">${r.t}</span></div></div>`;
  }).join('');
  const ac = [...avg[1], 0, 0, 0].slice(0, 10).map(v => `<div class="hcell"><div class="hc">${v}</div></div>`).join('');
  h += `<div class="tr td avg" role="row"><div></div><div><span class="nm">Average</span></div><div class="s-load2" style="background:transparent">${avg[0]}</div>${ac}<div><span class="tot2">${avg[2]}</span></div></div>`;
  return h;
}
function heatHTML(kind) {
  const isCall = kind === 'call';
  const src = isCall ? D.call : D.con;
  const rows = src.filter((r, i) => state.tab === 0 || tlByName(r.n, i) === state.tab);
  const avg = (isCall ? CALL_AVG : CON_AVG)[state.tab];
  const hh = HOURS.map((h, i) => `<div class="hr${i > 6 ? ' off' : ''}">${h}</div>`).join('');
  return `<section class="card panel rv" ${rv()}>
    <div class="ph2"><div class="ph2-l"><h2>Performance ${isCall ? 'Call' : 'Contacted'}</h2><span class="chip-soft">${isCall ? 'Calls' : 'Contacts'} per hour</span></div>
      <div class="legend" aria-hidden="true">Quiet <i></i> Busy</div>
      <div class="ph2-r"><button class="btn-dl" data-dl="${kind}">Download CSV</button></div></div>
    <div class="tscroll"><div class="tbl t-heat" role="table">
      <div class="tr th" role="row"><div>#</div><div>Agent Name</div><div class="c-load"><i class="d" style="background:#2F6BFF"></i>Load</div>${hh}<div class="tt">Total</div></div>
      ${heatRows(rows, isCall ? binCall : binCon, avg)}
    </div></div>
    <div class="t-foot">Showing all ${rows.length} agents</div>
  </section>`;
}

/* ---------------- Skeletons ---------------- */
const sk = (w, h, r = 12, extra = '') => `<div class="sk${extra}" style="width:${w};height:${h}px;border-radius:${r}px"></div>`;
function skContent() {
  const kpi = `<div class="sk-box" style="height:173px;display:grid;gap:12px;align-content:space-between"><div style="display:flex;justify-content:space-between">${sk('88px', 24, 999)}${sk('64px', 24, 999)}</div>${sk('62%', 44, 12)}<div style="display:flex;justify-content:space-between">${sk('42%', 14, 7)}${sk('30%', 14, 7)}</div></div>`;
  const tiles = Array.from({ length: 10 }, () => sk('100%', 62, 16)).join('');
  const rows = Array.from({ length: 7 }, () => `<div style="display:grid;grid-template-columns:40px 1fr 80px 120px 90px;gap:16px;align-items:center;height:46px">${sk('28px', 24, 8)}${sk('55%', 14, 7)}${sk('48px', 14, 7)}${sk('80px', 14, 7)}${sk('60px', 14, 7)}</div>`).join('');
  return `<div class="sk-kpis">${kpi.repeat(4)}</div>
    <div class="sk-box" style="display:grid;gap:14px">${sk('220px', 20, 8)}<div class="sk-tiles">${tiles}</div></div>
    <div class="sk-box" style="display:grid;gap:10px">${sk('240px', 26, 8)}${sk('100%', 44, 14)}${rows}</div>`;
}
function skNav() {
  return `<div class="sk-nav">${`<div style="display:flex;align-items:center;gap:12px">${sk('36px', 36, 11, ' dark')}<div style="display:grid;gap:6px">${sk('110px', 12, 6, ' dark')}${sk('150px', 10, 5, ' dark')}</div></div>`}<div style="display:flex;gap:10px">${sk('150px', 34, 999, ' dark')}${sk('60px', 34, 999, ' dark')}${sk('100px', 34, 999, ' dark')}${sk('150px', 34, 999, ' dark')}${sk('92px', 34, 999, ' dark')}</div></div>`;
}
function skHeader() {
  return `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap"><div style="display:grid;gap:10px">${sk('180px', 12, 6)}${sk('min(380px,70vw)', 36, 10)}</div>${sk('min(380px,100%)', 60, 20)}</div>`;
}

/* ---------------- Rendering ---------------- */
const content = $('#content');

function updateChrome() {
  const d = state.date;
  $('#dateBtn').textContent = iso(d);
  $('#eyebrow').textContent = `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  $('#footR').textContent = `Data updated 14:03:29 · ${state.tab === 0 ? 'TL_Developer' : TABS[state.tab]}`;
  $('#campLbl').textContent = CAMPAIGNS[state.campaign];
  $$('.tab').forEach(t => t.setAttribute('aria-selected', String(+t.dataset.tab === state.tab)));
  placeInd();
}

function render() {
  rvI = 0;
  content.removeAttribute('aria-busy');
  content.innerHTML = kpiHTML() + timeAvgHTML() + detailHTML() + chartsHTML() + agentHTML() + touchHTML() + heatHTML('call') + heatHTML('con');
  updateChrome();
  bindContent();
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.ln,.ar', content).forEach(e => e.classList.add('go'))));
}

function bindContent() {
  $$('.chart', content).forEach(bindChart);
  const q = $('#q', content);
  if (q) q.addEventListener('input', () => {
    state.q = q.value;
    const list = subset().map((a, i) => ({ ...a, rank: i + 1 }));
    const f = filterList(list);
    $('#agentBody').innerHTML = agentRows(f);
    $('#agentFoot').textContent = agentFoot(f.length, list.length);
  });
  if (q) q.addEventListener('keydown', e => { if (e.key === 'Escape') { q.value = ''; state.q = ''; q.dispatchEvent(new Event('input')); q.blur(); } });
  $$('[data-dl]', content).forEach(b => b.addEventListener('click', () => download(b.dataset.dl)));
  if (!reduce) $$('.kpi-val', content).forEach(el => countUp(el));
}

function countUp(el) {
  const to = +el.dataset.n, kind = el.dataset.k, t0 = performance.now(), dur = 900;
  const f = v => kind === 't' ? fmtT(v) : fmtN(Math.round(v));
  const tick = now => {
    const p = Math.max(0, Math.min(1, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 4);
    el.textContent = f(to * e);
    if (p < 1) requestAnimationFrame(tick); else el.textContent = f(to);
  };
  el.textContent = f(0); requestAnimationFrame(tick); setTimeout(() => { el.textContent = f(to); }, dur + 150);
}

async function reload(ms = 450) {
  if (state.loading) return;
  state.loading = true;
  content.setAttribute('aria-busy', 'true');
  content.innerHTML = `<div class="sk-screen" role="status" aria-label="Loading">${skContent()}</div>`;
  updateChrome();
  await wait(ms);
  state.loading = false;
  render();
}

/* ---------------- Tabs ---------------- */
function placeInd() {
  const t = $(`.tab[data-tab="${state.tab}"]`), ind = $('#tabInd');
  if (!t || !ind || !t.offsetWidth) return;
  if (!ind.dataset.placed) { ind.style.transition = 'none'; ind.dataset.placed = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { ind.style.transition = ''; })); }
  ind.style.width = t.offsetWidth + 'px';
  ind.style.transform = `translateX(${t.offsetLeft}px)`;
}
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return;
  const n = +b.dataset.tab; if (n === state.tab || state.loading) return;
  state.tab = n; state.q = '';
  updateChrome(); reload(450);
});
$('#tabs').addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const n = (state.tab + (e.key === 'ArrowRight' ? 1 : 3)) % 4;
  $(`.tab[data-tab="${n}"]`).focus(); $(`.tab[data-tab="${n}"]`).click(); e.preventDefault();
});
addEventListener('resize', placeInd);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInd);

/* ---------------- Overlays ---------------- */
const layer = $('#layer');
let pop = null;
function closePop(instant) {
  if (!pop) return;
  const p = pop; pop = null;
  p.btn.setAttribute('aria-expanded', 'false');
  if (instant || reduce) p.el.remove(); else { p.el.classList.add('out'); setTimeout(() => p.el.remove(), 140); }
}
function openPop(btn, anchor, el) {
  closePop(true);
  anchor.appendChild(el);
  btn.setAttribute('aria-expanded', 'true');
  pop = { el, btn };
  const r = el.getBoundingClientRect();
  if (r.left < 8) el.style.translate = `${8 - r.left}px 0`;
  else if (r.right > innerWidth - 8) el.style.translate = `${innerWidth - 8 - r.right}px 0`;
}
document.addEventListener('pointerdown', e => { if (pop && !pop.el.contains(e.target) && !pop.btn.contains(e.target)) closePop(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (pop) { const b = pop.btn; closePop(); b.focus(); }
    else if ($('.scrim')) closeModal();
  }
  if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && $('#q')) { e.preventDefault(); $('#q').focus(); }
});

/* campaign menu */
$('#campBtn').addEventListener('click', () => {
  if (pop && pop.btn.id === 'campBtn') return closePop();
  const el = document.createElement('div');
  el.className = 'pop menu'; el.setAttribute('role', 'menu');
  el.innerHTML = CAMPAIGNS.map((c, i) => `<button class="mi" role="menuitemradio" aria-checked="${i === state.campaign}" data-i="${i}"><span>${c}</span>${i === state.campaign ? ICO_CHECK : ''}</button>`).join('');
  openPop($('#campBtn'), $('#campAnchor'), el);
  el.addEventListener('click', e => {
    const b = e.target.closest('.mi'); if (!b) return;
    const i = +b.dataset.i; closePop();
    if (i !== state.campaign) { state.campaign = i; reload(450); }
  });
  el.addEventListener('keydown', e => {
    const items = $$('.mi', el), k = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { items[(k + 1) % items.length].focus(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { items[(k - 1 + items.length) % items.length].focus(); e.preventDefault(); }
  });
  ($('.mi[aria-checked="true"]', el) || $('.mi', el)).focus();
});

/* date picker */
$('#dateBtn').addEventListener('click', () => {
  if (pop && pop.btn.id === 'dateBtn') return closePop();
  state.dpMonth = state.date.getMonth();
  const el = document.createElement('div');
  el.className = 'pop dpick'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Choose date');
  const draw = () => {
    const m = state.dpMonth, first = new Date(2026, m, 1), dim = new Date(2026, m + 1, 0).getDate();
    const off = (first.getDay() + 6) % 7;
    let cells = '<span></span>'.repeat(off);
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(2026, m, d), dis = dt > TODAY;
      const sel = iso(dt) === iso(state.date), td = iso(dt) === iso(TODAY);
      cells += `<button class="dp-d${sel ? ' sel' : ''}${td ? ' today' : ''}" data-d="${d}" ${dis ? 'disabled' : ''} aria-label="${d} ${MONTHS_T[m]} 2026"${sel ? ' aria-pressed="true"' : ''}>${d}</button>`;
    }
    el.innerHTML = `<div class="dp-h"><button class="dp-b" data-nav="-1" aria-label="Previous month" ${m <= 9 ? 'disabled' : ''}>‹</button><b>${MONTHS_T[m]} 2026</b><button class="dp-b" data-nav="1" aria-label="Next month" ${m >= 10 ? 'disabled' : ''}>›</button></div>
      <div class="dp-w">${['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(w => `<span>${w}</span>`).join('')}</div>
      <div class="dp-g">${cells}</div>
      <div class="dp-f"><span>Data available until 3 Nov 2026</span><button class="dp-t" data-today>Today</button></div>`;
  };
  draw();
  openPop($('#dateBtn'), $('#dateAnchor'), el);
  el.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]'), day = e.target.closest('[data-d]'), td = e.target.closest('[data-today]');
    if (nav && !nav.disabled) { state.dpMonth += +nav.dataset.nav; draw(); return; }
    if (day && !day.disabled) pick(new Date(2026, state.dpMonth, +day.dataset.d));
    if (td) pick(new Date(TODAY));
  });
  const sel = $('.dp-d.sel', el) || $('.dp-d.today', el); if (sel) sel.focus();
});
function pick(d) {
  closePop();
  if (iso(d) === iso(state.date)) return;
  state.date = d;
  updateChrome(); reload(380);
}

/* logout modal */
function openModal() {
  const s = document.createElement('div');
  s.className = 'scrim';
  s.innerHTML = `<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="mT" aria-describedby="mP">
    <div class="m-ico"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 2.5h-2a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 1.5 1.5h2M10 5l3 3-3 3M13 8H6.5"/></svg></div>
    <h3 id="mT">Log out?</h3><p id="mP">You'll need to log in again to access the performance dashboard.</p>
    <div class="m-btns"><button class="m-cancel">Cancel</button><button class="m-ok">Log out</button></div></div>`;
  layer.appendChild(s);
  s.addEventListener('pointerdown', e => { if (e.target === s) closeModal(); });
  $('.m-cancel', s).addEventListener('click', closeModal);
  $('.m-ok', s).addEventListener('click', logout);
  s.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const b = $$('button', s), i = b.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { b[b.length - 1].focus(); e.preventDefault(); }
    else if (!e.shiftKey && i === b.length - 1) { b[0].focus(); e.preventDefault(); }
  });
  $('.m-cancel', s).focus();
}
function closeModal() {
  const s = $('.scrim'); if (!s) return;
  if (reduce) s.remove(); else { s.classList.add('out'); setTimeout(() => s.remove(), 180); }
  $('#logoutBtn').focus();
}
$('#logoutBtn').addEventListener('click', openModal);

async function logout() {
  closeModal();
  $('#app').style.transition = 'opacity .3s'; $('#app').style.opacity = '0';
  await wait(300);
  $('#app').hidden = true; $('#app').style.opacity = ''; $('#app').style.transition = '';
  Object.assign(state, { tab: 0, date: new Date(TODAY), campaign: 0, q: '', loading: false });
  $('#loginCard').classList.remove('leaving');
  $('#login').hidden = false; $('#loginBtn').classList.remove('busy'); $('#loginBtn').disabled = false; $('#loginLbl').textContent = 'LOG IN';
  window.scrollTo(0, 0);
  $('#pass').focus();
}

/* toast + CSV */
let toastT;
function showToast(name) {
  $$('.toast').forEach(t => t.remove()); clearTimeout(toastT);
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status');
  t.innerHTML = `<div class="toast-i">${ICO_CHECK.replace('<svg', '<svg style="color:#fff"')}</div><div class="toast-t"><b>Download started</b><span>${esc(name)}</span></div><div class="toast-bar"></div>`;
  layer.appendChild(t);
  toastT = setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 200); }, 2400);
}
const csvCell = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
function download(kind) {
  const k = KPI[state.tab], d = state.date, lm = lastMonth(d);
  let rows, base;
  if (kind === 'perf') {
    base = 'performance_report';
    rows = [['Date', 'PPD Interest', 'Avg Release Time', 'Avg Idle Time'], [iso(d), 0, k.rel, k.idle], [iso(lm), 0, fmtT(toSec(k.rel) - k.dRel), fmtT(toSec(k.idle) - k.dIdle)], ['SUR/DEF', 0, (k.dRel < 0 ? '-' : '') + fmtT(Math.abs(k.dRel)), (k.dIdle < 0 ? '-' : '') + fmtT(Math.abs(k.dIdle))]];
  } else if (kind === 'agents') {
    base = 'performance_agent';
    rows = [['#', 'TL Name', 'Load', 'Contacted', 'Contact Rate', 'Interest', 'Interest Rate', 'PPD Interest', 'Total Call', 'Repetition T1/T2/T3', 'Release Time', 'Idle Time'],
      ...filterList(subset()).map((a, i) => [i + 1, a.n, a.l, a.c, a.cr, a.i, a.ir, 0, a.t, a.rep, a.rel, a.idle])];
  } else if (kind === 'touch') {
    base = 'touch_repeat';
    rows = [['Agent', '1st Touch', '2nd Touch', '3rd Touch', '4th Touch', '5th Touch', '6th Touch', '> 6th Touch']];
  } else {
    const isCall = kind === 'call'; base = isCall ? 'performance_call' : 'performance_contacted';
    const src = (isCall ? D.call : D.con).filter((r, i) => state.tab === 0 || tlByName(r.n, i) === state.tab);
    rows = [['#', 'Agent Name', 'Load', ...HOURS, 'Total'], ...src.map((r, i) => [i + 1, r.n, r.l, ...[...r.h, 0, 0, 0].slice(0, 10), r.t])];
  }
  const name = `${base}_${iso(d)}.csv`;
  const blob = new Blob(['﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  showToast(name);
}

/* ---------------- Login flow ---------------- */
const form = $('#loginForm');
$('#eye').addEventListener('click', () => {
  const p = $('#pass'), show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  $('#eye').setAttribute('aria-pressed', String(show)); $('#eye').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  $('#eyeIco').style.opacity = show ? .55 : 1;
});
['user', 'pass'].forEach(id => $('#' + id).addEventListener('input', () => { $('#' + id + 'Box').classList.remove('err'); $('#' + id + 'Err').textContent = ''; }));
form.addEventListener('submit', async e => {
  e.preventDefault();
  let bad = false;
  [['user', 'Enter your username.'], ['pass', 'Enter your password.']].forEach(([id, msg]) => {
    if (!$('#' + id).value.trim()) {
      bad = true; const b = $('#' + id + 'Box'); b.classList.remove('err'); void b.offsetWidth; b.classList.add('err'); $('#' + id + 'Err').textContent = msg;
    }
  });
  if (bad) { ($('#user').value.trim() ? $('#pass') : $('#user')).focus(); return; }
  const btn = $('#loginBtn'); btn.classList.add('busy'); btn.disabled = true; $('#loginLbl').textContent = 'SIGNING IN';
  await wait(900);
  $('#loginCard').classList.add('leaving');
  await wait(320);
  $('#login').hidden = true;
  $('#skInner').innerHTML = `<div class="sk-screen">${skNav()}<div style="height:20px"></div>${skHeader()}<div style="height:20px"></div><div style="display:flex;flex-direction:column;gap:20px">${skContent()}</div></div>`;
  $('#skScreen').hidden = false;
  window.scrollTo(0, 0);
  await wait(650);
  $('#skScreen').hidden = true;
  $('#app').hidden = false;
  state.loading = false;
  render();
  $('#app').animate && !reduce && $('#app').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
  placeInd();
});

/* deep-link helper for testing: #dashboard skips login */
if (/^#dashboard/.test(location.hash)) {
  const m = location.hash.match(/tab(\d)/); if (m) state.tab = +m[1];
  $('#login').hidden = true; $('#app').hidden = false; render(); placeInd();
}
})();
