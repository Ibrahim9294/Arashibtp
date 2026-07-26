// =====================================
// Entreprise ARASHI v3.0
// js/pi-payments.js - Gestion Pi SDK & Paiements
// =====================================

let currentPiUser = null;
let isSdkInitialized = false;

// Réveil préventif du serveur Render (Free Tier)
fetch("https://entreprise-arashi-backend.onrender.com/", { method: "GET" }).catch(() => {});

export function initPiSdk() {
    if (isSdkInitialized) return;

    if (typeof Pi !== "undefined") {
        try {
            // Passez sandbox: false si votre application est configurée sur le Mainnet Pi
            Pi.init({ version: "2.0", sandbox: true });
            isSdkInitialized = true;
            console.log("SDK Pi initialisé.");
        } catch (e) {
            console.error("Erreur init Pi SDK :", e);
        }
    } else {
        console.warn("Le script du SDK Pi n'est pas encore chargé.");
    }
}

// Traitement des paiements incomplets pour éviter que les transactions n'expirent
function onIncompletePaymentFound(payment) {
    console.log("Paiement incomplet détecté :", payment);
    if (payment && payment.identifier) {
        fetch("https://entreprise-arashi-backend.onrender.com/api/pi/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid || "incomplete_resolved" })
        }).catch(err => console.error("Erreur résolution paiement incomplet :", err));
    }
}

export async function loginWithPi() {
    initPiSdk();

    if (typeof Pi === "undefined") {
        throw new Error("SDK Pi introuvable. Ouvrez l'application dans Pi Browser.");
    }

    try {
        const auth = await Pi.authenticate(["username", "payments"], onIncompletePaymentFound);
        currentPiUser = auth.user;
        localStorage.setItem("pi_user", JSON.stringify(auth.user));
        return auth.user;
    } catch (error) {
        console.error("Erreur d'authentification Pi :", error);
        throw error;
    }
}

export async function createPiPayment(amount, memo, productId) {
    initPiSdk();

    if (!currentPiUser) {
        const saved = localStorage.getItem("pi_user");
        if (saved) {
            try { currentPiUser = JSON.parse(saved); } catch (e) {}
        }
    }

    if (!currentPiUser) {
        try {
            currentPiUser = await loginWithPi();
        } catch (e) {
            alert("Veuillez vous connecter avec Pi avant d'effectuer un achat.");
            return;
        }
    }

    const paymentData = {
        amount: Number(amount),
        memo: memo || "Achat Entreprise ARASHI",
        metadata: { productId: productId || "default", uid: currentPiUser.uid || currentPiUser.username }
    };

    const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
            console.log("Demande d'approbation serveur pour :", paymentId);
            try {
                const res = await fetch("https://entreprise-arashi-backend.onrender.com/api/pi/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, user: currentPiUser })
                });
                
                if (!res.ok) {
                    const errData = await res.json();
                    console.error("Échec approbation backend :", errData);
                }
            } catch (err) {
                console.error("Erreur réseau approbation :", err);
            }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("Demande de finalisation serveur pour :", paymentId);
            try {
                await fetch("https://entreprise-arashi-backend.onrender.com/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid, user: currentPiUser })
                });
                alert("🎉 Paiement effectué et confirmé avec succès !");
            } catch (err) {
                console.error("Erreur réseau finalisation :", err);
            }
        },
        onCancel: (paymentId) => {
            console.log("Paiement annulé par l'utilisateur :", paymentId);
        },
        onError: (error) => {
            console.error("Erreur SDK Paiement :", error);
            alert("Erreur lors du paiement : " + (error.message || "Échec"));
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Erreur déclenchement createPayment :", err);
    }
}

// Initialisation au chargement
initPiSdk();

window.createPiPayment = createPiPayment;
window.loginWithPi = loginWithPi;
window.initPiSdk = initPiSdk;
