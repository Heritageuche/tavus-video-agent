// Tiny server: keeps your Tavus API key secret and starts video calls.
// Needs Node.js 18 or newer. No extra installs needed.
const http = require("http");
const fs = require("fs");
const path = require("path");

// --- Load settings from .env ---
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const API_KEY = process.env.TAVUS_API_KEY;
const PERSONA_ID = process.env.TAVUS_PERSONA_ID || "pdced222244b"; // stock persona
const REPLICA_ID = process.env.TAVUS_REPLICA_ID || "rfe12d8b9597"; // stock face (Nathan)
const JOB = process.env.AGENT_JOB || "You are a friendly helper. Keep answers short and clear.";
const GREETING = process.env.AGENT_GREETING || "Hi! How can I help you today?";
const PORT = process.env.PORT || 3000;

if (!API_KEY || API_KEY.includes("your-key")) {
  console.error("\n  Add your Tavus API key to the .env file first.\n");
  process.exit(1);
}

async function startCall() {
  const shared = {
    conversation_name: "Website call",
    conversational_context: JOB,
    custom_greeting: GREETING,
  };
  const send = (body) =>
    fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify(body),
    });

  let res = await send({ ...shared, persona_id: PERSONA_ID, replica_id: REPLICA_ID });
  // Newer Tavus docs also use pal_id / face_id. Try those if the first way is rejected.
  if (res.status === 400 || res.status === 422) {
    const retry = await send({ ...shared, pal_id: PERSONA_ID, face_id: REPLICA_ID });
    if (retry.ok) res = retry;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.conversation_url) {
    throw new Error(data.message || data.error || `Tavus said ${res.status}`);
  }
  return data.conversation_url;
}

http
  .createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/api/start") {
      try {
        const url = await startCall();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ url }));
      } catch (e) {
        console.error("Could not start call:", e.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(path.join(__dirname, "public", "index.html")));
      return;
    }
    res.writeHead(404);
    res.end("Not found");
  })
  .listen(PORT, () => console.log(`\n  Open http://localhost:${PORT} in your browser\n`));
