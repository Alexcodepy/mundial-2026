const tabsEl = document.getElementById("tabs");
const matchesEl = document.getElementById("matches");

let GROUPS_DATA = GROUPS;     // de data.js (fallback)
let FIXTURES_DATA = FIXTURES; // de data.js (fallback)
let CRESTS = {};              // nombre -> URL de escudo (solo modo API)
let activeGroup = Object.keys(GROUPS_DATA)[0];
let liveSource = false;

const groupKeys = () => Object.keys(GROUPS_DATA);
const played = m => m.hs !== null && m.as !== null;
const statusOf = m => m.status === "live" ? "live" : (played(m) ? "ft" : "soon");

function flag(name) {
  if (CRESTS[name]) return `<img class="crest" src="${CRESTS[name]}" alt="">`;
  return `<span class="emoji-flag">${TEAMS[name] || "🏳️"}</span>`;
}

function statusLabel(s) {
  if (s === "ft") return { cls: "status--ft", txt: "Final" };
  if (s === "live") return { cls: "status--live", txt: "● En juego" };
  return { cls: "status--soon", txt: "Próximo" };
}

// ---------- carga de datos en vivo ----------
// Orden: data/matches.json (generado por GitHub Actions, funciona en Pages)
//        -> /api/matches (proxy local con server.py)
//        -> fallback estático de data.js
async function fetchMatches() {
  for (const url of ["data/matches.json", "/api/matches"]) {
    try {
      const res = await fetch(url + "?t=" + Date.now(), { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      if (!json.error && Array.isArray(json.matches) && json.matches.length) return json;
    } catch { /* siguiente fuente */ }
  }
  return null;
}

async function loadLive() {
  try {
    const json = await fetchMatches();
    if (!json) return false;

    const groups = {};
    const fixtures = [];
    const crests = {};

    for (const m of json.matches) {
      const gk = (m.group || "").replace("GROUP_", "").trim();
      if (!gk) continue;
      const h = m.homeTeam.name, a = m.awayTeam.name;
      (groups[gk] = groups[gk] || []);
      if (!groups[gk].includes(h)) groups[gk].push(h);
      if (!groups[gk].includes(a)) groups[gk].push(a);
      if (m.homeTeam.crest) crests[h] = m.homeTeam.crest;
      if (m.awayTeam.crest) crests[a] = m.awayTeam.crest;

      const st = m.status;
      const done = st === "FINISHED";
      const live = st === "IN_PLAY" || st === "PAUSED";
      const ft = m.score?.fullTime || {};
      fixtures.push({
        g: gk, h, a,
        hs: done || live ? (ft.home ?? 0) : null,
        as: done || live ? (ft.away ?? 0) : null,
        status: live ? "live" : undefined,
        date: new Date(m.utcDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        venue: m.venue || (m.area?.name ?? ""),
      });
    }

    GROUPS_DATA = groups;
    FIXTURES_DATA = fixtures;
    CRESTS = crests;
    if (!groupKeys().includes(activeGroup)) activeGroup = groupKeys()[0];
    liveSource = true;
    return true;
  } catch {
    return false;
  }
}

// ---------- tabla de posiciones ----------
function standings(gk) {
  const rows = {};
  GROUPS_DATA[gk].forEach(t => rows[t] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 });
  FIXTURES_DATA.filter(m => m.g === gk && played(m)).forEach(m => {
    const h = rows[m.h], a = rows[m.a];
    if (!h || !a) return;
    h.pj++; a.pj++;
    h.gf += m.hs; h.gc += m.as;
    a.gf += m.as; a.gc += m.hs;
    if (m.hs > m.as) { h.g++; a.p++; h.pts += 3; }
    else if (m.hs < m.as) { a.g++; h.p++; a.pts += 3; }
    else { h.e++; a.e++; h.pts++; a.pts++; }
  });
  return Object.values(rows).sort((x, y) =>
    y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf
  );
}

// ---------- render ----------
function teamRow(name, score, isWin) {
  return `
    <div class="team ${isWin ? "win" : ""}">
      <span class="team__flag">${flag(name)}</span>
      <span class="team__name">${name}</span>
      <span class="team__score">${score}</span>
    </div>`;
}

function matchCard(m) {
  const st = statusLabel(statusOf(m));
  const done = played(m);
  return `
    <article class="match">
      <div class="match__top">
        <span>${m.venue}</span>
        <span class="match__status ${st.cls}">${st.txt}</span>
      </div>
      ${teamRow(m.h, done ? m.hs : "–", done && m.hs > m.as)}
      <div class="match__divider"></div>
      ${teamRow(m.a, done ? m.as : "–", done && m.as > m.hs)}
      <div class="match__date">${m.date}</div>
    </article>`;
}

function standingsTable(gk) {
  const rows = standings(gk).map((r, i) => `
    <tr class="${i < 2 ? "qualifies" : ""}">
      <td class="pos">${i + 1}</td>
      <td class="tname">${flag(r.team)} ${r.team}</td>
      <td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td>
      <td>${r.gf - r.gc > 0 ? "+" : ""}${r.gf - r.gc}</td>
      <td class="pts">${r.pts}</td>
    </tr>`).join("");
  return `
    <table class="standings">
      <thead><tr><th></th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function render() {
  const fixtures = FIXTURES_DATA.filter(m => m.g === activeGroup);
  const badge = liveSource
    ? `<span class="src src--live">● En directo · football-data.org</span>`
    : `<span class="src src--manual">Datos manuales (js/data.js)</span>`;
  matchesEl.innerHTML = `
    <div class="group-head">
      <div class="group-head__top"><h2>Grupo ${activeGroup}</h2>${badge}</div>
      ${standingsTable(activeGroup)}
      <p class="legend"><span class="dot-q"></span> Clasifican a octavos (2 primeros + mejores terceros)</p>
    </div>
    <div class="fixtures">${fixtures.map(matchCard).join("")}</div>`;
}

function renderTabs() {
  tabsEl.innerHTML = groupKeys().map(g =>
    `<button class="tab ${g === activeGroup ? "active" : ""}" data-g="${g}">Grupo ${g}</button>`
  ).join("");
  tabsEl.querySelectorAll(".tab").forEach(btn =>
    btn.addEventListener("click", () => { activeGroup = btn.dataset.g; renderTabs(); render(); })
  );
}

async function refresh() {
  await loadLive();
  renderTabs();
  render();
}

refresh();
setInterval(refresh, 60000); // refresco cada 60s (límite del plan gratuito)
