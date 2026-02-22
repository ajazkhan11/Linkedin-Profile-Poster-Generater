import express, { Router } from "express";
import serverless from "serverless-http";
import Database from "better-sqlite3";
import path from "path";

const app = express();
const router = Router();

// NOTE: SQLite on Netlify Functions is NOT persistent. 
// It will reset frequently. For production, use Supabase or MongoDB.
const db = new Database("/tmp/usage.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT UNIQUE,
    count INTEGER DEFAULT 0
  )
`);

const getClientIp = (req: any) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
  }
  return req.socket.remoteAddress || "unknown";
};

router.get("/usage", (req, res) => {
  const ip = getClientIp(req);
  const row = db.prepare("SELECT count FROM usage WHERE ip = ?").get(ip) as { count: number } | undefined;
  res.json({ count: row ? row.count : 0 });
});

router.post("/usage/increment", (req, res) => {
  const ip = getClientIp(req);
  const row = db.prepare("SELECT count FROM usage WHERE ip = ?").get(ip) as { count: number } | undefined;
  
  if (row && row.count >= 3) {
    return res.status(403).json({ error: "Limit reached" });
  }

  if (row) {
    db.prepare("UPDATE usage SET count = count + 1 WHERE ip = ?").run(ip);
  } else {
    db.prepare("INSERT INTO usage (ip, count) VALUES (?, 1)").run(ip);
  }

  const updatedRow = db.prepare("SELECT count FROM usage WHERE ip = ?").get(ip) as { count: number };
  res.json({ count: updatedRow.count });
});

app.use(express.json());
app.use("/.netlify/functions/api", router);

export const handler = serverless(app);
