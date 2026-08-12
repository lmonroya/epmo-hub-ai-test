# EPMO Hub — AI Generation POC

A working demo, per `CLAUDE-CODE-POC-BRIEF.md`: intake form → live two-step Claude
generation (real web research, then a forced tool call) → a full first-draft
artifact set rendered with visible provenance on every element — phases,
risks (inherent → residual), assumptions, milestones, stakeholders, budget,
and tasks.

This is a **POC**, not the production build. It's a standalone harness (its
own `public/` frontend, not the EPMO Hub mockup), built to visually rhyme
with that mockup's design system and field-shape conventions
(`risks[].source`/`sourceLabel`, `phases[].window`, `tasks[].key`/`owner`, a
provenance object on every element) so it drops in cleanly later.

## How it works

- `public/` — static frontend, no build step, no framework.
- `api/generate.js` — the Vercel serverless function that holds the
  Anthropic API key server-side and runs the two-step generation flow:
  1. **Research** — the model gets the real `web_search` tool and only
     generalized attributes (type, industry, jurisdictions, dates, budget
     band, vendor status, compliance flags — never client, project, sponsor,
     or description text). Every `web_search_tool_result` is walked into a
     structured, cited `researchFindings[]` array (id/title/url/date) —
     that's what makes provenance badges resolve to a real URL.
  2. **Generate** — a follow-up turn, research + findings still in context,
     `tool_choice` forced onto `submit_project_artifacts`. Every element in
     the response carries a `provenance` object (basis/detail/confidence).
- `api/login.js` + `api/_lib/session.js` — the demo password gate (PRD-01
  §3.8 shared-password mode). Not authentication: a stateless, HMAC-signed
  session token, no DB, no user accounts. `/api/generate` rejects requests
  without a valid token whenever `TEST_HARNESS_PASSWORD` is set.
- Three validation checks run after the tool call (referential integrity,
  finding-ID citations, stray invented names) and come back as
  `validationWarnings[]` — they never block or silently auto-correct, except
  stripping any invented `ownerName`/`keyContacts[].name`.

## One-time setup

### 1. Push this to GitHub (if not already)

```bash
cd ~/Documents/epmo-hub-ai-test
git add -A
git commit -m "POC: research-grounded generation with provenance"
git push
```

### 2. Connect it to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this repo.
2. Framework preset: **Other** (static `public/` + serverless `api/`).
3. Before deploying, add Environment Variables — see `.env.example`:
   - `ANTHROPIC_API_KEY` — required.
   - `TEST_HARNESS_PASSWORD` — recommended; enables the gate screen.
   - `SESSION_SECRET` — optional, falls back to the password above.
   - `GENERATION_SPEND_CAP_USD` — optional, defaults to 40.
4. Deploy.

### 3. Test locally instead (no deploy)

```bash
npm i -g vercel   # if you don't already have it
cd ~/Documents/epmo-hub-ai-test
vercel dev
```

`vercel dev` serves `public/` and runs `api/*.js` as real serverless
functions locally, reading `.env` (copy `.env.example` → `.env` first). This
is the only way to exercise the full flow, including the live Anthropic
call — a plain static file server won't run the `api/` functions.

## Using it

1. Open the app. If a password is set, enter it — this exchanges the
   password for a short-lived signed session token (`sessionStorage`, 8h).
2. Pick a sample project or fill in your own intake — project basics,
   schedule + jurisdiction (date pickers, required jurisdictions, currency,
   vendor status), objective/constraints, and compliance flags.
3. Pick a model (Opus 5 / Sonnet 5 / Haiku 4.5) and click **Generate Draft**.
4. The staged status line shows research → drafting → consistency-checking
   while the two model calls run (typically 15–40s).
5. Results render as tabs: Overview, Project Plan, Risk Register,
   Assumptions, Milestones, Stakeholders, Dependencies, Budget, Research.
   - **Provenance badges** (colored by confidence) sit on every element —
     click one to see its basis and, where it cites a research finding,
     a link straight to the real source URL.
   - **Feasibility flags** and a **low-confidence review queue** appear above
     the tabs when applicable; queue items jump straight to the element.
   - Every date has a dotted underline — "AI-suggested, confirm before use."
   - The **Research** tab shows every search query executed and every
     finding cited, so it's visible that nothing confidential left the
     perimeter.

## Cost note

Each generation is two real API calls — a research call (up to 10 web
searches) and a generation call against a large structured-output schema.
`api/generate.js` pre-flights a worst-case cost estimate against
`GENERATION_SPEND_CAP_USD` (default $40) before starting the generation
step, and halts with a clear message rather than truncating if it would
exceed the cap. The estimated cost is also returned per-generation.

## Known scope cuts (POC, not production)

Per the brief: no RBAC/roles, no admin panel, no persistence (draft held in
memory by the browser tab only), no brain/knowledge-corpus retrieval, no
revision prompt, no reports/audit trail. See `CLAUDE-CODE-POC-BRIEF.md` §1
for the full do/do-not-build list, and PRD-01 / PRD-10 for what those look
like in the real build.
