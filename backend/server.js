// =====================================
// ARASHI v3.0 - Backend
// server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PI_API_KEY = process.env.PI_API_KEY;

app.get("/", (req, res) => {
  res.json({ status: "ARASHI Backend v3.0 Online" });
});

// APPROVE PAYMENT
app.post("/approve", async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) return res.status(400).json({ error: "paymentId manquant" });

  try {
    // Appel à l'API Pi officielle
    if (PI_API_KEY) {
      await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: { Authorization: `Key ${PI_API_KEY}` }
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur approbation" });
  }
});

// COMPLETE PAYMENT
app.post("/complete", (req, res) => {
  const { paymentId, txid } = req.body;

  if (!paymentId) return res.status(400).json({ error: "paymentId manquant" });

  console.log(`Paiement complété : ${paymentId} | TXID: ${txid}`);
  res.json({ success: true });
});

// VERIFY PAYMENT
app.post("/verify", (req, res) => {
  const { paymentId } = req.body;
  res.json({ paymentId, status: "verified" });
});

// Webhook Pi
app.post("/webhook", (req, res) => {
  console.log("Webhook reçu :", req.body);
  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ARASHI Backend v3.0 lancé sur port ${PORT}`);
});
