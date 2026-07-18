const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration Supabase avec tes variables de Render
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PI_API_KEY = process.env.PI_API_KEY;

// Route d'approbation corrigée avec logs détaillés
app.post("/approve", async (req, res) => {
    try {
        const { paymentId } = req.body;
        console.log(`✉️ Requête d'approbation reçue pour le paiement : ${paymentId}`);

        if (!paymentId) {
            return res.status(400).json({ error: "paymentId requis" });
        }

        const response = await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            {},
            {
                headers: {
                    "Authorization": `Key ${PI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Paiement approuvé sur les serveurs Pi !");
        res.json(response.data);
    } catch (error) {
        console.error("❌ Erreur /approve backend:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur ARASHI V3 actif sur le port ${PORT}`));
