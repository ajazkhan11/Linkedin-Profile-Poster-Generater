import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

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

  let stripeInstance: Stripe | null = null;
  const getStripe = () => {
    if (!stripeInstance) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing");
      }
      stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeInstance;
  };

  // API Routes
  app.post("/api/create-checkout-session", async (req, res) => {
    const { plan } = req.body;
    
    let priceId = '';
    if (plan === 'daily') priceId = process.env.STRIPE_DAILY_PRICE_ID!;
    if (plan === 'monthly') priceId = process.env.STRIPE_MONTHLY_PRICE_ID!;
    if (plan === 'yearly') priceId = process.env.STRIPE_YEARLY_PRICE_ID!;

    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan or missing Price ID" });
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: plan === 'daily' ? 'payment' : 'subscription',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

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
