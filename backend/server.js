// =====================================
// ARASHI v4.0
// server.js (Version Corrigée Pi Network)
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

// Configuration Supabase
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
        version: "4.0",
        supabase: "Connected"
    });
});

// ==============================
// APPROVE PAYMENT (/api/pi/approve)
// ==============================
app.post("/api/pi/approve", async (req, res) => {
    try {
        const { paymentId, user } = req.body;

        if (!paymentId) {
            return res.status(400).json({ error: "paymentId manquant" });
        }

        console.log(`[APPROVE] Traitement du paiement: ${paymentId}`);

        // 1. Validation obligatoire auprès de l'API Pi Network
        if (PI_API_KEY) {
            await axios.post(
                `${PI_API_URL}/${paymentId}/approve`,
                {},
                { headers: { Authorization: `Key ${PI_API_KEY}` } }
            );
            console.log(`[APPROVE] Paiement ${paymentId} approuvé sur l'API Pi.`);
        } else {
            console.warn("⚠️ PI_API_KEY non configurée dans les variables d'environnement.");
        }

        // 2. Sauvegarde ou mise à jour dans Supabase (upsert)
        await supabase
            .from("payments")
            .upsert({
                pi_payment_id: paymentId,
                username: user?.username || "Anonyme",
                status: "approved",
                updated_at: new Date().toISOString()
            }, { onConflict: "pi_payment_id" });

        return res.json({
            success: true,
            paymentId
        });

    } catch (err) {
        console.error("Erreur /api/pi/approve :", err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data || err.message
        });
    }
});

// ==============================
// COMPLETE PAYMENT (/api/pi/complete)
// ==============================
app.post("/api/pi/complete", async (req, res) => {
    try {
        const { paymentId, txid } = req.body;

        if (!paymentId || !txid) {
            return res.status(400).json({
                error: "paymentId ou txid manquant"
            });
        }

        console.log(`[COMPLETE] Finalisation transaction ${paymentId} avec TXID: ${txid}`);

        // 1. Finalisation auprès de l'API Pi Network
        if (PI_API_KEY) {
            await axios.post(
                `${PI_API_URL}/${paymentId}/complete`,
                { txid },
                { headers: { Authorization: `Key ${PI_API_KEY}` } }
            );
            console.log(`[COMPLETE] Paiement ${paymentId} finalisé sur l'API Pi.`);
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
        console.error("Erreur /api/pi/complete :", err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data || err.message
        });
    }
});

// ==============================
// VERIFY PAYMENT (/api/pi/verify)
// ==============================
app.post("/api/pi/verify", async (req, res) => {
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
        console.error("Erreur /api/pi/verify :", err);
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