/* ==========================================
   Entreprise ARASHI v4.0 - Authentification Pi Network
   Fichier : js/auth.js
========================================== */

import { supabase } from './supabase.js';

let isPiInitialized = false;

/**
 * Initialise le SDK Pi
 */
export async function initPiSDK() {
    if (typeof Pi === "undefined") {
        console.warn("Pi SDK introuvable dans la fenêtre globale.");
        return false;
    }

    try {
        // Activez sandbox: true pour les tests sur Testnet, false pour Mainnet
        await Pi.init({ version: "2.0", sandbox: true });
        isPiInitialized = true;
        console.log("SDK Pi Network initialisé avec succès.");
        return true;
    } catch (err) {
        console.error("Erreur lors de l'initialisation du SDK Pi:", err);
        return false;
    }
}

/**
 * Gère la connexion de l'utilisateur via Pi Network
 */
export async function loginWithPi() {
    const statusEl = document.getElementById("userStatus");
    const loginBtn = document.getElementById("piLogin");

    if (!isPiInitialized) {
        const ok = await initPiSDK();
        if (!ok) {
            alert("Veuillez ouvrir cette application depuis l'application Pi Browser.");
            return;
        }
    }

    const scopes = ['username', 'payments'];

    function onIncompletePaymentFound(payment) {
        console.log("Paiement non finalisé détecté :", payment);
    }

    try {
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        if (auth && auth.user) {
            window.currentUser = auth.user;

            // Enregistrement / Mise à jour dans Supabase
            await supabase.from("users").upsert({
                uid: auth.user.uid,
                username: auth.user.username,
                last_login: new Date().toISOString()
            }, { onConflict: 'uid' });

            if (statusEl) {
                statusEl.textContent = `@${auth.user.username}`;
                statusEl.className = "badge badge-success";
            }
            if (loginBtn) {
                loginBtn.style.display = "none";
            }

            // Rafraîchir les modules en cours si nécessaire
            if (typeof window.loadUserOrders === "function") window.loadUserOrders();
            if (typeof window.loadAdminData === "function") window.loadAdminData();
        }
    } catch (error) {
        console.error("Échec de l'authentification Pi :", error);
        alert("Échec de la connexion via Pi Network. Vérifiez votre configuration sur le Portail Développeur Pi.");
    }
}

// Lancement automatique de l'initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
    initPiSDK();
    const loginBtn = document.getElementById("piLogin");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginWithPi);
    }
});