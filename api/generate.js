// Vercel serverless function — proxies a structured project-artifact generation
// request to the real Anthropic API. Exists so the API key never reaches the browser.
//
// This is a test harness only: it compares real Claude output against EPMO Hub's
// mockup-templated output for the same sample project. It is not part of the
// mockup itself and does not persist anything.

const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const ALLOWED_MODELS = new Set([
  "claude-opus-5",
  "claude-sonnet-5",
  "claude-haiku-4-5-20251001",
]);

const ARTIFACT_TOOL = {
  name: "submit_project_artifacts",
  description:
    "Submit a complete, realistic first-draft project plan, risk register, stakeholder map, and budget for a new EPMO project, based on the intake details provided.",
  input_schema: {
    type: "object",
    properties: {
      phases: {
        type: "array",
        description: "3-5 sequential project phases.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "short id, e.g. p1" },
            name: { type: "string" },
            window: { type: "string", description: "e.g. 'Jan – Mar 2026'" },
          },
          required: ["id", "name", "window"],
        },
      },
      workstreams: {
        type: "array",
        description: "4-8 workstream names spanning the project.",
        items: { type: "string" },
      },
      tasks: {
        type: "array",
        description: "8-16 concrete tasks distributed across the phases and workstreams.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "short id, e.g. T-01" },
            phase: { type: "string", description: "must match a phase id above" },
            workstream: { type: "string", description: "must match a workstream above" },
            task: { type: "string" },
            priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
            startDate: { type: "string", description: "YYYY-MM-DD" },
            endDate: { type: "string", description: "YYYY-MM-DD" },
            owner: { type: "string", description: "a role or team, e.g. 'Integration Pod'" },
            status: { type: "string", enum: ["Not Started", "In Progress", "Complete"] },
          },
          required: ["id", "phase", "workstream", "task", "priority", "startDate", "endDate", "owner", "status"],
        },
      },
      risks: {
        type: "array",
        description: "4-7 realistic risks.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "short id, e.g. R-01" },
            category: { type: "string" },
            desc: { type: "string" },
            severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
            likelihood: { type: "string", enum: ["high", "medium", "low"] },
            mitigation: { type: "string" },
            status: { type: "string", enum: ["Open", "Mitigated"] },
          },
          required: ["id", "category", "desc", "severity", "likelihood", "mitigation", "status"],
        },
      },
      stakeholders: {
        type: "object",
        description: "Stakeholder map by category.",
        properties: {
          decision: { type: "array", items: { type: "object", properties: { name: { type: "string" }, note: { type: "string" } }, required: ["name", "note"] } },
          influence: { type: "array", items: { type: "object", properties: { name: { type: "string" }, note: { type: "string" } }, required: ["name", "note"] } },
          block: { type: "array", items: { type: "object", properties: { name: { type: "string" }, note: { type: "string" } }, required: ["name", "note"] } },
          support: { type: "array", items: { type: "object", properties: { name: { type: "string" }, note: { type: "string" } }, required: ["name", "note"] } },
        },
        required: ["decision", "influence", "block", "support"],
      },
      budgetLines: {
        type: "array",
        description: "4-6 budget line items that sum to roughly the stated total budget.",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            planned: { type: "number" },
            actual: { type: "number", description: "always 0 for a brand-new project" },
          },
          required: ["category", "planned", "actual"],
        },
      },
    },
    required: ["phases", "workstreams", "tasks", "risks", "stakeholders", "budgetLines"],
  },
};

function buildPrompt(intake) {
  return [
    `Project name: ${intake.name || "(untitled)"}`,
    `Type: ${intake.type || "n/a"}`,
    `Client: ${intake.client || "Internal"}`,
    `Industry / line of business: ${intake.industry || "n/a"}`,
    `Sponsor: ${intake.sponsor || "n/a"}`,
    `Duration: ${intake.duration || "n/a"}`,
    `Total budget: ${intake.budget ? "$" + Number(intake.budget).toLocaleString("en-US") : "n/a"}`,
    `Objective: ${intake.objective || "n/a"}`,
    `Definition of done: ${intake.dod || "n/a"}`,
    "",
    "Generate a complete, realistic first-draft project plan, risk register, stakeholder map, and budget for this project by calling the submit_project_artifacts tool. Be specific and grounded in the details above rather than generic.",
  ].join("\n");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const gatePassword = process.env.TEST_HARNESS_PASSWORD;
  if (gatePassword) {
    const provided = req.body && req.body.password;
    if (provided !== gatePassword) {
      res.status(401).json({ error: "Incorrect password." });
      return;
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });
    return;
  }

  const { intake, model } = req.body || {};
  if (!intake || typeof intake !== "object") {
    res.status(400).json({ error: "Missing 'intake' object in request body." });
    return;
  }
  const chosenModel = ALLOWED_MODELS.has(model) ? model : "claude-sonnet-5";

  const startedAt = Date.now();
  let anthropicRes;
  try {
    anthropicRes = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: chosenModel,
        max_tokens: 4096,
        system:
          "You are an EPMO (Enterprise Project Management Office) planning assistant. You draft complete, realistic first-version project artifacts from a short intake description. You always respond by calling the provided tool — never in plain text.",
        messages: [{ role: "user", content: buildPrompt(intake) }],
        tools: [ARTIFACT_TOOL],
        tool_choice: { type: "tool", name: "submit_project_artifacts" },
      }),
    });
  } catch (err) {
    res.status(502).json({ error: "Could not reach the Anthropic API.", detail: String(err) });
    return;
  }

  const latencyMs = Date.now() - startedAt;

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text().catch(() => "");
    res.status(anthropicRes.status).json({ error: "Anthropic API error.", detail: text });
    return;
  }

  const data = await anthropicRes.json();
  const toolUse = (data.content || []).find((b) => b.type === "tool_use");
  if (!toolUse) {
    res.status(502).json({ error: "Model did not return a tool call.", detail: data });
    return;
  }

  res.status(200).json({
    model: chosenModel,
    latencyMs,
    usage: data.usage || null,
    artifacts: toolUse.input,
  });
};
