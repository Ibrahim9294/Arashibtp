// ======================================================
// ENTREPRISE ARASHI
// Backend Pi Network
// Node.js + Express
// ======================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PI_API_KEY = process.env.PI_API_KEY;
const PI_API_URL = "https://api.minepi.com/v2";

// ======================================================
// PAGE D'ACCUEIL
// ======================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "✅ ARASHI Backend Pi OK"
    });
});

// ======================================================
// APPROVE PAYMENT
// ======================================================

app.post("/approve", async (req, res) => {

    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({
            success: false,
            message: "paymentId manquant"
        });
    }

    try {

        const response = await axios.post(
            `${PI_API_URL}/payments/${paymentId}/approve`,
            {},
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`
                }
            }
        );

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: "Erreur approve",
            error: error.response?.data || error.message
        });

    }

});

// ======================================================
// COMPLETE PAYMENT
// ======================================================

app.post("/complete", async (req, res) => {

    const { paymentId, txid } = req.body;

    if (!paymentId || !txid) {

        return res.status(400).json({
            success: false,
            message: "paymentId ou txid manquant"
        });

    }

    try {

        const response = await axios.post(
            `${PI_API_URL}/payments/${paymentId}/complete`,
            {
                txid
            },
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`
                }
            }
        );

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: "Erreur complete",
            error: error.response?.data || error.message
        });

    }

});

// ======================================================
// PAIEMENT INCOMPLET
// ======================================================

app.get("/incomplete", async (req, res) => {

    try {

        const response = await axios.get(
            `${PI_API_URL}/payments/incomplete_server_payments`,
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });

    }

});

// ======================================================
// STATUS
// ======================================================

app.get("/status", (req, res) => {

    res.json({
        backend: "ARASHI",
        status: "ONLINE",
        version: "2.0",
        piApi: PI_API_KEY ? "Configurée" : "Non configurée"
    });

});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("🚀 ENTREPRISE ARASHI");
    console.log("Backend Pi démarré");
    console.log("Port :", PORT);
    console.log("=================================");

});