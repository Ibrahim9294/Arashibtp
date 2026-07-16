import { ArashiAuth } from './auth.js';

// On enlève le "const Pi = window.Pi || null" global pour éviter les erreurs de chargement

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("piLogin");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginWithPi);
    }
});

async function loginWithPi() {
    // On récupère window.Pi au moment du clic
    const Pi = window.Pi; 

    if (!Pi) {
        alert("Ouvrez ARASHI depuis le Pi Browser officiel pour utiliser les transactions Web3.");
        return;
    }

    // Initialisation ici pour être sûr
    Pi.init({ version: "2.0", sandbox: true });

    try {
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

window.initiatePiPurchase = function(productId, pricePi) {
    // On récupère window.Pi au moment de l'achat
    const Pi = window.Pi;

    if (!Pi) {
        alert("Pi SDK non détecté. Assurez-vous d'être dans le Pi Browser.");
        return;
    }

    const paymentData = {
        amount: pricePi,
        memo: `Achat produit #${productId} sur ARASHI Marketplace`,
        metadata: { productId: productId }
    };

    const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
            await fetch("https://entreprise-arashi.onrender.com/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId })
            });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
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
            console.error("Erreur Pi :", error, payment);
        }
    };

    Pi.createPayment(paymentData, callbacks);
};

function onIncompletePaymentFound(payment) {
    console.warn("Un paiement incomplet a été détecté :", payment);
}
