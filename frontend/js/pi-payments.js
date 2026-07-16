import { ArashiAuth } from './auth.js';

const Pi = window.Pi || null;

if (Pi) {
    Pi.init({ version: "2.0", sandbox: true }); // true pour bac à sable développeur, false pour production
}

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("piLogin");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginWithPi);
    }
});

async function loginWithPi() {
    if (!Pi) {
        alert("Ouvrez ARASHI depuis le Pi Browser officiel pour utiliser les transactions Web3.");
        return;
    }

    try {
        const scopes = ['username', 'payments'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        // Sauvegarde de session locale & synchronisation avec Supabase
        ArashiAuth.saveLocalSession(authResult.user);
        await ArashiAuth.syncWithSupabase(authResult.user);

        // Mise à jour de l'UI
        document.getElementById("userStatus").innerHTML = `🟢 Connecté : <strong>${authResult.user.username}</strong>`;
        document.getElementById("profileName").innerText = authResult.user.username;
        document.getElementById("piLogin").style.display = "none";

    } catch (err) {
        console.error("Échec d'authentification Pi Network :", err);
    }
}

// Fonction globale d'achat d'un bien / produit en Pi
window.initiatePiPurchase = function(productId, pricePi) {
    if (!Pi) {
        alert("Veuillez installer et utiliser le Pi Browser pour cette transaction.");
        return;
    }

    const paymentData = {
        amount: pricePi,
        memo: `Achat produit #${productId} sur ARASHI Marketplace`,
        metadata: { productId: productId }
    };

    const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
            // Étape 1 : Appel vers votre backend hébergé sur Render pour approbation sécurisée
            await fetch("https://votre-backend-render.onrender.com/api/pi/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId })
            });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
            // Étape 2 : Validation finale du paiement après transfert blockchain réussi
            await fetch("https://votre-backend-render.onrender.com/api/pi/complete", {
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
            console.error("Une erreur est survenue lors de la transaction Pi :", error, payment);
        }
    };

    Pi.createPayment(paymentData, callbacks);
};

function onIncompletePaymentFound(payment) {
    console.warn("Un paiement incomplet a été détecté :", payment);
    // Demandez à votre backend Render de résoudre ou d'archiver la transaction incomplète
                                      }
