import { ArashiAuth } from './auth.js';

// Configuration de l'authentification au clic sur le bouton de login
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("piLogin");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginWithPi);
    }
});

// 1. FONCTION DE CONNEXION PI
async function loginWithPi() {
    const Pi = window.Pi; 

    if (!Pi) {
        alert("Ouvrez ARASHI depuis le Pi Browser officiel pour utiliser les transactions Web3.");
        return;
    }

    try {
        Pi.init({ version: "2.0", sandbox: true });

        const scopes = ['username', 'payments'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        ArashiAuth.saveLocalSession(authResult.user);
        await ArashiAuth.syncWithSupabase(authResult.user);

        document.getElementById("userStatus").innerHTML = `🟢 Connecté : <strong>${authResult.user.username}</strong>`;
        document.getElementById("profileName").innerText = authResult.user.username;
        document.getElementById("piLogin").style.display = "none";

    } catch (err) {
        console.error("Échec d'authentification Pi Network :", err);
    }
}

// 2. FONCTION GLOBALE D'ACHAT PI (Exposée à l'objet global 'window')
window.initiatePiPurchase = function(productId, pricePi) {
    // 🚨 ALERTE DE SÉCURITÉ ET DE TEST
    alert(`[ARASHI Sandbox] Lancement de l'achat.\nProduit : ${productId}\nPrix : ${pricePi} Pi`);

    const Pi = window.Pi;

    if (!Pi) {
        alert("Le SDK de Pi Network est introuvable. Assurez-vous d'utiliser l'application Pi Browser officielle.");
        return;
    }

    const paymentData = {
        amount: Number(pricePi),
        memo: `Achat produit #${productId} sur ARASHI Marketplace`,
        metadata: { productId: productId }
    };

    const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
            console.log("Approbation en cours pour le paiement ID :", paymentId);
            await fetch("https://entreprise-arashi.onrender.com/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId })
            });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("Finalisation de la transaction :", txid);
            await fetch("https://entreprise-arashi.onrender.com/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, txid })
            });
            alert("Achat ARASHI confirmé ! Votre commande a été transmise au vendeur.");
            window.location.reload();
        },
        onCancel: (paymentId) => {
            console.log("Paiement annulé par l'utilisateur.", paymentId);
        },
        onError: (error, payment) => {
            console.error("Une erreur est survenue lors du paiement Pi :", error, payment);
            alert("Erreur lors de la transaction Pi Network.");
        }
    };

    try {
        Pi.createPayment(paymentData, callbacks);
    } catch (error) {
        console.error("Erreur d'initialisation du paiement :", error);
    }
};

function onIncompletePaymentFound(payment) {
    console.warn("Un paiement incomplet a été détecté :", payment);
}
