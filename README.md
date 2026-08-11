# EPMO Hub — AI Generation Test Harness

A small, standalone prototype for testing what **real** Claude-generated project
artifacts (Project Plan, Risk Register, Stakeholder Map, Budget) look like,
compared side-by-side against the EPMO Hub mockup's existing templated output
for the same sample projects.

This is **not** part of the EPMO Hub mockup and does not modify it. It exists
purely to de-risk the AI-generation piece of the real build before committing
to it in a PRD.

## How it works

- `public/` — a plain static frontend (no build step, no framework).
- `api/generate.js` — a single Vercel serverless function that holds the
  Anthropic API key server-side and proxies a structured "generate project
  artifacts" request using tool-calling, so the model returns clean JSON
  matching the mockup's own data shapes.
- Two real sample projects (Core Banking Platform Migration, APAC Market
  Entry) are hardcoded in `public/app.js`, copied verbatim from the mockup —
  both their intake fields and the mockup's existing hand-written output, so
  the comparison is apples-to-apples.

**Scope note:** this only wires up the "Generate Draft" artifact-generation
flow (Plan/Risk/Stakeholders/Budget). It does not wire up the chat assistant,
AI Review, Meeting summarization, or the "Research" step — those were out of
scope for this pass.

## One-time setup

### 1. Push this to GitHub

```bash
cd ~/Documents/epmo-hub-ai-test
git init
git add .
git commit -m "Initial EPMO Hub AI generation test harness"
```

Then create a **new, empty** repository on GitHub (no README/gitignore —
this folder already has them), and push:

```bash
git remote add origin https://github.com/<your-username>/epmo-hub-ai-test.git
git branch -M main
git push -u origin main
```

### 2. Connect it to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Import the `epmo-hub-ai-test` GitHub repo you just pushed.
3. Framework preset: leave as **Other** (there's no framework here — Vercel
   will auto-detect `public/` as static output and `api/` as serverless
   functions).
4. Before clicking Deploy, expand **Environment Variables** and add:
   - `ANTHROPIC_API_KEY` — your real Anthropic API key.
   - `TEST_HARNESS_PASSWORD` — any password you choose. This is a simple
     shared-secret gate so a stray/shared URL can't rack up API costs on your
     key. Leave it unset if you don't want a password gate at all.
5. Click **Deploy**. You'll get a URL like `epmo-hub-ai-test.vercel.app`.

That's it — every future `git push` to `main` will auto-redeploy.

## Using it

1. Open the deployed URL.
2. Pick a sample project (or choose "Custom" and type your own intake
   fields).
3. Pick a model — Opus 5, Sonnet 5, or Haiku 4.5 — to compare quality/speed
   across tiers.
4. Enter the password if you set `TEST_HARNESS_PASSWORD`.
5. Click **Generate with Claude**. Once it returns, use the toggle at the top
   of the Results card to view Claude's output alone, the mockup's existing
   output alone, or both side-by-side.

## Cost note

Each generation is one real API call with a fairly large structured-output
schema — expect a few thousand tokens in, a couple thousand out, per run.
Check current Anthropic pricing for the models above if you want to estimate
cost for a testing session.
