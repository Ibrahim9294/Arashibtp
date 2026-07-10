// ==========================================
// ENTREPRISE ARASHI - BACKEND
// ==========================================

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// TEST SERVEUR
// ==========================================

app.get("/", (req, res) => {
    res.send("✅ Backend ARASHI fonctionne.");
});

// ==========================================
// APPROBATION DU PAIEMENT
// ==========================================

app.post("/approve", (req, res) => {

    const { paymentId, product, amount } = req.body;

    console.log("Paiement à approuver :", paymentId);
    console.log("Produit :", product);
    console.log("Montant :", amount);

    // TODO :
    // Ici sera ajouté le code officiel Pi Platform API.

    res.json({
        success: true,
        paymentId
    });

});

// ==========================================
// FINALISATION DU PAIEMENT
// ==========================================

app.post("/complete", (req, res) => {

    const { paymentId, txid } = req.body;

    console.log("Paiement terminé :", paymentId);
    console.log("Transaction :", txid);

    // TODO :
    // Ici sera ajouté le code officiel Pi Platform API.

    res.json({
        success: true,
        txid
    });

});

// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Serveur ARASHI lancé sur le port " + PORT);
});