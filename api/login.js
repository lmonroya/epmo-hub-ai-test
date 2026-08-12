// Demo password gate — brief §5.5. Exchanges the shared password for a
// short-lived signed session token. If no TEST_HARNESS_PASSWORD is set on
// the server, the gate is disabled and a token is issued unconditionally
// (matches the brief's "leave unset to disable the gate entirely" note).

const { issueToken } = require("./_lib/session");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const gatePassword = process.env.TEST_HARNESS_PASSWORD;
  if (gatePassword) {
    const provided = req.body && req.body.password;
    if (provided !== gatePassword) {
      // Generic message — no hints, no enumeration.
      res.status(401).json({ error: "Incorrect password." });
      return;
    }
  }

  const { token, expiresAt } = issueToken();
  res.status(200).json({ token, expiresAt });
};
