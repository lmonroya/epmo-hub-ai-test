// Sample data below is copied verbatim from the EPMO Hub mockup's own
// PROJECTS object (Core Banking Platform Migration, APAC Market Entry) —
// both the intake fields and the mockup's existing templated output, so
// the comparison is against real content, not a re-imagined version of it.

const SAMPLES = {
  "core-banking": {
    intake: {
      name: "Core Banking Platform Migration",
      type: "Infrastructure / Technology Build",
      client: "Meridian Trust Bank",
      industry: "Financial Services / Retail Banking",
      sponsor: "M. Reyes, COO",
      duration: "Jan 2026 – Dec 2026",
      budget: 4200000,
      objective:
        "Migrate core banking ledger and transaction processing from the legacy mainframe to a modern cloud-native platform without disrupting daily branch operations.",
      dod:
        "Legacy mainframe fully decommissioned; 100% of transaction volume processed on the new platform for 60 consecutive days with zero critical incidents.",
      teamCapacity:
        "Architecture Guild, Integration Pod, and InfoSec are the primary internal teams; branch training relies on 12 regional ops managers; D. Alvarez is program lead.",
      decisionMakers: "M. Reyes, COO (Executive Sponsor); Steering Committee (monthly go/no-go on cutover gates)",
      influencers: "Core Platform Vendor Account Exec (delivery pod allocation); Head of Retail Banking Ops (branch rollout sequencing)",
      blockers: "Federal Reserve Examiner — regulatory approval gate before cutover; examiner has not yet confirmed audit logging scope.",
      supporters: "12 regional branch ops managers coordinating local training.",
      constraints:
        "Regulatory sign-off requires a full 60-day clean parallel run with zero exceptions before the legacy mainframe can be decommissioned; cutover cannot move earlier than Dec 2026.",
      anythingElse:
        "Core platform vendor was previously over-allocated across three concurrent client migrations, causing a 3-week Phase 2 slip; a dedicated vendor delivery pod was escalated into place in Q3.",
    },
    mockupOutput: {
      phases: [
        { id: "p1", name: "Phase 1 — Foundation & Design", window: "Jan – Mar 2026" },
        { id: "p2", name: "Phase 2 — Build & Parallel Run", window: "Apr – Sep 2026" },
        { id: "p3", name: "Phase 3 — Cutover & Stabilization", window: "Oct – Dec 2026" },
      ],
      workstreams: ["Architecture", "Vendor Management", "Integration", "Change Management", "Security", "Operations"],
      tasks: [
        { id: "CB-01", phase: "p1", workstream: "Architecture", task: "Finalize target-state architecture and data model", priority: "critical", startDate: "2026-01-05", endDate: "2026-02-10", owner: "Architecture Guild", status: "Complete" },
        { id: "CB-02", phase: "p1", workstream: "Vendor Management", task: "Execute master services agreement with core platform vendor", priority: "critical", startDate: "2026-01-10", endDate: "2026-02-20", owner: "D. Alvarez", status: "Complete" },
        { id: "CB-03", phase: "p2", workstream: "Integration", task: "Build reconciliation batch job between legacy and new ledger", priority: "high", startDate: "2026-04-01", endDate: "2026-07-15", owner: "Integration Pod", status: "In Progress" },
        { id: "CB-04", phase: "p2", workstream: "Change Management", task: "Deliver branch staff training, wave 1 (120 staff)", priority: "high", startDate: "2026-05-01", endDate: "2026-06-30", owner: "L. Ferris", status: "In Progress" },
        { id: "CB-05", phase: "p2", workstream: "Security", task: "Implement just-in-time credential issuance for migration scripts", priority: "critical", startDate: "2026-08-01", endDate: "2026-09-15", owner: "InfoSec", status: "Not Started" },
        { id: "CB-06", phase: "p3", workstream: "Operations", task: "Run 60-day clean parallel period sign-off", priority: "critical", startDate: "2026-10-01", endDate: "2026-11-30", owner: "Architecture Guild", status: "Not Started" },
        { id: "CB-07", phase: "p3", workstream: "Operations", task: "Decommission legacy mainframe", priority: "critical", startDate: "2026-12-01", endDate: "2026-12-20", owner: "D. Alvarez", status: "Not Started" },
      ],
      risks: [
        { id: "R-014", category: "Integration", desc: "Legacy core ledger API lacks real-time reconciliation hooks, risking data drift during the parallel run.", severity: "high", likelihood: "medium", mitigation: "Add a nightly reconciliation batch job as an interim control until real-time hooks ship in vendor release v2.2.", status: "Open" },
        { id: "R-015", category: "Vendor", desc: "Core platform vendor's implementation team is over-allocated across three concurrent client migrations.", severity: "high", likelihood: "high", mitigation: "Escalate to the vendor account executive; request a dedicated delivery pod for Q3.", status: "Open" },
        { id: "R-016", category: "Regulatory", desc: "The Federal Reserve's updated real-time payments guidance (RTP Rule 2026-04) may require additional audit logging not yet scoped.", severity: "medium", likelihood: "medium", mitigation: "Confirm scope with Compliance; add an audit-logging story to the integration backlog.", status: "Open" },
        { id: "R-017", category: "Change Management", desc: "Branch staff report low confidence with new teller workflows during UAT feedback sessions.", severity: "medium", likelihood: "high", mitigation: "Expand hands-on training sessions; add in-app guided walkthroughs for the first 30 days live.", status: "Mitigated" },
        { id: "R-018", category: "Security", desc: "Data migration scripts require elevated database credentials that are not currently time-boxed.", severity: "critical", likelihood: "low", mitigation: "Implement just-in-time credential issuance with a 4-hour expiry window.", status: "Open" },
      ],
      stakeholders: {
        decision: [{ name: "M. Reyes", note: "COO, Executive Sponsor" }, { name: "Steering Committee", note: "Monthly go/no-go on cutover gates" }],
        influence: [{ name: "Core Platform Vendor Account Exec", note: "Delivery pod allocation" }, { name: "Head of Retail Banking Ops", note: "Branch rollout sequencing" }],
        block: [{ name: "Federal Reserve Examiner", note: "Regulatory approval gate before cutover" }],
        support: [{ name: "Regional Branch Ops Managers (12)", note: "Local training coordination" }],
      },
      budgetLines: [
        { category: "Vendor Licensing & Implementation", planned: 1650000, actual: 1180000 },
        { category: "Internal Labor", planned: 1400000, actual: 1020000 },
        { category: "Training & Change Management", planned: 380000, actual: 210000 },
        { category: "Infrastructure & Cloud", planned: 520000, actual: 340000 },
        { category: "Contingency (15%)", planned: 250000, actual: 0 },
      ],
    },
  },
  "apac-expansion": {
    intake: {
      name: "APAC Market Entry — Retail Expansion",
      type: "Strategic Growth",
      client: "Northfield Retail Group",
      industry: "Retail / International Expansion",
      sponsor: "A. Lindqvist, CEO",
      duration: "Mar 2026 – Feb 2027",
      budget: 2800000,
      objective:
        "Establish a direct-to-consumer retail presence in Singapore and Malaysia as a beachhead for broader APAC expansion.",
      dod:
        "Three flagship stores open and operating at 80% or more of first-year sales targets by the end of Q4 2027.",
      teamCapacity:
        "S. Okafor leads the program; Legal, a third-party Build Partner for store fit-out, Regional HR, and Regional Marketing are the supporting teams.",
      decisionMakers: "A. Lindqvist, CEO (Executive Sponsor)",
      influencers: "Regional Marketing Director (launch campaign sequencing)",
      blockers: "Malaysia Ministry of Domestic Trade — retail operating license application still pending regulator review (Owner: Legal).",
      supporters: "Singapore & Kuala Lumpur store teams handling local market execution.",
      constraints:
        "Malaysia requires a locally incorporated entity with a resident director before any retail operating license can be issued; marketing spend is held until stores are ready.",
      anythingElse:
        "A local Singapore competitor announced an aggressive pricing campaign in the Orchard Road corridor ahead of launch; launch pricing was adjusted for the first 90 days in response.",
    },
    mockupOutput: {
      phases: [
        { id: "p1", name: "Phase 1 — Market Entry Setup", window: "Mar – Jun 2026" },
        { id: "p2", name: "Phase 2 — Build-Out & Hiring", window: "Jul – Nov 2026" },
        { id: "p3", name: "Phase 3 — Launch & Ramp", window: "Dec 2026 – Feb 2027" },
      ],
      workstreams: ["Legal & Entity", "Real Estate", "Store Build-Out", "Talent", "Marketing"],
      tasks: [
        { id: "AP-01", phase: "p1", workstream: "Legal & Entity", task: "Incorporate Malaysia entity and secure resident director", priority: "critical", startDate: "2026-03-01", endDate: "2026-04-15", owner: "Legal", status: "Complete" },
        { id: "AP-02", phase: "p1", workstream: "Real Estate", task: "Finalize lease agreements for 3 flagship sites", priority: "critical", startDate: "2026-03-10", endDate: "2026-05-01", owner: "S. Okafor", status: "Complete" },
        { id: "AP-03", phase: "p2", workstream: "Store Build-Out", task: "Complete fit-out for Singapore flagship (Orchard Road)", priority: "high", startDate: "2026-07-01", endDate: "2026-10-15", owner: "Build Partner", status: "In Progress" },
        { id: "AP-04", phase: "p2", workstream: "Talent", task: "Hire and train store managers across 3 markets", priority: "high", startDate: "2026-07-15", endDate: "2026-11-01", owner: "Regional HR", status: "In Progress" },
        { id: "AP-05", phase: "p3", workstream: "Marketing", task: "Execute launch campaign across 3 markets", priority: "high", startDate: "2026-12-01", endDate: "2027-02-15", owner: "Regional Marketing", status: "Not Started" },
      ],
      risks: [
        { id: "R-101", category: "Market", desc: "A local competitor announced an aggressive pricing campaign in the Singapore Orchard Road corridor ahead of our launch.", severity: "medium", likelihood: "medium", mitigation: "Adjust the launch pricing bundle for the first 90 days; monitor competitor response weekly.", status: "Open" },
        { id: "R-102", category: "Regulatory", desc: "Malaysia requires a locally incorporated entity with a resident director before retail operating licenses can be issued.", severity: "high", likelihood: "high", mitigation: "Engage local counsel; incorporation targeted for Month 2.", status: "Mitigated" },
        { id: "R-103", category: "Talent", desc: "The retail hiring pipeline for store managers in Kuala Lumpur is thinner than modeled.", severity: "medium", likelihood: "medium", mitigation: "Partner with two additional recruiting agencies; extend relocation packages to Singapore-based candidates.", status: "Open" },
        { id: "R-104", category: "Supply Chain", desc: "The regional distribution partner has no prior experience with our product's cold-chain requirements.", severity: "low", likelihood: "low", mitigation: "Run a trial shipment before committing to a full-volume contract.", status: "Open" },
      ],
      stakeholders: {
        decision: [{ name: "A. Lindqvist", note: "CEO, Executive Sponsor" }],
        influence: [{ name: "Regional Marketing Director", note: "Launch campaign sequencing" }],
        block: [{ name: "Malaysia Ministry of Domestic Trade", note: "Retail operating license approval" }],
        support: [{ name: "Singapore & KL Store Teams", note: "Local market execution" }],
      },
      budgetLines: [
        { category: "Real Estate & Build-Out", planned: 1400000, actual: 980000 },
        { category: "Hiring & Training", planned: 520000, actual: 310000 },
        { category: "Launch Marketing", planned: 600000, actual: 90000 },
        { category: "Legal & Entity Setup", planned: 280000, actual: 265000 },
      ],
    },
  },
};

const $ = (id) => document.getElementById(id);
let currentView = "claude";
let lastResult = null; // { claude: artifacts, mockup: mockupOutput }

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
  $("f-name").value = intake.name;
  $("f-type").value = intake.type;
  $("f-client").value = intake.client;
  $("f-industry").value = intake.industry;
  $("f-sponsor").value = intake.sponsor;
  $("f-duration").value = intake.duration;
  $("f-budget").value = intake.budget;
  $("f-objective").value = intake.objective;
  $("f-dod").value = intake.dod;
  $("f-team-capacity").value = intake.teamCapacity || "";
  $("f-decision-makers").value = intake.decisionMakers || "";
  $("f-influencers").value = intake.influencers || "";
  $("f-blockers").value = intake.blockers || "";
  $("f-supporters").value = intake.supporters || "";
  $("f-constraints").value = intake.constraints || "";
  $("f-anything-else").value = intake.anythingElse || "";
}

function readIntake() {
  return {
    name: $("f-name").value,
    type: $("f-type").value,
    client: $("f-client").value,
    industry: $("f-industry").value,
    sponsor: $("f-sponsor").value,
    duration: $("f-duration").value,
    budget: $("f-budget").value,
    objective: $("f-objective").value,
    dod: $("f-dod").value,
    teamCapacity: $("f-team-capacity").value,
    decisionMakers: $("f-decision-makers").value,
    influencers: $("f-influencers").value,
    blockers: $("f-blockers").value,
    supporters: $("f-supporters").value,
    constraints: $("f-constraints").value,
    anythingElse: $("f-anything-else").value,
  };
}

function pill(text, cls) {
  return `<span class="pill ${cls || "pill-neutral"}">${text}</span>`;
}
function sevPill(v) {
  const s = String(v || "").toLowerCase();
  if (s === "critical") return pill(v, "pill-critical");
  if (s === "high" || s === "warn") return pill(v, "pill-warn");
  if (s === "low" || s === "good" || s === "mitigated") return pill(v, "pill-good");
  return pill(v, "pill-neutral");
}
function money(n) {
  const num = Number(n);
  return isNaN(num) ? "—" : "$" + Math.round(num).toLocaleString("en-US");
}

function renderArtifactSet(a) {
  if (!a) return '<p class="muted">No data.</p>';
  const phasesHtml = (a.phases || [])
    .map((p) => `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.window}</td></tr>`)
    .join("");
  const tasksHtml = (a.tasks || [])
    .map(
      (t) =>
        `<tr><td>${t.id}</td><td>${t.task}</td><td>${t.workstream}</td><td>${sevPill(t.priority)}</td><td>${t.startDate} → ${t.endDate}</td><td>${t.owner}</td><td>${pill(t.status)}</td></tr>`
    )
    .join("");
  const risksHtml = (a.risks || [])
    .map(
      (r) =>
        `<tr><td>${r.id}</td><td>${r.category}</td><td>${r.desc}</td><td>${sevPill(r.severity)}</td><td>${sevPill(r.likelihood)}</td><td>${r.mitigation}</td><td>${sevPill(r.status)}</td><td class="muted">${r.sourceNote || "—"}</td></tr>`
    )
    .join("");
  const stakeGroups = ["decision", "influence", "block", "support"]
    .map((k) => {
      const rows = ((a.stakeholders && a.stakeholders[k]) || [])
        .map((s) => `<tr><td>${s.name}</td><td>${s.note}</td></tr>`)
        .join("");
      if (!rows) return "";
      return `<h4 style="text-transform:capitalize;">${k}</h4><table><tbody>${rows}</tbody></table>`;
    })
    .join("");
  const budgetHtml = (a.budgetLines || [])
    .map((b) => `<tr><td>${b.category}</td><td>${money(b.planned)}</td><td>${money(b.actual)}</td></tr>`)
    .join("");

  return `
    <h3>Phases</h3>
    <table><thead><tr><th>ID</th><th>Name</th><th>Window</th></tr></thead><tbody>${phasesHtml}</tbody></table>
    <h3>Tasks</h3>
    <table><thead><tr><th>ID</th><th>Task</th><th>Workstream</th><th>Priority</th><th>Dates</th><th>Owner</th><th>Status</th></tr></thead><tbody>${tasksHtml}</tbody></table>
    <h3>Risks</h3>
    <table><thead><tr><th>ID</th><th>Category</th><th>Description</th><th>Sev</th><th>Likelihood</th><th>Mitigation</th><th>Status</th><th>Grounded In</th></tr></thead><tbody>${risksHtml}</tbody></table>
    <h3>Stakeholders</h3>
    ${stakeGroups}
    <h3>Budget</h3>
    <table><thead><tr><th>Category</th><th>Planned</th><th>Actual</th></tr></thead><tbody>${budgetHtml}</tbody></table>
  `;
}

function renderResults() {
  const body = $("results-body");
  if (!lastResult) return;
  if (currentView === "claude") {
    body.className = "results-body";
    body.innerHTML = renderArtifactSet(lastResult.claude);
  } else if (currentView === "mockup") {
    body.className = "results-body";
    body.innerHTML = renderArtifactSet(lastResult.mockup);
  } else {
    body.className = "results-body side";
    body.innerHTML = `
      <div class="results-col"><h4>Claude (real generation)</h4>${renderArtifactSet(lastResult.claude)}</div>
      <div class="results-col"><h4>Mockup (existing templated output)</h4>${renderArtifactSet(lastResult.mockup)}</div>
    `;
  }
}

function renderResearchBox(researchSummary, searchQueries) {
  const section = $("research-section");
  if (!researchSummary && !(searchQueries && searchQueries.length)) {
    section.style.display = "none";
    return;
  }
  section.style.display = "block";
  const chipsEl = $("research-queries");
  chipsEl.innerHTML = (searchQueries || [])
    .map((q) => `<span class="query-chip">${q}</span>`)
    .join("");
  $("research-summary").textContent = researchSummary || "(No summary text — search was run but the model produced no written findings.)";
}

async function generate() {
  const btn = $("generate-btn");
  const statusLine = $("status-line");
  btn.disabled = true;
  statusLine.textContent = "Researching, then generating… (two model calls, can take 15–30s)";
  $("results-card").style.display = "none";
  $("research-section").style.display = "none";

  const sampleKey = $("sample-select").value;
  const intake = readIntake();
  const model = $("model-select").value;
  const password = $("f-password").value;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ intake, model, password }),
    });
    const data = await res.json();

    // Refusals return HTTP 200 with an `error` field (research step or
    // generation step declined) rather than a network/server failure —
    // check for it before assuming success just because res.ok is true.
    if (!res.ok || data.error) {
      $("results-card").style.display = "block";
      renderResearchBox(data.researchSummary, data.searchQueries);
      $("meta-line").textContent = "";
      $("results-body").className = "results-body";
      const detail = data.stopDetails ? ` (category: ${data.stopDetails.category || "unspecified"})` : data.detail ? " — " + JSON.stringify(data.detail).slice(0, 300) : "";
      $("results-body").innerHTML = `<div class="err-box research-error">${data.error}${detail}</div>`;
      statusLine.textContent = "";
      return;
    }

    lastResult = {
      claude: data.artifacts,
      mockup: sampleKey !== "__custom__" ? SAMPLES[sampleKey].mockupOutput : null,
    };
    $("meta-line").textContent = `Model: ${data.model} · Latency: ${(data.latencyMs / 1000).toFixed(1)}s` +
      (data.usage ? ` · Input tokens: ${data.usage.input_tokens} · Output tokens: ${data.usage.output_tokens}` : "");
    renderResearchBox(data.researchSummary, data.searchQueries);
    $("results-card").style.display = "block";
    renderResults();
    statusLine.textContent = "";
  } catch (err) {
    $("results-card").style.display = "block";
    $("meta-line").textContent = "";
    $("results-body").className = "results-body";
    $("results-body").innerHTML = `<div class="err-box">${err.message}</div>`;
    statusLine.textContent = "";
  } finally {
    btn.disabled = false;
  }
}

populateSampleSelect();
applySample($("sample-select").value);
$("sample-select").addEventListener("change", (e) => applySample(e.target.value));
$("generate-btn").addEventListener("click", generate);
document.querySelectorAll(".toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentView = btn.dataset.view;
    renderResults();
  });
});
