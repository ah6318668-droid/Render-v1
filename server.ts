import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { 
  VITE_PAYPAL_CLIENT_ID = "ASGBi0TBZWnQe03aiB-IQ9vrqulSlJcdq-kkpG8RUwE17FNF8nHjOC21zzes0vqEapDCgXjHa_xdvgjo", 
  PAYPAL_SECRET_KEY = "EN0huyvcstYE67CZG_Ai_MWLxl1LZBwuSh2r3zACkq62zQT543B4Opd8S9VIBWMraiAbTdSEtdS-PAAF", 
  PAYPAL_ENV = "sandbox" 
} = process.env;

const PAYPAL_API = (PAYPAL_ENV === "live") 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  // Try to get credentials from various possible environment variable names
  const envClientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
  const envSecretKey = process.env.PAYPAL_SECRET_KEY || process.env.VITE_PAYPAL_SECRET_KEY || process.env.PAYPAL_SECRET;
  
  // Use hardcoded defaults if environment variables are missing or empty
  let clientId = (envClientId && envClientId.trim().length > 0) 
    ? envClientId.trim() 
    : "ASGBi0TBZWnQe03aiB-IQ9vrqulSlJcdq-kkpG8RUwE17FNF8nHjOC21zzes0vqEapDCgXjHa_xdvgjo";
  
  let secretKey = (envSecretKey && envSecretKey.trim().length > 0) 
    ? envSecretKey.trim() 
    : "EN0huyvcstYE67CZG_Ai_MWLxl1LZBwuSh2r3zACkq62zQT543B4Opd8S9VIBWMraiAbTdSEtdS-PAAF";

  if (!clientId || !secretKey) {
    throw new Error("PayPal Credentials (Client ID or Secret) are missing");
  }

  const auth = Buffer.from(`${clientId}:${secretKey}`).toString("base64");
  
  console.log(`[PayPal Auth] Attempting token request to: ${PAYPAL_API}/v1/oauth2/token`);
  console.log(`[PayPal Auth] Using Client ID: ${clientId.substring(0, 8)}...`);

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "Accept-Language": "en_US"
    },
    body: "grant_type=client_credentials",
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[PayPal Auth Error] Status: ${response.status}`, errorBody);
    throw new Error(`PayPal Auth Failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

const app = express();
const PORT = 3000;

async function setupServer() {
  // Add JSON parsing middleware
  app.use(express.json());

  // Statistics storage (Simple file-based for demo purposes)
  const statsPath = path.join(process.cwd(), "stats.json");
  const getStats = () => {
    try {
      if (fs.existsSync(statsPath)) {
        return JSON.parse(fs.readFileSync(statsPath, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading stats", e);
    }
    return { downloadCount: 1240 }; // Starting with a base number for "credibility"
  };

  app.get("/api/stats", (req, res) => {
    res.json(getStats());
  });

  app.post("/api/stats/increment", (req, res) => {
    const stats = getStats();
    stats.downloadCount += 1;
    try {
      // Check if we are on Vercel or similar read-only systems
      if (!process.env.VERCEL) {
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
      }
    } catch (e) {
      console.error("Error writing stats", e);
    }
    res.json(stats);
  });

  // API Route for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // PayPal: Create Order
  app.post("/api/paypal/create-order", async (req, res) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: "9.99",
              },
              description: "Architectural Render PDF Guide",
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("PayPal Create Order Error:", errorData);
        return res.status(response.status).json({ error: "Failed to create order", details: errorData });
      }

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Internal Server Error during order creation:", err);
      res.status(500).json({ error: "Internal Server Error", message: err instanceof Error ? err.message : String(err) });
    }
  });

  // PayPal: Capture Order
  app.post("/api/paypal/capture-order", async (req, res) => {
    const { orderID } = req.body;
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("PayPal Capture Order Error:", errorData);
        return res.status(response.status).json({ error: "Failed to capture order", details: errorData });
      }

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Internal Server Error during order capture:", err);
      res.status(500).json({ error: "Internal Server Error", message: err instanceof Error ? err.message : String(err) });
    }
  });

  // API Route to handle PDF download (can be restricted later)
  app.get("/api/download", (req, res) => {
    // On production/Vercel, assets are often directly in the root or in public
    const pdfPath = path.join(process.cwd(), "public", "book.pdf");
    // Check if file exists in public first, or just serve a dummy if missing
    res.download(pdfPath, "Render_Arch_100_Prompts.pdf", (err) => {
      if (err) {
        // If file not found, we could send a 404
        res.status(404).send("File not found. Please ensure book.pdf exists in public/ directory.");
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Initial setup
setupServer();

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
