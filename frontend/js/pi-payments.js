/* ==========================================
   Entreprise ARASHI v4.0 - Paiements Pi Network
   Fichier : js/pi-payments.js
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
            console.log("Paiement prêt pour approbation :", paymentId);
            // Insertion du suivi temporaire dans Supabase
            const user = window.currentUser || {};
            await supabase.from("orders").insert([{
                payment_id: paymentId,
                username: user.username || "Inconnu",
                amount: amount,
                memo: memo,
                status: "pending"
            }]);
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("Paiement prêt pour validation finale :", paymentId, txid);
            await supabase.from("orders").update({
                status: "completed",
                txid: txid
            }).eq("payment_id", paymentId);

            alert("Achat effectué avec succès !");
            if (typeof window.loadUserOrders === "function") window.loadUserOrders();
        },
        onCancel: (paymentId) => {
            console.log("Paiement annulé par l'utilisateur :", paymentId);
        },
        onError: (error, payment) => {
            console.error("Erreur de paiement Pi :", error, payment);
            alert("Une erreur est survenue lors du paiement.");
        }
    };

    try {
        await Pi.createPayment(paymentData, paymentCallbacks);
    } catch (err) {
        console.error("Erreur d'initialisation du paiement :", err);
    }
}

window.createPiPayment = createPiPayment;