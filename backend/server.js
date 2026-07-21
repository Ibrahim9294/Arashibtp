// =====================================
// ARASHI v3.0
// server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

app.get("/", (req, res) => {
    res.json({
        status: "ARASHI Backend Online"
    });
});

// ============================
// APPROVE PAYMENT
// ============================

app.post("/approve", async (req, res) => {

    try {

        const { paymentId } = req.body;

        if (!paymentId) {

            return res.status(400).json({
                error: "paymentId manquant"
            });

        }

        await supabase
            .from("payments")
            .update({
                status: "approved"
            })
            .eq("pi_payment_id", paymentId);

        return res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});

// ============================
// COMPLETE PAYMENT
// ============================

app.post("/complete", async (req, res) => {

    try {

        const {

            paymentId,

            txid

        } = req.body;

        if (!paymentId) {

            return res.status(400).json({
                error: "paymentId manquant"
            });

        }

        await supabase
            .from("payments")
            .update({

                blockchain_txid: txid,

                status: "completed",

                updated_at: new Date()

            })
            .eq("pi_payment_id", paymentId);

        return res.json({

            success: true

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

});

// ============================
// VERIFY PAYMENT
// ============================

app.post("/verify", async (req, res) => {

    try {

        const { paymentId } = req.body;

        const { data } = await supabase

            .from("payments")

            .select("*")

            .eq("pi_payment_id", paymentId)

            .single();

        return res.json(data);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// ============================
// PI WEBHOOK
// ============================

app.post("/webhook", async (req, res) => {

    console.log("Webhook reçu :", req.body);

    res.json({

        received: true

    });

});

// ============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("Serveur lancé sur le port", PORT);

});