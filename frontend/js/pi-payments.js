/* ==========================================
   Entreprise ARASHI v4.0 - Paiements Pi Network
   Fichier : js/pi-payments.js
========================================== */

import { supabase } from './supabase.js';

export async function createPiPayment(amount, memo, metadata = {}) {
    if (typeof Pi === "undefined") {
        alert("Le SDK Pi Network n'est pas prêt. Ouvrez l'application dans Pi Browser.");
        return;
    }

    const paymentData = {
        amount: parseFloat(amount),
        memo: memo,
        metadata: metadata
    };

    const paymentCallbacks = {
        // Step 1 : Approbation obligatoire par le serveur du développeur
        onReadyForServerApproval: async (paymentId) => {
            console.log("Approbation serveur requise pour paymentId :", paymentId);
            
            try {
                const res = await fetch('/api/approve-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });

                if (!res.ok) {
                    throw new Error("Échec de l'approbation du serveur.");
                }

                // Enregistrement de la commande en attente dans Supabase
                const user = window.currentUser || {};
                await supabase.from("orders").insert([{
                    payment_id: paymentId,
                    username: user.username || "Inconnu",
                    amount: amount,
                    memo: memo,
                    status: "approved"
                }]);

            } catch (err) {
                console.error("Erreur lors de l'approbation :", err);
            }
        },

        // Step 2 : Validation finale et enregistrement de la transaction (TXID)
        onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("Finalisation requise :", paymentId, txid);

            try {
                const res = await fetch('/api/complete-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                });

                if (res.ok) {
                    await supabase.from("orders").update({
                        status: "completed",
                        txid: txid
                    }).eq("payment_id", paymentId);

                    alert("🎉 Paiement validé avec succès sur la Blockchain Pi !");
                    if (typeof window.loadUserOrders === "function") window.loadUserOrders();
                }
            } catch (err) {
                console.error("Erreur lors de la finalisation :", err);
            }
        },

        onCancel: (paymentId) => {
            console.log("Paiement annulé :", paymentId);
        },
        onError: (error, payment) => {
            console.error("Erreur de paiement :", error, payment);
            alert("Erreur de paiement Pi.");
        }
    };

    try {
        await Pi.createPayment(paymentData, paymentCallbacks);
    } catch (err) {
        console.error("Erreur d'exécution du paiement :", err);
    }
}

window.createPiPayment = createPiPayment;