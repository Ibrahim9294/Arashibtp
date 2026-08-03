/* ==========================================
   ARASHI Enterprise v4.0 - Pi Payments Integration
   Fichier : js/pi-payments.js (Corrigé et unifié)
========================================== */

import { supabase } from './supabase.js';

const BACKEND_URL = "https://entreprise-arashi.onrender.com";

export const PiPaymentManager = {
    user: null,

    init: async function() {
        if (typeof Pi === 'undefined') {
            console.warn("SDK Pi Network non détecté. Ouvrez l'application dans le Pi Browser.");
            return;
        }

        try {
            await Pi.init({ version: "2.0", sandbox: true });
            console.log("SDK Pi Network v2.0 initialisé avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'initialisation du SDK Pi :", error);
        }
    },

    login: async function() {
        if (typeof Pi === 'undefined') {
            alert("Veuillez utiliser le Pi Browser pour vous connecter.");
            return null;
        }

        const scopes = ['username', 'payments'];

        const onIncompletePaymentFound = async (payment) => {
            console.log("Paiement incomplet détecté :", payment);
            await PiPaymentManager.verifyOnBackend(payment.paymentId, 'approve');
        };

        try {
            const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
            if (auth && auth.user) {
                this.user = auth.user;
                window.currentUser = auth.user; // Partage global

                // Sauvegarde dans Supabase
                await supabase.from("users").upsert({
                    uid: auth.user.uid,
                    username: auth.user.username,
                    last_login: new Date().toISOString()
                }, { onConflict: 'uid' });

                this.updateUIOnLogin(auth.user);
                alert(`Bienvenue @${auth.user.username} !`);
                return auth.user;
            }
        } catch (error) {
            console.error("Erreur d'authentification Pi Network :", error);
            alert("Échec de la connexion via Pi Network.");
        }
        return null;
    },

    updateUIOnLogin: function(user) {
        const loginBtn = document.getElementById('piLogin');
        const userStatus = document.getElementById('userStatus');
        
        if (loginBtn) {
            loginBtn.style.display = 'none'; // Masquer le bouton de connexion si connecté
        }
        if (userStatus) {
            userStatus.textContent = `@${user.username}`;
            userStatus.className = "badge badge-success";
        }
    },

    createPayment: async function(itemDetails) {
        // Vérification stricte de l'utilisateur connecté via le SDK
        if (!this.user) {
            alert("Veuillez vous connecter avec votre compte Pi avant d'effectuer un achat.");
            const loggedIn = await this.login();
            if (!loggedIn) return;
        }

        const paymentData = {
            amount: parseFloat(itemDetails.amount),
            memo: itemDetails.memo || "Achat sur ARASHI Enterprise Marketplace",
            metadata: itemDetails.metadata || {}
        };

        const paymentCallbacks = {
            onReadyForServerApproval: async (paymentId) => {
                console.log("Paiement prêt pour approbation serveur. ID :", paymentId);
                await PiPaymentManager.verifyOnBackend(paymentId, 'approve');
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                console.log("Paiement exécuté. Finalisation. TXID :", txid);
                await PiPaymentManager.verifyOnBackend(paymentId, 'complete', txid);
                alert("🎉 Paiement Pi effectué avec succès !");
                if (typeof window.loadUserOrders === "function") window.loadUserOrders();
            },
            onCancel: (paymentId) => {
                console.log("Paiement annulé par l'utilisateur. ID :", paymentId);
            },
            onError: (error, payment) => {
                console.error("Erreur durant la transaction Pi :", error, payment);
                alert("Une erreur est survenue lors de la transaction Pi.");
            }
        };

        try {
            await Pi.createPayment(paymentData, paymentCallbacks);
        } catch (error) {
            console.error("Erreur lors de la création du paiement :", error);
        }
    },

    verifyOnBackend: async function(paymentId, action, txid = null) {
        let endpoint = '';
        let bodyData = { paymentId, user: this.user };

        if (action === 'approve') {
            endpoint = `${BACKEND_URL}/api/pi/approve`;
        } else if (action === 'complete') {
            endpoint = `${BACKEND_URL}/api/pi/complete`;
            bodyData.txid = txid;
        }

        if (!endpoint) return;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();
            if (!response.ok) {
                console.error(`Erreur serveur Pi (${action}) :`, data);
                return null;
            }
            return data;
        } catch (err) {
            console.error("Erreur de communication avec le serveur Render :", err);
        }
    }
};

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    PiPaymentManager.init();

    const loginBtn = document.getElementById('piLogin');
    if (loginBtn) {
        // On s'assure d'utiliser la méthode unifiée du gestionnaire
        loginBtn.addEventListener('click', () => {
            PiPaymentManager.login();
        });
    }
});

// Exposition globale pour les boutons d'achat HTML
window.createPiPayment = (amount, memo, metadata) => {
    PiPaymentManager.createPayment({ amount, memo, metadata });
};