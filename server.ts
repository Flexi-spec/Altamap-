import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Stripe from "stripe";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Stripe (lazy load or check for key)
  const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      // In development/demo, we might not have the key yet
      console.warn("STRIPE_SECRET_KEY is missing. Stripe features will fail.");
      return null;
    }
    return new Stripe(key);
  };

  app.use(cors());
  app.use(express.json());

  // API Route for Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { amount, creatorId, creatorName, senderId } = req.body;
      const stripe = getStripe();
      
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured in this environment." });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Donation to ${creatorName}`,
                description: "Spirit-filled support for Christian creators on Altamap.",
              },
              unit_amount: amount * 100, // amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/music`,
        metadata: {
          creatorId,
          senderId,
          type: "donation"
        }
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Session Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
