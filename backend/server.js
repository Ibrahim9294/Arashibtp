import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

const PI_API = "https://api.minepi.com/v2/payments";

const PI_API_KEY = process.env.PI_API_KEY;

// =====================================
// Test serveur
// =====================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        app: "ARASHI v3.0 Backend",
        status: "Running"
    });
});

// =====================================
// APPROVE PAYMENT
// =====================================

app.post("/approve", async (req, res) => {

    try {

        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "paymentId manquant"
            });
        }

        const response = await axios.post(

            `${PI_API}/${paymentId}/approve`,

            {},

            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`
                }
            }

        );

        res.json(response.data);

    } catch (err) {

        console.error(err.response?.data || err.message);

        res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });

    }

});

// =====================================
// COMPLETE PAYMENT
// =====================================

app.post("/complete", async (req, res) => {

    try {

        const { paymentId, txid } = req.body;

        if (!paymentId || !txid) {

            return res.status(400).json({

                success: false,

                message: "paymentId ou txid manquant"

            });

        }

        const response = await axios.post(

            `${PI_API}/${paymentId}/complete`,

            {
                txid
            },

            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`
                }
            }

        );

        res.json(response.data);

    }

    catch (err) {

        console.error(err.response?.data || err.message);

        res.status(500).json({

            success: false,

            error: err.response?.data || err.message

        });

    }

});

// =====================================
// VERIFY PAYMENT
// =====================================

app.post("/verify", async (req, res) => {

    try {

        const { paymentId } = req.body;

        const response = await axios.get(

            `${PI_API}/${paymentId}`,

            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`
                }
            }

        );

        res.json(response.data);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            error: err.response?.data || err.message

        });

    }

});

// =====================================
// CANCEL PAYMENT
// =====================================

app.post("/cancel", async (req, res) => {

    res.json({

        success: true,

        message: "Paiement annulé"

    });

});

// =====================================
// WEBHOOK
// =====================================

app.post("/webhook", async (req, res) => {

    console.log("Webhook Pi :", req.body);

    res.sendStatus(200);

});

// =====================================

app.listen(PORT, () => {

    console.log(`✅ Serveur ARASHI démarré sur le port ${PORT}`);

});