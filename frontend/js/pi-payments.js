/* ==========================================
   Entreprise ARASHI v4.0 - Paiements Pi Network
   Fichier : js/pi-payments.js (Corrigé pour Vercel)
========================================== */

import { supabase } from './supabase.js';

export async function createPiPayment(amount, memo, metadata = {}) {
    if (typeof Pi === "undefined") {
        alert("Le SDK Pi Network n'est pas chargé. Ouvrez l'application dans Pi Browser.");
        return;
    }

    const paymentData = {
        amount: parseFloat(amount),
        memo: memo,
        metadata: metadata
    };

    const paymentCallbacks = {
        onReadyForServerApproval: async (paymentId) => {
            console.log("Paiement prêt pour approbation serveur :", paymentId);
            
            try {
                // 1. Appel vers la fonction Serverless Vercel (api/approve-payment.js)
                const response = await fetch('/api/approve-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });

                const data = await response.json();
                if (!response.ok) {
                    console.error("Erreur d'approbation backend :", data);
                    return;
                }
                console.log("Paiement approuvé avec succès par le serveur !");

                // 2. Insertion du suivi dans Supabase
                const user = window.currentUser || {};
                await supabase.from("orders").insert([{
                    payment_id: paymentId,
                    username: user.username || "Inconnu",
                    amount: amount,
                    memo: memo,
                    status: "approved"
                }]);

            } catch (err) {
                console.error("Erreur réseau lors de l'approbation :", err);
            }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("Paiement prêt pour validation finale :", paymentId, txid);

            try {
                // 1. Appel vers la fonction Serverless Vercel (api/complete-payment.js)
                const response = await fetch('/api/complete-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                });

                const data = await response.json();
                if (!response.ok) {
                    console.error("Erreur de finalisation backend :", data);
                    return;
                }
                console.log("Paiement finalisé avec succès sur la blockchain Pi !");

                // 2. Mise à jour dans Supabase
                await supabase.from("orders").update({
                    status: "completed",
                    txid: txid
                }).eq("payment_id", paymentId);

                alert("🎉 Achat effectué et validé avec succès !");
                if (typeof window.loadUserOrders === "function") window.loadUserOrders();

            } catch (err) {
                console.error("Erreur réseau lors de la finalisation :", err);
            }
        },

        onCancel: (paymentId) => {
            console.log("Paiement annulé par l'utilisateur :", paymentId);
        },

        onError: (error, payment) => {
            console.error("Erreur de paiement Pi :", error, payment);
            alert("Une erreur est survenue lors du paiement Pi.");
        }
    };

    try {
        await Pi.createPayment(paymentData, paymentCallbacks);
    } catch (err) {
        console.error("Erreur d'initialisation du paiement :", err);
    }
}

window.createPiPayment = createPiPayment;