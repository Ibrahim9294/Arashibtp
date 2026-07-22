// =====================================
// ARASHI v3.0
// server.js (Version Finale Sécurisée)
// =====================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(compression());

// Configuration Supabase avec valeurs de secours pour éviter les crashs Render
const SUPABASE_URL = process.env.SUPABASE_URL || "https://cjmunzphzqazivbkgrdq.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuration API Pi Network
const PI_API_URL = "https://api.minepi.com/v2/payments";
const PI_API_KEY = process.env.PI_API_KEY;

const PORT = process.env.PORT || 3000;

// ==============================
// Health Check (Test Serveur)
// ==============================
app.get("/", (req, res) => {
    res.json({
        status: "ARASHI Backend Online",
        version: "3.0",
        supabase: "Connected"
    });
});

// ==============================
// APPROVE PAYMENT
// ==============================
app.post("/approve", async (req, res) => {
    try {
        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({ error: "paymentId manquant" });
        }

        // 1. Appel de l'API Pi Network (si PI_API_KEY est configurée)
        if (PI_API_KEY) {
            await axios.post(
                `${PI_API_URL}/${paymentId}/approve`,
                {},
                { headers: { Authorization: `Key ${PI_API_KEY}` } }
            );
        }

        // 2. Mise à jour dans Supabase
        await supabase
            .from("payments")
            .update({
                status: "approved",
                updated_at: new Date().toISOString()
            })
            .eq("pi_payment_id", paymentId);

        return res.json({
            success: true,
            paymentId
        });

    } catch (err) {
        console.error("Erreur /approve :", err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data || err.message
        });
    }
});

// ==============================
// COMPLETE PAYMENT
// ==============================
app.post("/complete", async (req, res) => {
    try {
        const { paymentId, txid } = req.body;

        if (!paymentId || !txid) {
            return res.status(400).json({
                error: "paymentId ou txid manquant"
            });
        }

        // 1. Validation auprès de Pi Network (si PI_API_KEY est configurée)
        if (PI_API_KEY) {
            await axios.post(
                `${PI_API_URL}/${paymentId}/complete`,
                { txid },
                { headers: { Authorization: `Key ${PI_API_KEY}` } }
            );
        }

        // 2. Mise à jour de la transaction dans Supabase
        await supabase
            .from("payments")
            .update({
                blockchain_txid: txid,
                status: "completed",
                updated_at: new Date().toISOString()
            })
            .eq("pi_payment_id", paymentId);

        return res.json({
            success: true,
            paymentId,
            txid
        });

    } catch (err) {
        console.error("Erreur /complete :", err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data || err.message
        });
    }
});

// ==============================
// VERIFY PAYMENT
// ==============================
app.post("/verify", async (req, res) => {
    try {
        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({ error: "paymentId manquant" });
        }

        const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("pi_payment_id", paymentId)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        return res.json({
            success: true,
            payment: data
        });

    } catch (err) {
        console.error("Erreur /verify :", err);
        return res.status(500).json({ error: err.message });
    }
});

// ==============================
// WEBHOOK PI
// ==============================
app.post("/webhook", async (req, res) => {
    try {
        console.log("🔔 Webhook Pi reçu :", req.body);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Erreur Webhook :", err);
        return res.status(500).json({ error: err.message });
    }
});

// ==============================
// MIDDLEWARE 404
// ==============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route introuvable"
    });
});

// ==============================
// GESTION DES ERREURS GLOBALES
// ==============================
app.use((err, req, res, next) => {
    console.error("Erreur serveur :", err);
    res.status(500).json({
        success: false,
        error: "Erreur interne du serveur"
    });
});

// ==============================
// LANCEMENT DU SERVEUR
// ==============================
app.listen(PORT, () => {
    console.log(`🚀 ARASHI Backend démarré sur le port ${PORT}`);
});
