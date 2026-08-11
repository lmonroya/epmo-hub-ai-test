// Vercel serverless function — proxies a structured, research-grounded
// project-artifact generation request to the real Anthropic API. Exists so
// the API key never reaches the browser.
//
// Two-step flow:
//   1. Research — the model uses the real web_search tool to find current
//      regulatory, market, and vendor context relevant to this project.
//      No forced tool_choice here: forcing a tool skips straight to that
//      tool call, which would prevent the model from searching first.
//   2. Generate — a follow-up turn, in the same conversation (so the
//      research is in context), with tool_choice forced onto
//      submit_project_artifacts, grounded in what step 1 found.
//
// This is a test harness only: it compares real Claude output against EPMO
// Hub's mockup-templated output for the same sample project. It is not part
// of the mockup itself and does not persist anything.

const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const ALLOWED_MODELS = new Set([
  "claude-opus-5",
  "claude-sonnet-5",
  "claude-haiku-4-5-20251001",
]);

const WEB_SEARCH_TOOL = {
  type: "web_search_20260209",
  name: "web_search",
  max_uses: 4,
};

const ARTIFACT_TOOL = {
  name: "submit_project_artifacts",
  description:
    "Submit a complete, realistic first-draft project plan, risk register, stakeholder map, and budget for a new EPMO project, based on the intake details and research provided.",
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
        description:
          "4-7 realistic risks. Where the research findings surfaced a specific, current regulatory, market, or vendor concern, reflect it here with sourceNote citing what was found.",
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
            sourceNote: {
              type: "string",
              description: "If this risk was grounded in a web search finding, briefly say what/where. Empty string otherwise.",
            },
          },
          required: ["id", "category", "desc", "severity", "likelihood", "mitigation", "status", "sourceNote"],
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

function fmtIntake(intake) {
  const lines = [
    `Project name: ${intake.name || "(untitled)"}`,
    `Type: ${intake.type || "n/a"}`,
    `Client: ${intake.client || "Internal"}`,
    `Industry / line of business: ${intake.industry || "n/a"}`,
    `Sponsor: ${intake.sponsor || "n/a"}`,
    `Duration: ${intake.duration || "n/a"}`,
    `Total budget: ${intake.budget ? "$" + Number(intake.budget).toLocaleString("en-US") : "n/a"}`,
    `Objective: ${intake.objective || "n/a"}`,
    `Definition of done: ${intake.dod || "n/a"}`,
  ];
  if (intake.teamCapacity) lines.push(`Team capacity / assigned resources: ${intake.teamCapacity}`);
  if (intake.decisionMakers) lines.push(`Decision-makers: ${intake.decisionMakers}`);
  if (intake.influencers) lines.push(`Influencers: ${intake.influencers}`);
  if (intake.blockers) lines.push(`Known blockers: ${intake.blockers}`);
  if (intake.supporters) lines.push(`Supporters: ${intake.supporters}`);
  if (intake.constraints) lines.push(`Constraints / non-negotiables: ${intake.constraints}`);
  if (intake.anythingElse) lines.push(`Anything else worth knowing: ${intake.anythingElse}`);
  return lines.join("\n");
}

function buildResearchPrompt(intake) {
  return [
    fmtIntake(intake),
    "",
    "Before any project artifacts are drafted, research current, real context that should ground them: recent regulatory or compliance guidance relevant to this industry/project type, current market or competitive conditions, and anything relevant about likely vendors or delivery risk for a project like this. Run a few targeted web searches (not more than needed).",
    "",
    "When you have enough to work with, stop searching and write a short plain-text summary (a few bullet points) of what you found and how it should shape the risk register. Do not draft the project plan, risk register, stakeholder map, or budget yet — that happens in the next step.",
  ].join("\n");
}

function buildFinalizePrompt() {
  return "Now generate the complete project artifacts by calling submit_project_artifacts. Ground the risk register in the research above where it applies (use sourceNote to say so); where it doesn't apply to a given risk, leave sourceNote empty. Be specific and grounded in the intake details rather than generic.";
}

async function callAnthropic(apiKey, body) {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((data && data.error && data.error.message) || "Anthropic API error.");
    err.status = res.status;
    err.detail = data;
    throw err;
  }
  return data;
}

function extractText(content) {
  return (content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

function extractSearchQueries(content) {
  return (content || [])
    .filter((b) => b.type === "server_tool_use" && b.name === "web_search")
    .map((b) => b.input && b.input.query)
    .filter(Boolean);
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
  const systemPrompt =
    "You are an EPMO (Enterprise Project Management Office) planning assistant. You research real, current context before drafting project artifacts, and you draft complete, realistic first-version artifacts grounded in that research plus the intake details. You never fabricate specific statistics, named regulations, or named sources — only state something as a research finding if it came from an actual search result.";

  const startedAt = Date.now();
  let researchData;
  let messages = [{ role: "user", content: buildResearchPrompt(intake) }];

  try {
    researchData = await callAnthropic(apiKey, {
      model: chosenModel,
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      tools: [WEB_SEARCH_TOOL],
    });

    // Server-tool loops can pause after many internal search iterations;
    // resend once to let it continue rather than silently truncating.
    if (researchData.stop_reason === "pause_turn") {
      messages = [...messages, { role: "assistant", content: researchData.content }];
      researchData = await callAnthropic(apiKey, {
        model: chosenModel,
        max_tokens: 2048,
        system: systemPrompt,
        messages,
        tools: [WEB_SEARCH_TOOL],
      });
    }
  } catch (err) {
    res.status(err.status || 502).json({ error: "Research step failed.", detail: err.detail || String(err) });
    return;
  }

  if (researchData.stop_reason === "refusal") {
    res.status(200).json({
      error: "The model declined the research step.",
      stopDetails: researchData.stop_details || null,
    });
    return;
  }

  const researchSummary = extractText(researchData.content);
  const searchQueries = extractSearchQueries(researchData.content);

  messages = [
    ...messages,
    { role: "assistant", content: researchData.content },
    { role: "user", content: buildFinalizePrompt() },
  ];

  let finalData;
  try {
    finalData = await callAnthropic(apiKey, {
      model: chosenModel,
      max_tokens: 8000,
      system: systemPrompt,
      messages,
      tools: [ARTIFACT_TOOL],
      tool_choice: { type: "tool", name: "submit_project_artifacts" },
    });
  } catch (err) {
    res.status(err.status || 502).json({ error: "Generation step failed.", detail: err.detail || String(err) });
    return;
  }

  if (finalData.stop_reason === "refusal") {
    res.status(200).json({
      error: "The model declined the generation step.",
      stopDetails: finalData.stop_details || null,
      researchSummary,
      searchQueries,
    });
    return;
  }

  const toolUse = (finalData.content || []).find((b) => b.type === "tool_use");
  if (!toolUse) {
    res.status(502).json({ error: "Model did not return a tool call in the generation step.", detail: finalData, researchSummary });
    return;
  }

  const latencyMs = Date.now() - startedAt;
  const totalUsage = {
    input_tokens: (researchData.usage?.input_tokens || 0) + (finalData.usage?.input_tokens || 0),
    output_tokens: (researchData.usage?.output_tokens || 0) + (finalData.usage?.output_tokens || 0),
  };

  res.status(200).json({
    model: chosenModel,
    latencyMs,
    usage: totalUsage,
    researchSummary,
    searchQueries,
    artifacts: toolUse.input,
  });
};
