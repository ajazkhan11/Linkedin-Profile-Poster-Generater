import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("usage.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT UNIQUE,
    count INTEGER DEFAULT 0
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const getClientIp = (req: express.Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    }
    return req.socket.remoteAddress || "unknown";
  };

  // API Routes
  app.get("/api/usage", (req, res) => {
    const ip = getClientIp(req);
    const row = db.prepare("SELECT count FROM usage WHERE ip = ?").get(ip) as { count: number } | undefined;
    res.json({ count: row ? row.count : 0 });
  });

  app.post("/api/usage/increment", (req, res) => {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
