// =====================================
// Entreprise ARASHI v3.0
// js/pi-payments.js - Gestion Pi SDK & Paiements
// =====================================

let currentPiUser = null;
let isSdkInitialized = false;

// 1. Réveil préventif du serveur Render (Free Tier)
fetch("https://entreprise-arashi.onrender.com/", { method: "GET" }).catch(() => {});

// 2. Récupération préalable de l'utilisateur Pi en cache
const savedUser = localStorage.getItem("pi_user");
if (savedUser) {
    try {
        currentPiUser = JSON.parse(savedUser);
        updateUserUI(currentPiUser.username);
    } catch (e) {
        localStorage.removeItem("pi_user");
    }
}

/**
 * Mise à jour de l'affichage utilisateur sur la page
 */
function updateUserUI(username) {
    const userStatusElem = document.getElementById("userStatus");
    if (userStatusElem && username) {
        userStatusElem.textContent = `👤 @${username}`;
        userStatusElem.style.color = "#34d399";
    }
}

/**
 * Initialisation du SDK Pi
 */
export function initPiSdk() {
    if (isSdkInitialized) return;

    if (typeof Pi !== "undefined") {
        try {
            // ⚠️ Mettre sandbox: true pour tester en Pi Testnet, sandbox: false pour Mainnet
            Pi.init({ version: "2.0", sandbox: true });
            isSdkInitialized = true;
            console.log("⚡ SDK Pi initialisé avec succès.");
        } catch (e) {
            console.error("Erreur init Pi SDK :", e);
        }
    } else {
        console.warn("Le script du SDK Pi n'est pas encore disponible dans le DOM.");
    }
}

/**
 * Gestion des paiements incomplets (Anti-blocage Pi Browser)
 */
function onIncompletePaymentFound(payment) {
    console.log("Paiement incomplet détecté :", payment);
    if (payment && payment.identifier) {
        fetch("https://entreprise-arashi.onrender.com/api/pi/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                paymentId: payment.identifier, 
                txid: payment.transaction?.txid || "incomplete_resolved" 
            })
        }).catch(err => console.error("Erreur résolution paiement incomplet :", err));
    }
}

/**
 * Connexion/Authentification Pi
 */
export async function loginWithPi() {
    initPiSdk();

    if (typeof Pi === "undefined") {
        alert("⚠️ SDK Pi introuvable. Ouvrez l'application depuis le navigateur Pi Browser.");
        throw new Error("SDK Pi introuvable.");
    }

    try {
        const auth = await Pi.authenticate(["username", "payments"], onIncompletePaymentFound);
        currentPiUser = auth.user;
        localStorage.setItem("pi_user", JSON.stringify(auth.user));
        
        updateUserUI(auth.user.username);
        console.log("Connecté sous le compte Pi :", auth.user.username);
        return auth.user;
    } catch (error) {
        console.error("Erreur d'authentification Pi :", error);
        throw error;
    }
}

/**
 * Traitement du paiement d'un article/service
 */
export async function createPiPayment(amount, memo, productId) {
    initPiSdk();

    if (!currentPiUser) {
        try {
            currentPiUser = await loginWithPi();
        } catch (e) {
            alert("Veuillez vous connecter avec Pi Network avant de continuer.");
            return;
        }
    }

    const paymentData = {
        amount: Number(amount),
        memo: memo || "Achat ARASHI Enterprise",
        metadata: { productId: productId || "default", uid: currentPiUser.uid || currentPiUser.username }
    };

    const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
            console.log("Demande d'approbation serveur pour :", paymentId);
            try {
                const res = await fetch("https://entreprise-arashi.onrender.com/api/pi/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, user: currentPiUser })
                });

                if (!res.ok) {
                    const errData = await res.json();
                    console.error("Échec approbation backend :", errData);
                }
            } catch (err) {
                console.error("Erreur réseau lors de l'approbation :", err);
            }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("Demande de finalisation serveur pour :", paymentId);
            try {
                await fetch("https://entreprise-arashi.onrender.com/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid, user: currentPiUser })
                });
                alert(`🎉 Paiement de ${amount} π confirmé avec succès !\nTransaction : ${txid}`);
            } catch (err) {
                console.error("Erreur réseau lors de la finalisation :", err);
            }
        },
        onCancel: (paymentId) => {
            console.log("Paiement annulé par l'utilisateur :", paymentId);
        },
        onError: (error) => {
            console.error("Erreur SDK Paiement :", error);
            alert("Erreur de paiement : " + (error.message || "Échec de la transaction"));
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Erreur lors de createPayment :", err);
    }
}

// Initialisation au chargement
initPiSdk();

// Attachement global pour l'accès HTML
window.createPiPayment = createPiPayment;
window.loginWithPi = loginWithPi;
window.initPiSdk = initPiSdk;