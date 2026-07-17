/* ==========================================
   ENTREPRISE ARASHI v3.0 - API Pi Payments
========================================== */

import { supabase } from './supabase.js';

console.log("🪙 Module Pi Payments ARASHI v3.0 Initialisé");

const Pi = window.Pi;

/**
 * Lance le processus de paiement officiel en monnaie Pi
 * @param {number} amount - Le montant en Pi (ex: 3.14)
 * @param {string} memo - La raison du paiement (ex: "Achat Ciment Tonne")
 * @param {string} itemId - L'identifiant du produit ou de la propriété
 */
window.createPiPayment = function(amount, memo, itemId) {
    if (!Pi) {
        alert("Veuillez utiliser le Pi Browser pour effectuer vos transactions en Pi.");
        return;
    }

    console.log(`💸 Initialisation d'un paiement de ${amount} π pour : "${memo}"`);

    // Appel de l'API de paiement du SDK Pi
    Pi.createPayment({
        amount: amount,
        memo: memo,
        metadata: { itemId: itemId },
    }, {
        onReadyForServerApproval: function(paymentId) {
            console.log(`⏳ Paiement approuvé par l'utilisateur. ID: ${paymentId}. En attente de validation serveur...`);
            // Étape 1 : Envoyer le paymentId à ton serveur ou Supabase pour validation
            approvePaymentOnServer(paymentId);
        },
        onReadyForServerCompletion: function(paymentId, txid) {
            console.log(`✅ Transaction soumise à la blockchain Pi ! TXID: ${txid}`);
            // Étape 2 : Confirmer la finalisation de la transaction
            completePaymentOnServer(paymentId, txid);
        },
        onCancel: function(paymentId) {
            console.log(`❌ Paiement annulé par l'utilisateur (ID: ${paymentId})`);
            alert("Paiement annulé.");
        },
        onError: function(error, payment) {
            console.error("❌ Erreur critique lors du paiement Pi :", error, payment);
            alert("Une erreur est survenue lors de la transaction.");
        }
    });
};

/**
 * Approuve le paiement côté serveur (sécurité obligatoire Pi Network)
 */
async function approvePaymentOnServer(paymentId) {
    try {
        // Enregistrement temporaire de la tentative de paiement dans Supabase
        const { error } = await supabase
            .from('payments')
            .insert([{ 
                pi_payment_id: paymentId, 
                status: 'approved',
                updated_at: new Date().toISOString()
            }]);

        if (error) console.error("⚠️ Erreur log Supabase (Approbation) :", error);
        
        // Note : Pour l'environnement de production Pi Core Team, 
        // l'approbation finale doit être envoyée depuis ton serveur Render à l'API Pi.
        console.log("🚀 Notification d'approbation enregistrée.");
    } catch (err) {
        console.error("Erreur serveur approbation :", err);
    }
}

/**
 * Finalise et clôture la transaction dans ta base de données
 */
async function completePaymentOnServer(paymentId, txid) {
    try {
        // Mise à jour du statut final du paiement dans Supabase
        const { error } = await supabase
            .from('payments')
            .update({ 
                status: 'completed', 
                blockchain_txid: txid,
                updated_at: new Date().toISOString()
            })
            .eq('pi_payment_id', paymentId);

        if (error) {
            console.error("❌ Erreur lors de la mise à jour du paiement dans Supabase :", error);
        } else {
            console.log("🎉 Paiement enregistré et validé avec succès dans l'écosystème ARASHI !");
            alert("Félicitations ! Votre paiement en Pi a été validé avec succès.");
            window.location.reload();
        }
    } catch (err) {
        console.error("Erreur serveur complétion :", err);
    }
}
