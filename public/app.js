// EPMO Hub — AI Generation POC frontend. Standalone harness UI (not the
// EPMO Hub mockup itself), built to visually rhyme with it: same design
// tokens, same field-shape conventions (source/sourceLabel, phases[].window,
// tasks[].key/owner) — see CLAUDE-CODE-POC-BRIEF.md.

const $ = (id) => document.getElementById(id);

const JURISDICTIONS = [
  "United States", "Canada", "Mexico", "Brazil", "United Kingdom", "Germany",
  "France", "Spain", "European Union (bloc-wide)", "Other",
];
const COMPLIANCE_FLAGS = [
  { value: "CUSTOMER PII / PERSONAL DATA", label: "Customer PII / personal data" },
  { value: "FINANCIAL REGULATION", label: "Financial regulation" },
  { value: "HEALTH DATA / HIPAA", label: "Health data / HIPAA" },
  { value: "EMPLOYMENT LAW", label: "Employment law" },
  { value: "INTELLECTUAL PROPERTY", label: "Intellectual property" },
  { value: "INDUSTRY-SPECIFIC REGULATIONS", label: "Industry-specific regulations" },
];

const SAMPLES = {
  "core-banking": {
    intake: {
      name: "Core Banking Platform Migration",
      type: "Infrastructure / Technology Build",
      description: "Migrate the core banking ledger and transaction processing off a legacy mainframe onto a modern cloud-native platform without disrupting daily branch operations.",
      client: "Meridian Trust Bank",
      industry: "Financial Services / Retail Banking",
      sponsor: "M. Reyes, COO",
      startDate: "2026-01-05",
      targetEndDate: "2026-12-20",
      currency: "USD",
      jurisdictions: ["United States"],
      vendorStatus: "at work",
      budget: 4200000,
      objective: "Migrate core banking ledger and transaction processing from the legacy mainframe to a modern cloud-native platform without disrupting daily branch operations.",
      dod: "Legacy mainframe fully decommissioned; 100% of transaction volume processed on the new platform for 60 consecutive days with zero critical incidents.",
      teamCapacity: "Architecture Guild, Integration Pod, and InfoSec are the primary internal teams; branch training relies on 12 regional ops managers; D. Alvarez is program lead.",
      decisionMakers: "M. Reyes, COO (Executive Sponsor); Steering Committee (monthly go/no-go on cutover gates)",
      influencers: "Core Platform Vendor Account Exec (delivery pod allocation); Head of Retail Banking Ops (branch rollout sequencing)",
      blockers: "Federal Reserve Examiner — regulatory approval gate before cutover; examiner has not yet confirmed audit logging scope.",
      supporters: "12 regional branch ops managers coordinating local training.",
      constraints: "Regulatory sign-off requires a full 60-day clean parallel run with zero exceptions before the legacy mainframe can be decommissioned; cutover cannot move earlier than Dec 2026.",
      anythingElse: "Core platform vendor was previously over-allocated across three concurrent client migrations, causing a 3-week Phase 2 slip; a dedicated vendor delivery pod was escalated into place in Q3.",
      complianceFlags: ["FINANCIAL REGULATION", "CUSTOMER PII / PERSONAL DATA"],
    },
  },
  "apac-expansion": {
    intake: {
      name: "APAC Market Entry — Retail Expansion",
      type: "Strategic Growth",
      description: "Establish a direct-to-consumer retail presence in Singapore and Malaysia as a beachhead for broader APAC expansion.",
      client: "Northfield Retail Group",
      industry: "Retail / International Expansion",
      sponsor: "A. Lindqvist, CEO",
      startDate: "2026-03-02",
      targetEndDate: "2027-02-26",
      currency: "USD",
      jurisdictions: ["Other"],
      vendorStatus: "at work",
      budget: 2800000,
      objective: "Establish a direct-to-consumer retail presence in Singapore and Malaysia as a beachhead for broader APAC expansion.",
      dod: "Three flagship stores open and operating at 80% or more of first-year sales targets by the end of Q4 2027.",
      teamCapacity: "S. Okafor leads the program; Legal, a third-party Build Partner for store fit-out, Regional HR, and Regional Marketing are the supporting teams.",
      decisionMakers: "A. Lindqvist, CEO (Executive Sponsor)",
      influencers: "Regional Marketing Director (launch campaign sequencing)",
      blockers: "Malaysia Ministry of Domestic Trade — retail operating license application still pending regulator review (Owner: Legal).",
      supporters: "Singapore & Kuala Lumpur store teams handling local market execution.",
      constraints: "Malaysia requires a locally incorporated entity with a resident director before any retail operating license can be issued; marketing spend is held until stores are ready.",
      anythingElse: "A local Singapore competitor announced an aggressive pricing campaign in the Orchard Road corridor ahead of launch; launch pricing was adjusted for the first 90 days in response. Jurisdictions of operation (Singapore, Malaysia) aren't in the fixed jurisdiction list below — logged as 'Other'.",
      complianceFlags: [],
    },
  },
};

// ---------------------------------------------------------------------------
// Gate

const SESSION_KEY = "epmoSessionToken";
const SESSION_EXP_KEY = "epmoSessionExpiresAt";
let appInitialized = false;

function hasValidLocalSession() {
  const token = sessionStorage.getItem(SESSION_KEY);
  const exp = Number(sessionStorage.getItem(SESSION_EXP_KEY));
  return !!token && exp && Date.now() < exp;
}
function storeSession(token, expiresAt) {
  sessionStorage.setItem(SESSION_KEY, token);
  sessionStorage.setItem(SESSION_EXP_KEY, String(expiresAt));
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_EXP_KEY);
}
function showApp() {
  $("gate-screen").style.display = "none";
  $("app-shell").style.display = "block";
  if (!appInitialized) { initApp(); appInitialized = true; }
}
function showGate(message) {
  $("app-shell").style.display = "none";
  $("gate-screen").style.display = "flex";
  $("gate-error").textContent = message || "";
}

$("gate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("gate-submit");
  btn.disabled = true;
  $("gate-error").textContent = "";
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: $("gate-password").value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      $("gate-error").textContent = data.error || "Incorrect password.";
      return;
    }
    storeSession(data.token, data.expiresAt);
    showApp();
  } catch (err) {
    $("gate-error").textContent = "Could not reach the server. Try again.";
  } finally {
    btn.disabled = false;
  }
});

if (hasValidLocalSession()) showApp(); else showGate();

// ---------------------------------------------------------------------------
// Helpers

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function safeUrl(u) {
  try {
    const parsed = new URL(u, window.location.href);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "#";
  } catch { return "#"; }
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function money(n, currency) {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return "$" + Math.round(num).toLocaleString("en-US") + (currency ? " " + currency : "");
}
function aiDate(d) {
  if (!d) return "—";
  return `<span class="ai-date" title="AI-suggested — confirm before use.">${esc(d)}</span>`;
}
function pill(text, cls) { return `<span class="pill ${cls || "pill-neutral"}">${esc(text)}</span>`; }
function sevPill(v) {
  const s = String(v || "").toLowerCase();
  if (s === "critical" || s === "high") return pill(cap(v), "pill-critical");
  if (s === "medium") return pill(cap(v), "pill-warn");
  if (s === "low") return pill(cap(v), "pill-good");
  return pill(v || "—", "pill-neutral");
}
function statusPill(s) {
  const v = String(s || "").toLowerCase();
  if (v === "mitigated" || v === "complete" || v === "closed") return pill(s, "pill-good");
  if (v === "in progress") return pill(s, "pill-warn");
  return pill(s || "—", "pill-neutral");
}
function ragPill(r) {
  return r === "warn" ? pill("Amber", "pill-warn") : pill("Green", "pill-good");
}

// ---------------------------------------------------------------------------
// Provenance badge — the demo's centerpiece. FINDINGS_BY_ID is set fresh per
// render so click-through resolves against the artifact currently on screen.

let FINDINGS_BY_ID = {};
let PROV_COUNTER = 0;
let LOW_CONF_QUEUE = [];

function linkifyFindings(text) {
  if (!text) return "";
  return esc(text).replace(/\bF(\d+)\b/g, (m) => {
    const f = FINDINGS_BY_ID[m];
    if (!f) return m;
    return `<a href="${esc(safeUrl(f.url))}" target="_blank" rel="noopener noreferrer">${m} — ${esc(f.title)}</a>`;
  });
}

function provenanceBadge(p, opts) {
  if (!p) return "";
  PROV_COUNTER += 1;
  const id = "prov-" + PROV_COUNTER;
  const conf = String(p.confidence || "low").toLowerCase();
  const basisText = Array.isArray(p.basis) ? p.basis.join(" + ") : String(p.basis || "inference");

  if (conf === "low" && opts && opts.queueLabel) {
    LOW_CONF_QUEUE.push({ tabKey: opts.tabKey, domId: opts.domId, label: opts.queueLabel });
  }

  return `<span class="prov-wrap">
    <button type="button" class="prov-badge conf-${esc(conf)}" data-pop="${id}">${esc(cap(conf))}</button>
    <div class="prov-pop" id="${id}">
      <div class="pp-basis">${esc(basisText)}</div>
      <div>${linkifyFindings(p.detail || "")}</div>
    </div>
  </span>`;
}

// ---------------------------------------------------------------------------
// Form wiring

function renderCheckGroup(containerId, name, items, valueOf, labelOf) {
  const el = $(containerId);
  el.innerHTML = items
    .map((item, i) => {
      const value = valueOf(item);
      const label = labelOf(item);
      const id = `${name}-${i}`;
      return `<label class="check-item"><input type="checkbox" id="${id}" name="${name}" value="${esc(value)}" /> ${esc(label)}</label>`;
    })
    .join("");
}

function setChecked(name, values) {
  const set = new Set(values || []);
  document.querySelectorAll(`input[name="${name}"]`).forEach((el) => { el.checked = set.has(el.value); });
}
function getChecked(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
}

function populateSampleSelect() {
  const sel = $("sample-select");
  Object.keys(SAMPLES).forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = SAMPLES[key].intake.name;
    sel.appendChild(opt);
  });
  const custom = document.createElement("option");
  custom.value = "__custom__";
  custom.textContent = "Custom (type your own)";
  sel.appendChild(custom);
}

function applySample(key) {
  if (key === "__custom__") return;
  const intake = SAMPLES[key].intake;
  $("f-name").value = intake.name || "";
  $("f-type").value = intake.type || "";
  $("f-description").value = intake.description || "";
  $("f-client").value = intake.client || "";
  $("f-industry").value = intake.industry || "";
  $("f-sponsor").value = intake.sponsor || "";
  $("f-budget").value = intake.budget || "";
  $("f-start-date").value = intake.startDate || "";
  $("f-end-date").value = intake.targetEndDate || "";
  $("f-currency").value = intake.currency || "USD";
  $("f-vendor-status").value = intake.vendorStatus || "none";
  $("f-objective").value = intake.objective || "";
  $("f-dod").value = intake.dod || "";
  $("f-team-capacity").value = intake.teamCapacity || "";
  $("f-decision-makers").value = intake.decisionMakers || "";
  $("f-influencers").value = intake.influencers || "";
  $("f-blockers").value = intake.blockers || "";
  $("f-supporters").value = intake.supporters || "";
  $("f-constraints").value = intake.constraints || "";
  $("f-anything-else").value = intake.anythingElse || "";
  setChecked("jurisdiction", intake.jurisdictions);
  setChecked("compliance", intake.complianceFlags);
}

function readIntake() {
  return {
    name: $("f-name").value,
    type: $("f-type").value,
    description: $("f-description").value,
    client: $("f-client").value,
    industry: $("f-industry").value,
    sponsor: $("f-sponsor").value,
    startDate: $("f-start-date").value,
    targetEndDate: $("f-end-date").value,
    currency: $("f-currency").value,
    jurisdictions: getChecked("jurisdiction"),
    vendorStatus: $("f-vendor-status").value,
    budget: $("f-budget").value ? Number($("f-budget").value) : null,
    objective: $("f-objective").value,
    dod: $("f-dod").value,
    teamCapacity: $("f-team-capacity").value,
    decisionMakers: $("f-decision-makers").value,
    influencers: $("f-influencers").value,
    blockers: $("f-blockers").value,
    supporters: $("f-supporters").value,
    constraints: $("f-constraints").value,
    anythingElse: $("f-anything-else").value,
    complianceFlags: getChecked("compliance"),
  };
}

// ---------------------------------------------------------------------------
// Tab rendering

const TAB_DEFS = [
  { key: "overview", label: "Overview" },
  { key: "plan", label: "Project Plan" },
  { key: "risks", label: "Risk Register" },
  { key: "assumptions", label: "Assumptions" },
  { key: "milestones", label: "Milestones" },
  { key: "stakeholders", label: "Stakeholders" },
  { key: "dependencies", label: "Dependencies" },
  { key: "budget", label: "Budget" },
  { key: "research", label: "Research" },
];

function renderOverviewTab(a) {
  return `
    <div class="detail-grid">
      <div><div class="dg-label">Scale tier</div>Tier ${esc(a.scaleTier)} — ${esc(a.scaleTierRationale || "")}</div>
      <div><div class="dg-label">RAG</div>${ragPill(a.rag)} <span class="muted">${esc(a.ragReason || "")}</span></div>
      <div><div class="dg-label">ID prefix</div>${esc(a.idPrefix || "—")}</div>
      <div><div class="dg-label">Client</div>${esc(a.client || "—")}</div>
      <div><div class="dg-label">Industry / LOB</div>${esc(a.industry || "—")}</div>
      <div><div class="dg-label">Sponsor</div>${esc(a.sponsor || "—")}</div>
      <div><div class="dg-label">Duration</div>${esc(a.duration || "—")}</div>
      <div><div class="dg-label">Budget</div>${money(a.budget, a.currency)}</div>
    </div>
    <h3>Objective</h3><p>${esc(a.objective || "—")}</p>
    <h3>Definition of Done</h3><p>${esc(a.dod || "—")}</p>
  `;
}

function renderPlanTab(a) {
  const phaseRows = (a.phases || []).map((p) => {
    const domId = `phase-${p.id}`;
    return `<tr id="${domId}"><td>${esc(p.id)}</td><td>${esc(p.name)}</td><td>${esc(p.window)}</td>
      <td>${aiDate(p.startDate)} – ${aiDate(p.endDate)}</td><td>${esc(p.objective || "")}</td>
      <td>${provenanceBadge(p.provenance, { tabKey: "plan", domId, queueLabel: `Phase ${p.id} — ${p.name}` })}</td></tr>`;
  }).join("");

  const wsList = (a.workstreams || []).map((w) => `<span class="pill pill-navy">${esc(w)}</span>`).join(" ");

  const taskRows = (a.tasks || []).map((t) => {
    const domId = `task-${t.key}`;
    return `<tr id="${domId}"><td>${esc(t.id)}</td><td>${esc(t.task)}</td><td>${esc(t.phase)}</td><td>${esc(t.workstream)}</td>
      <td>${sevPill(t.priority)}</td><td>${aiDate(t.startDate)} → ${aiDate(t.endDate)}</td>
      <td>${esc(t.ownerRole || t.owner)}</td><td>${statusPill(t.status)}</td>
      <td>${provenanceBadge(t.provenance, { tabKey: "plan", domId, queueLabel: `Task ${t.id} — ${t.task}` })}</td></tr>`;
  }).join("");

  return `
    <h3>Phases</h3>
    <table><thead><tr><th>ID</th><th>Name</th><th>Window</th><th>Dates</th><th>Objective</th><th>Provenance</th></tr></thead>
    <tbody>${phaseRows || `<tr><td colspan="6" class="muted">No phases generated.</td></tr>`}</tbody></table>
    <h3>Workstreams</h3>
    <p>${wsList || '<span class="muted">None generated.</span>'}</p>
    <h3>Tasks <span class="muted">(${(a.tasks || []).length})</span></h3>
    <table><thead><tr><th>ID</th><th>Task</th><th>Phase</th><th>Workstream</th><th>Priority</th><th>Dates</th><th>Owner Role</th><th>Status</th><th>Provenance</th></tr></thead>
    <tbody>${taskRows || `<tr><td colspan="9" class="muted">No tasks generated.</td></tr>`}</tbody></table>
  `;
}

function renderRisksTab(a) {
  const rows = (a.risks || []).map((r, i) => {
    const detailId = `risk-detail-${i}`;
    const domId = `risk-${r.id}`;
    const summary = `<tr class="clickable" id="${domId}" data-toggle="${detailId}">
      <td>${esc(r.id)}</td><td>${esc(r.category)}</td><td>${esc(r.desc)}</td>
      <td>${sevPill(r.inherentSeverity || r.severity)}<span class="arrow-sep">→</span>${sevPill(r.residualSeverity)}</td>
      <td><span class="pill pill-navy">${esc(cap(r.responseStrategy))}</span></td>
      <td>${statusPill(r.status)}</td>
      <td>${provenanceBadge(r.provenance, { tabKey: "risks", domId, queueLabel: `Risk ${r.id} — ${r.desc.slice(0, 60)}` })}</td>
    </tr>`;
    const detail = `<tr class="detail-row" id="${detailId}"><td colspan="7">
      <div class="detail-grid">
        <div><div class="dg-label">Mitigation</div>${esc(r.mitigation || "—")}</div>
        <div><div class="dg-label">Mitigation owner / target</div>${esc(r.mitigationOwnerRole || "—")} · ${aiDate(r.mitigationTargetDate)}</div>
        <div><div class="dg-label">Trigger</div>${esc(r.trigger || "—")}</div>
        <div><div class="dg-label">Inherent likelihood → residual</div>${sevPill(r.inherentLikelihood || r.likelihood)} <span class="arrow-sep">→</span> ${sevPill(r.residualLikelihood)}</div>
        <div><div class="dg-label">Source</div>${esc(r.source)} — ${esc(r.sourceLabel || "")}</div>
      </div>
    </td></tr>`;
    return summary + detail;
  }).join("");

  return `
    <table><thead><tr><th>ID</th><th>Category</th><th>Description</th><th>Inherent → Residual</th><th>Response</th><th>Status</th><th>Provenance</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="7" class="muted">No risks generated.</td></tr>`}</tbody></table>
    <p class="muted">Click a row to expand mitigation, trigger, and source detail.</p>
  `;
}

function renderAssumptionsTab(a) {
  const rows = (a.assumptions || []).map((x) => {
    const domId = `assumption-${x.id}`;
    return `<tr id="${domId}"><td>${esc(x.id)}</td><td>${esc(x.statement)}</td><td>${esc(x.riskIfWrong)}</td>
      <td>${esc(x.ownerRole)}</td><td>${aiDate(x.validateBy)}</td>
      <td>${provenanceBadge(x.provenance, { tabKey: "assumptions", domId, queueLabel: `Assumption ${x.id}` })}</td></tr>`;
  }).join("");
  return `<table><thead><tr><th>ID</th><th>Statement</th><th>Risk if wrong</th><th>Owner role</th><th>Validate by</th><th>Provenance</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="6" class="muted">No assumptions generated.</td></tr>`}</tbody></table>`;
}

function renderMilestonesTab(a) {
  const rows = (a.milestones || []).map((m) => {
    const domId = `milestone-${m.id}`;
    return `<tr id="${domId}"><td>${esc(m.id)}</td><td>${esc(m.name)}</td><td>${aiDate(m.targetDate)}</td>
      <td>${esc(m.phaseId)}</td><td>${esc(m.significance)}</td><td>${statusPill(m.status)}</td>
      <td>${provenanceBadge(m.provenance, { tabKey: "milestones", domId, queueLabel: `Milestone ${m.name}` })}</td></tr>`;
  }).join("");
  return `<table><thead><tr><th>ID</th><th>Name</th><th>Target</th><th>Phase</th><th>Significance</th><th>Status</th><th>Provenance</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="7" class="muted">No milestones generated.</td></tr>`}</tbody></table>`;
}

function renderStakeholdersTab(a) {
  const groups = [
    ["decision", "Decision"], ["influence", "Influence"], ["block", "Block (veto holders)"],
    ["support", "Support"], ["beneficiary", "Beneficiary"],
  ];
  return groups.map(([key, label], gi) => {
    const rows = ((a.stakeholders && a.stakeholders[key]) || []).map((s, i) => {
      const domId = `stake-${key}-${i}`;
      return `<tr id="${domId}"><td>${esc(s.name || "(unnamed)")}</td><td>${esc(s.role || "")}</td><td>${esc(s.note || "")}</td>
        <td>${provenanceBadge(s.provenance, { tabKey: "stakeholders", domId, queueLabel: `${label} stakeholder — ${s.name || s.role || ""}` })}</td></tr>`;
    }).join("");
    return `<h3>${esc(label)}</h3><table><thead><tr><th>Name</th><th>Role</th><th>Note</th><th>Provenance</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="4" class="muted">None generated.</td></tr>`}</tbody></table>`;
  }).join("");
}

function renderDependenciesTab(a) {
  const rows = (a.dependencies || []).map((d, i) => {
    const domId = `dep-${i}`;
    return `<tr id="${domId}"><td>${esc(d.from)}</td><td>${esc(d.to)}</td><td>${esc(d.type)}</td>
      <td>${d.lagDays || 0}d</td><td>${d.critical ? pill("Critical path", "pill-critical") : ""}</td>
      <td>${esc(d.note || "")}</td>
      <td>${provenanceBadge(d.provenance, { tabKey: "dependencies", domId, queueLabel: `Dependency ${d.from} → ${d.to}` })}</td></tr>`;
  }).join("");
  return `<table><thead><tr><th>From</th><th>To</th><th>Type</th><th>Lag</th><th></th><th>Note</th><th>Provenance</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="7" class="muted">No dependencies generated.</td></tr>`}</tbody></table>`;
}

function renderBudgetTab(a) {
  const rows = (a.budgetLines || []).map((b) => {
    const domId = `budget-${b.id}`;
    return `<tr id="${domId}"><td>${esc(b.category)}</td><td>${money(b.planned, a.currency)}</td>
      <td>${money(b.actual, a.currency)}</td><td>${esc(b.costType)}</td>
      <td>${provenanceBadge(b.provenance, { tabKey: "budget", domId, queueLabel: `Budget line — ${b.category}` })}</td></tr>`;
  }).join("");
  const total = (a.budgetLines || []).reduce((sum, b) => sum + (Number(b.planned) || 0), 0);
  return `<table><thead><tr><th>Category</th><th>Planned</th><th>Actual</th><th>Type</th><th>Provenance</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="5" class="muted">No budget lines generated.</td></tr>`}</tbody></table>
    <p class="muted">Sum of planned lines: ${money(total, a.currency)}${a.budget ? ` (stated total: ${money(a.budget, a.currency)})` : ""}</p>`;
}

function renderResearchTab(payload) {
  const chips = (payload.searchQueriesExecuted || []).map((q) => `<span class="query-chip">${esc(q)}</span>`).join("");
  const findingRows = (payload.researchFindings || []).map((f) => `
    <div class="finding-row">
      <span class="finding-id">${esc(f.id)}</span>
      <a href="${esc(safeUrl(f.url))}" target="_blank" rel="noopener noreferrer">${esc(f.title)}</a>
      <span class="muted">${esc(f.publishedDate || "")}</span>
    </div>`).join("");
  return `
    <p class="muted">Nothing confidential left the perimeter: only generalized attributes (type, industry, jurisdiction, scale, vendor status, compliance flags) were used to compose search queries — never client, project, sponsor, or description text.</p>
    <h3>Search queries executed (${(payload.searchQueriesExecuted || []).length})</h3>
    <div class="query-chips">${chips || '<span class="muted">None.</span>'}</div>
    <h3>Findings cited (${(payload.researchFindings || []).length})</h3>
    ${findingRows || '<p class="muted">No findings were captured.</p>'}
    <h3>Research summary</h3>
    <p style="white-space:pre-wrap;">${esc(payload.researchSummary || "—")}</p>
  `;
}

function renderFeasibilityPanel(flags) {
  if (!flags || !flags.length) return "";
  const rows = flags.map((f) => `
    <div class="flag-row">
      <div class="flag-head"><span class="flag-area">${esc(f.area)}</span>${sevPill(f.severity)}</div>
      <div class="flag-obs">${esc(f.observation)}</div>
      <div class="flag-bench">${esc(f.benchmark)}${f.provenanceRef && FINDINGS_BY_ID[f.provenanceRef] ? ` — <a href="${esc(safeUrl(FINDINGS_BY_ID[f.provenanceRef].url))}" target="_blank" rel="noopener noreferrer">${esc(f.provenanceRef)}</a>` : ""}</div>
    </div>`).join("");
  return `<div class="card"><h3 class="eyebrow">Feasibility flags (${flags.length})</h3>${rows}</div>`;
}

function renderLowConfidenceQueue() {
  if (!LOW_CONF_QUEUE.length) return "";
  const rows = LOW_CONF_QUEUE.map((q) => `
    <div class="queue-row"><a href="#" data-jump-tab="${esc(q.tabKey)}" data-jump-id="${esc(q.domId)}">${esc(q.label)}</a></div>
  `).join("");
  return `<div class="card"><h3 class="eyebrow">${LOW_CONF_QUEUE.length} item${LOW_CONF_QUEUE.length === 1 ? "" : "s"} need your attention first</h3>
    <details><summary class="muted" style="cursor:pointer;">Show low-confidence items</summary>${rows}</details></div>`;
}

let lastPayload = null;

function renderResults(payload) {
  lastPayload = payload;
  const a = payload.artifact;
  FINDINGS_BY_ID = {};
  (payload.researchFindings || []).forEach((f) => { FINDINGS_BY_ID[f.id] = f; });
  LOW_CONF_QUEUE = [];
  PROV_COUNTER = 0;

  const meta = payload.meta || {};
  $("meta-line").innerHTML = `Model: ${esc(meta.modelId || "—")} ·
    Tokens in/out: ${meta.tokensIn ?? "—"}/${meta.tokensOut ?? "—"} ·
    Est. cost: $${(meta.estimatedCost || 0).toFixed(3)} ·
    Duration: ${((meta.durationMs || 0) / 1000).toFixed(1)}s` +
    (payload.validationWarnings && payload.validationWarnings.length
      ? ` <details style="display:inline"><summary style="display:inline;cursor:pointer;color:var(--warn);">${payload.validationWarnings.length} validation warning(s)</summary><ul>${payload.validationWarnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></details>`
      : "");

  // Tab panels reference LOW_CONF_QUEUE/provenance counters as they render,
  // so build all panel bodies BEFORE the feasibility/queue summary cards.
  const panels = {
    overview: renderOverviewTab(a),
    plan: renderPlanTab(a),
    risks: renderRisksTab(a),
    assumptions: renderAssumptionsTab(a),
    milestones: renderMilestonesTab(a),
    stakeholders: renderStakeholdersTab(a),
    dependencies: renderDependenciesTab(a),
    budget: renderBudgetTab(a),
    research: renderResearchTab(payload),
  };

  const tabBar = TAB_DEFS.map((t, i) => `<button type="button" class="tab-btn${i === 0 ? " active" : ""}" data-tab="${t.key}">${esc(t.label)}</button>`).join("");
  const tabPanels = TAB_DEFS.map((t, i) => `<div class="tab-panel${i === 0 ? " active" : ""}" id="tab-${t.key}">${panels[t.key]}</div>`).join("");

  const html = `
    <div class="banner banner-warn">All dates are suggestions. Confirm or adjust before this plan is used for commitments.</div>
    ${renderFeasibilityPanel(a.feasibilityFlags)}
    ${renderLowConfidenceQueue()}
    <div class="tab-bar">${tabBar}</div>
    ${tabPanels}
  `;
  $("results-body").innerHTML = html;
}

// ---------------------------------------------------------------------------
// Interactivity (event delegation — content above is rebuilt wholesale per
// generation, so listeners are attached once here rather than per element)

document.addEventListener("click", (e) => {
  const tabBtn = e.target.closest(".tab-btn");
  if (tabBtn) { setActiveTab(tabBtn.dataset.tab); return; }

  const provBtn = e.target.closest(".prov-badge");
  if (provBtn) {
    e.stopPropagation();
    const pop = document.getElementById(provBtn.dataset.pop);
    const wasOpen = pop && pop.classList.contains("open");
    document.querySelectorAll(".prov-pop.open").forEach((p) => p.classList.remove("open"));
    if (pop && !wasOpen) pop.classList.add("open");
    return;
  }

  const jumpEl = e.target.closest("[data-jump-tab]");
  if (jumpEl) {
    e.preventDefault();
    setActiveTab(jumpEl.dataset.jumpTab);
    const target = document.getElementById(jumpEl.dataset.jumpId);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const toggleRow = e.target.closest("tr.clickable");
  if (toggleRow) {
    const detail = document.getElementById(toggleRow.dataset.toggle);
    if (detail) detail.classList.toggle("open");
    return;
  }

  document.querySelectorAll(".prov-pop.open").forEach((p) => p.classList.remove("open"));
});

function setActiveTab(key) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === key));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + key));
}

// ---------------------------------------------------------------------------
// Generate flow

const LOADING_STAGES = [
  "Researching regulatory and market context…",
  "Drafting artifacts…",
  "Checking consistency…",
];

async function generate() {
  const btn = $("generate-btn");
  const statusLine = $("status-line");
  statusLine.classList.remove("err");

  if (!$("f-start-date").value || !$("f-end-date").value) {
    statusLine.classList.add("err");
    statusLine.textContent = "Start date and target end date are required.";
    return;
  }
  if (!getChecked("jurisdiction").length) {
    statusLine.classList.add("err");
    statusLine.textContent = "Select at least one jurisdiction.";
    return;
  }

  btn.disabled = true;
  $("results-card").style.display = "none";

  let stage = 0;
  statusLine.textContent = LOADING_STAGES[0];
  const stageTimer = setInterval(() => {
    stage = Math.min(stage + 1, LOADING_STAGES.length - 1);
    statusLine.textContent = LOADING_STAGES[stage];
  }, 6000);

  const intake = readIntake();
  const model = $("model-select").value;
  const token = sessionStorage.getItem(SESSION_KEY);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: "Bearer " + token } : {}),
      },
      body: JSON.stringify({ intake, model }),
    });

    if (res.status === 401) {
      clearSession();
      showGate("Session expired or invalid. Please log in again.");
      return;
    }

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      // The server didn't return JSON at all (crashed process, platform
      // timeout page, proxy error, etc). Show the raw body instead of a
      // cryptic parse-error message so the actual cause is visible.
      console.error("Non-JSON response from /api/generate:", res.status, rawText);
      $("results-card").style.display = "block";
      $("meta-line").textContent = "";
      $("results-body").innerHTML = `<div class="err-box">Server returned a non-JSON response (HTTP ${res.status}). This usually means the function crashed or was killed by a platform timeout before it could finish.<br><br><strong>Raw response${rawText ? " (first 800 chars)" : ""}:</strong><pre style="white-space:pre-wrap;">${esc(rawText ? rawText.slice(0, 800) : "(empty body)")}</pre></div>`;
      statusLine.textContent = "";
      return;
    }

    if (!res.ok || data.error) {
      $("results-card").style.display = "block";
      $("meta-line").textContent = "";
      const detail = data.stopDetails ? ` (category: ${data.stopDetails.category || "unspecified"})` : data.detail ? " — " + JSON.stringify(data.detail).slice(0, 300) : "";
      $("results-body").innerHTML = `<div class="err-box">${esc(data.error)}${esc(detail)}</div>`;
      statusLine.textContent = "";
      return;
    }

    renderResults(data);
    $("results-card").style.display = "block";
    statusLine.textContent = "Done.";
  } catch (err) {
    console.error("generate() failed:", err);
    $("results-card").style.display = "block";
    $("meta-line").textContent = "";
    $("results-body").innerHTML = `<div class="err-box">${esc(err.name || "Error")}: ${esc(err.message)}</div>`;
    statusLine.classList.add("err");
    statusLine.textContent = "Request failed.";
  } finally {
    clearInterval(stageTimer);
    btn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Excel export — client-side only, no server round-trip. One sheet per
// artifact type so it's usable directly, not a JSON dump.

function provCols(p) {
  return {
    Confidence: p ? cap(p.confidence || "") : "",
    Basis: p && Array.isArray(p.basis) ? p.basis.join(" + ") : "",
    "Provenance Detail": p ? p.detail || "" : "",
  };
}

function autoWidth(rows) {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((k) => {
    const maxLen = rows.reduce((m, r) => Math.max(m, String(r[k] ?? "").length), k.length);
    return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
  });
}

function sheetFromRows(wb, name, rows) {
  const ws = rows.length ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([["(none generated)"]]);
  if (rows.length) ws["!cols"] = autoWidth(rows);
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)); // Excel sheet-name length cap
}

function exportToExcel() {
  if (!lastPayload) return;
  if (typeof XLSX === "undefined") {
    alert("The Excel export library failed to load (check your connection) — try again.");
    return;
  }
  const a = lastPayload.artifact;
  const meta = lastPayload.meta || {};
  const wb = XLSX.utils.book_new();

  sheetFromRows(wb, "Overview", [{
    "Project Name": a.name || "", Type: a.type || "", Client: a.client || "",
    Industry: a.industry || "", Sponsor: a.sponsor || "", "Scale Tier": a.scaleTier ?? "",
    "Scale Tier Rationale": a.scaleTierRationale || "", RAG: a.rag || "", "RAG Reason": a.ragReason || "",
    Duration: a.duration || "", Budget: a.budget ?? "", Currency: a.currency || "",
    Objective: a.objective || "", "Definition of Done": a.dod || "",
    Model: meta.modelId || "", "Est. Cost (USD)": meta.estimatedCost != null ? meta.estimatedCost.toFixed(3) : "",
  }]);

  sheetFromRows(wb, "Phases", (a.phases || []).map((p) => ({
    ID: p.id, Name: p.name, Window: p.window, "Start Date": p.startDate, "End Date": p.endDate,
    Objective: p.objective || "", ...provCols(p.provenance),
  })));

  sheetFromRows(wb, "Workstreams", (a.workstreams || []).map((w) => ({ Workstream: w })));

  sheetFromRows(wb, "Tasks", (a.tasks || []).map((t) => ({
    Key: t.key, ID: t.id, Phase: t.phase, Workstream: t.workstream, Task: t.task,
    Priority: t.priority, "Start Date": t.startDate, "End Date": t.endDate,
    "Owner Role": t.ownerRole || t.owner, Status: t.status, ...provCols(t.provenance),
  })));

  sheetFromRows(wb, "Risks", (a.risks || []).map((r) => ({
    ID: r.id, Category: r.category, Description: r.desc,
    "Inherent Severity": r.inherentSeverity || r.severity, "Inherent Likelihood": r.inherentLikelihood || r.likelihood,
    "Response Strategy": r.responseStrategy, Mitigation: r.mitigation,
    "Mitigation Owner Role": r.mitigationOwnerRole, "Mitigation Target Date": r.mitigationTargetDate,
    "Residual Severity": r.residualSeverity, "Residual Likelihood": r.residualLikelihood,
    Trigger: r.trigger, Status: r.status, Source: r.source, "Source Label": r.sourceLabel,
    ...provCols(r.provenance),
  })));

  sheetFromRows(wb, "Assumptions", (a.assumptions || []).map((x) => ({
    ID: x.id, Statement: x.statement, "Risk If Wrong": x.riskIfWrong,
    "Owner Role": x.ownerRole, "Validate By": x.validateBy, ...provCols(x.provenance),
  })));

  sheetFromRows(wb, "Milestones", (a.milestones || []).map((m) => ({
    ID: m.id, Name: m.name, "Target Date": m.targetDate, Phase: m.phaseId,
    Significance: m.significance, Status: m.status, ...provCols(m.provenance),
  })));

  const stakeRows = [];
  ["decision", "influence", "block", "support", "beneficiary"].forEach((key) => {
    ((a.stakeholders && a.stakeholders[key]) || []).forEach((s) => {
      stakeRows.push({ Category: cap(key), Name: s.name || "", Role: s.role || "", Note: s.note || "", ...provCols(s.provenance) });
    });
  });
  sheetFromRows(wb, "Stakeholders", stakeRows);

  sheetFromRows(wb, "Dependencies", (a.dependencies || []).map((d) => ({
    From: d.from, To: d.to, Type: d.type, "Lag Days": d.lagDays || 0,
    Critical: d.critical ? "Yes" : "No", Note: d.note || "", ...provCols(d.provenance),
  })));

  sheetFromRows(wb, "Budget", (a.budgetLines || []).map((b) => ({
    Category: b.category, Planned: b.planned ?? "", Actual: b.actual ?? "", "Cost Type": b.costType, ...provCols(b.provenance),
  })));

  sheetFromRows(wb, "Feasibility Flags", (a.feasibilityFlags || []).map((f) => ({
    Area: f.area, Observation: f.observation, Benchmark: f.benchmark,
    Severity: f.severity, "Finding Ref": f.provenanceRef || "",
  })));

  sheetFromRows(wb, "Search Queries", (lastPayload.searchQueriesExecuted || []).map((q) => ({ "Search Query": q })));

  sheetFromRows(wb, "Research Findings", (lastPayload.researchFindings || []).map((f) => ({
    ID: f.id, Title: f.title, URL: f.url, "Published Date": f.publishedDate || "",
  })));

  const safeName = (a.idPrefix || a.name || "epmo-draft").toString().replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "");
  XLSX.writeFile(wb, `${safeName || "epmo-draft"}-artifacts.xlsx`);
}

// ---------------------------------------------------------------------------

function initApp() {
  renderCheckGroup("jurisdiction-checks", "jurisdiction", JURISDICTIONS, (x) => x, (x) => x);
  renderCheckGroup("compliance-checks", "compliance", COMPLIANCE_FLAGS, (x) => x.value, (x) => x.label);
  populateSampleSelect();
  applySample($("sample-select").value);
  $("sample-select").addEventListener("change", (e) => applySample(e.target.value));
  $("generate-btn").addEventListener("click", generate);
  $("export-xlsx-btn").addEventListener("click", exportToExcel);
}
