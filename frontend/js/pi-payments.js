/* ==========================================
   Entreprise ARASHI v4.0 - Module Paiements Pi
   Fichier : js/pi-payments.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Initialise le paiement via Pi SDK
 */
export async function createPiPayment(amount, memo, metadata = {}) {
    if (typeof Pi === "undefined") {
        alert("Le SDK Pi Network n'est pas disponible. Veuillez ouvrir cette page dans le Pi Browser.");
        return;
    }

    const paymentData = {
        amount: Number(amount),
        memo: memo,
        metadata: typeof metadata === "string" ? { productId: metadata } : metadata
    };

    const paymentCallbacks = {
        onReadyForServerApproval: async function(paymentId) {
            console.log("Paiement en attente d'approbation serveur, ID:", paymentId);
            // Insertion du statut d'attente dans Supabase
            const user = window.getCurrentUser ? window.getCurrentUser() : null;
            await supabase.from("orders").insert([{
                payment_id: paymentId,
                username: user?.username || 'Anonyme',
                amount: amount,
                memo: memo,
                status: 'pending',
                created_at: new Date().toISOString()
            }]);
        },
        onReadyForServerCompletion: async function(paymentId, txid) {
            console.log("Validation du paiement sur la blockchain, TXID:", txid);
            // Mise à jour de la commande comme validée
            await supabase.from("orders")
                .update({ status: 'completed', txid: txid })
                .eq("payment_id", paymentId);

            alert("🎉 Paiement effectué avec succès !");
            loadPaymentHistory();
        },
        onCancel: function(paymentId) {
            console.log("Paiement annulé par l'utilisateur :", paymentId);
        },
        onError: function(error, payment) {
            console.error("Erreur de paiement Pi Network :", error);
            alert("Une erreur est survenue lors de la transaction.");
        }
    };

    try {
        await Pi.createPayment(paymentData, paymentCallbacks);
    } catch (err) {
        console.error("Échec de l'initialisation du paiement :", err);
    }
}

/**
 * Charge l'historique des paiements de l'utilisateur
 */
export async function loadPaymentHistory() {
    const tbody = document.getElementById("recentPayments");
    if (!tbody) return;

    const user = window.getCurrentUser ? window.getCurrentUser() : null;

    try {
        let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10);
        
        if (user && (user.username || user.uid)) {
            query = query.eq("username", user.username || user.uid);
        }

        const { data: transactions, error } = await query;

        if (error) throw error;

        tbody.innerHTML = "";
        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Aucune transaction enregistrée.
                    </td>
                </tr>
            `;
            return;
        }

        transactions.forEach(tx => {
            const row = document.createElement("tr");
            row.style.borderBottom = "1px solid var(--border)";
            
            const badgeClass = tx.status === 'completed' ? 'badge-success' : 'badge-warning';
            const statusLabel = tx.status === 'completed' ? 'Validé' : 'En attente';

            row.innerHTML = `
                <td style="padding: 12px 10px; font-size: 0.85rem; color: var(--text-muted);">
                    ${tx.created_at ? new Date(tx.created_at).toLocaleString() : '-'}
                </td>
                <td style="padding: 12px 10px; font-weight: bold;">${tx.memo || 'Paiement direct'}</td>
                <td style="padding: 12px 10px; color: #f39c12; font-weight: bold;">${tx.amount} π</td>
                <td style="padding: 12px 10px;">
                    <span class="badge ${badgeClass}">${statusLabel}</span>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Erreur d'historique de paiement :", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Impossible de charger l'historique des transactions.
                </td>
            </tr>
        `;
    }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    window.createPiPayment = createPiPayment;
    
    const directForm = document.getElementById("directPaymentForm");
    if (directForm) {
        directForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const amount = document.getElementById("paymentAmount").value;
            const memo = document.getElementById("paymentMemo").value;
            const productId = document.getElementById("paymentProductId").value || "direct-pay";

            if (!amount || amount <= 0) {
                alert("Veuillez saisir un montant valide.");
                return;
            }

            createPiPayment(amount, memo, { productId });
        });
    }

    loadPaymentHistory();
});