// Shared helper for the demo password gate (brief §5.5 / PRD-01 FR-ACC-23).
// Not authentication — a stateless, signed speed-bump so the demo URL isn't
// fully open. No user accounts, no DB: the "session" is a self-verifying
// HMAC token the client holds in sessionStorage and echoes back.

const crypto = require("crypto");

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h, matches PRD-01 FR-ACC-24 default

function getSecret() {
  // A dedicated SESSION_SECRET is preferred (so a leaked token can't be used
  // to reverse-engineer the login password), but falls back to the gate
  // password itself so the gate works with zero extra config.
  return process.env.SESSION_SECRET || process.env.TEST_HARNESS_PASSWORD || "epmo-hub-poc-insecure-default";
}

function signToken(expiresAt) {
  const mac = crypto.createHmac("sha256", getSecret()).update(String(expiresAt)).digest("hex");
  return `${expiresAt}.${mac}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expiresAtStr = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = crypto.createHmac("sha256", getSecret()).update(String(expiresAt)).digest("hex");
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function issueToken() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return { token: signToken(expiresAt), expiresAt };
}

function bearerFromReq(req) {
  const header = req.headers && (req.headers.authorization || req.headers.Authorization);
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header);
  return m ? m[1] : null;
}

module.exports = { SESSION_TTL_MS, issueToken, verifyToken, bearerFromReq };
