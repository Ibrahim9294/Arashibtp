// =====================================
// Entreprise ARASHI v3.0
// js/pi-payments.js - Intégration Paiements Pi
// =====================================

let currentPiUser = null;

// Authentification Pi Network
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

// Fonction de création de paiement Pi
export async function createPiPayment(amount, memo, productId) {
    // 1. Récupération de l'utilisateur depuis la mémoire ou le localStorage
    if (!currentPiUser) {
        const saved = localStorage.getItem("pi_user");
        if (saved) {
            try { 
                currentPiUser = JSON.parse(saved); 
            } catch (e) {
                console.error("Erreur de lecture pi_user:", e);
            }
        }
    }

    // 2. Si l'utilisateur n'est toujours pas identifié, on relance la connexion
    if (!currentPiUser) {
        try {
            currentPiUser = await loginWithPi();
        } catch (e) {
            alert("Veuillez vous connecter avec Pi d'abord.");
            return;
        }
    }

    // 3. Préparation des données de paiement
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
            console.log("Approbation serveur pour paymentId :", paymentId);
            try {
                await fetch("https://entreprise-arashi-backend.onrender.com/api/pi/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, user: currentPiUser })
                });
            } catch (err) {
                console.error("Erreur lors de l'approbation backend:", err);
            }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("Validation finale txid :", txid);
            try {
                await fetch("https://entreprise-arashi-backend.onrender.com/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid, user: currentPiUser })
                });
                alert("🎉 Paiement réussi ! Merci pour votre achat.");
            } catch (err) {
                console.error("Erreur lors de la finalisation backend:", err);
            }
        },
        onCancel: (paymentId) => {
            console.log("Paiement annulé :", paymentId);
        },
        onError: (error, payment) => {
            console.error("Erreur de paiement Pi :", error);
            alert("Erreur lors du paiement : " + (error.message || "Échec"));
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Erreur createPayment :", err);
    }
}

function onIncompletePaymentFound(payment) {
    console.log("Paiement incomplet trouvé :", payment);
}
