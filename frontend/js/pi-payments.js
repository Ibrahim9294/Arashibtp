// =====================================
// Entreprise ARASHI v3.0
// js/pi-payments.js - Intégration Paiements Pi
// =====================================

let currentPiUser = null;

// Authentification via le SDK Pi
export async function loginWithPi() {
    try {
        const auth = await Pi.authenticate(["username", "payments"], onIncompletePaymentFound);
        currentPiUser = auth.user;
        localStorage.setItem("pi_user", JSON.stringify(auth.user));
        
        const userStatusEl = document.getElementById("userStatus");
        if (userStatusEl) {
            userStatusEl.innerText = `@${auth.user.username}`;
        }
        return auth.user;
    } catch (error) {
        console.error("Erreur d'authentification Pi :", error);
        throw error;
    }
}

// Déclenchement de la transaction Pi
export async function createPiPayment(amount, memo, productId) {
    if (!currentPiUser) {
        const saved = localStorage.getItem("pi_user");
        if (saved) {
            try { 
                currentPiUser = JSON.parse(saved); 
            } catch (e) {
                console.error("Erreur de lecture pi_user :", e);
            }
        }
    }

    if (!currentPiUser) {
        try {
            currentPiUser = await loginWithPi();
        } catch (e) {
            alert("Veuillez vous connecter avec Pi d'abord.");
            return;
        }
    }

    const paymentData = {
        amount: Number(amount),
        memo: memo,
        metadata: { 
            productId: productId, 
            uid: currentPiUser.uid || currentPiUser.username 
        }
    };

    const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
            try {
                await fetch("https://entreprise-arashi-backend.onrender.com/api/pi/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, user: currentPiUser })
                });
            } catch (err) {
                console.error("Erreur d'approbation serveur :", err);
            }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
            try {
                await fetch("https://entreprise-arashi-backend.onrender.com/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid, user: currentPiUser })
                });
                alert("🎉 Paiement réussi ! Votre commande a été enregistrée.");
            } catch (err) {
                console.error("Erreur de finalisation serveur :", err);
            }
        },
        onCancel: (paymentId) => {
            console.log("Paiement annulé :", paymentId);
        },
        onError: (error) => {
            console.error("Erreur paiement Pi :", error);
            alert("Erreur lors du paiement : " + (error.message || "Échec de l'opération"));
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Erreur lancement createPayment :", err);
    }
}

// Exposition immédiate dans le contexte global window
window.createPiPayment = createPiPayment;
window.loginWithPi = loginWithPi;

function onIncompletePaymentFound(payment) {
    console.log("Paiement incomplet détecté :", payment);
}
