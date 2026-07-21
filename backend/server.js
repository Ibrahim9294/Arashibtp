// =====================================
// server.js
// Partie 1
// =====================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(helmet());

app.use(compression());

const supabase = createClient(

process.env.SUPABASE_URL,

process.env.SUPABASE_SECRET_KEY

);

const PORT = process.env.PORT || 3000;

// ==============================
// Health Check
// ==============================

app.get("/", (req,res)=>{

res.json({

status:"ARASHI Backend Online",

version:"3.0"

});

});

// ==============================
// APPROVE PAYMENT
// ==============================

app.post("/approve", async(req,res)=>{

try{

const {

paymentId

}=req.body;

if(!paymentId){

return res.status(400).json({

error:"paymentId manquant"

});

}

await supabase

.from("payments")

.update({

status:"approved",

updated_at:new Date().toISOString()

})

.eq("pi_payment_id",paymentId);

return res.json({

success:true,

paymentId

});

}

catch(err){

console.error(err);

return res.status(500).json({

error:err.message

});

}

});
// ==============================
// COMPLETE PAYMENT
// ==============================

app.post("/complete", async (req, res) => {

    try {

        const {
            paymentId,
            txid
        } = req.body;

        if (!paymentId || !txid) {

            return res.status(400).json({
                error: "paymentId ou txid manquant"
            });

        }

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

        console.error(err);

        return res.status(500).json({
            error: err.message
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

            return res.status(400).json({
                error: "paymentId manquant"
            });

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

        console.error(err);

        return res.status(500).json({
            error: err.message
        });

    }

});
// ==============================
// WEBHOOK PI
// ==============================

app.post("/webhook", async (req, res) => {

    try {

        console.log("Webhook reçu :", req.body);

        return res.status(200).json({
            success: true
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: err.message
        });

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
// GESTION DES ERREURS
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
