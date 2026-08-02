/* ==========================================
   ARASHI Enterprise v4.0 - Pi Payments Integration
   Fichier : js/pi-payments.js (Corrigé pour Render)
========================================== */

import { supabase } from './supabase.js';

// URL de votre backend Render
const BACKEND_URL = "https://entreprise-arashi.onrender.com";

export const PiPaymentManager = {
    user: null,

    /**
     * Initialise le SDK Pi
     */
    init: async function() {
        if (typeof Pi === 'undefined') {
            console.warn("SDK Pi Network non détecté. Ouvrez l'application dans le Pi Browser.");
            return;
        }

        try {
            await Pi.init({ version: "2.0", sandbox: true }); // Mettre false en production Mainnet
            console.log("SDK Pi Network v2.0 initialisé avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'initialisation du SDK Pi :", error);
        }
    },

    /**
     * Authentification de l'utilisateur via le Pi SDK
     */
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
            this.user = auth.user;
            this.updateUIOnLogin(auth.user);
            return auth.user;
        } catch (error) {
            console.error("Erreur d'authentification Pi Network :", error);
            return null;
        }
    },

    /**
     * Met à jour l'interface utilisateur après connexion
     */
    updateUIOnLogin: function(user) {
        const loginBtn = document.getElementById('piLogin');
        if (loginBtn) {
            loginBtn.innerHTML = `⚡ ${user.username}`;
            loginBtn.style.background = '#28a745';
            loginBtn.style.color = '#fff';
        }
    },

    /**
     * Lance un paiement Pi pour une commande
     * @param {Object} itemDetails - Les détails de l'article (amount, memo, metadata)
     */
    createPayment: async function(itemDetails) {
        if (!this.user) {
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
                // Appel obligatoire vers votre backend Render pour approuver auprès de l'API Pi
                await PiPaymentManager.verifyOnBackend(paymentId, 'approve');
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                console.log("Paiement exécuté par le client. Finalisation. TXID :", txid);
                // Appel obligatoire vers votre backend Render pour finaliser la transaction
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

    /**
     * Communique avec votre serveur Render (qui gère l'API Pi et Supabase)
     */
    verifyOnBackend: async function(paymentId, action, txid = null) {
        console.log(`[BACKEND ACTION] Mode: ${action} | PaymentID: ${paymentId} | TXID: ${txid}`);
        
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

            console.log(`Succès de l'action ${action} sur le backend :`, data);
            return data;
        } catch (err) {
            console.error("Erreur de communication avec le serveur Render :", err);
        }
    }
};

// Initialisation automatique au chargement
document.addEventListener('DOMContentLoaded', () => {
    PiPaymentManager.init();

    const loginBtn = document.getElementById('piLogin');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            PiPaymentManager.login();
        });
    }
});

// Exposition globale pour compatibilité avec les boutons HTML
window.createPiPayment = (amount, memo, metadata) => {
    PiPaymentManager.createPayment({ amount, memo, metadata });
};