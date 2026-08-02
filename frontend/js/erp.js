/* ==========================================
   Entreprise ARASHI v4.0 - Module ERP Dashboard
   Fichier : js/erp.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Charge les métriques clés et l'activité récente pour le Dashboard ERP
 */
export async function loadERPStats() {
    const tableBody = document.getElementById("erpRecentActivityTable");
    const totalProductsEl = document.getElementById("erpTotalProducts");

    try {
        // 1. Récupération du total des offres/propriétés en catalogue
        const { count: productCount, error: countErr } = await supabase
            .from("properties")
            .select("*", { count: "exact", head: true });

        if (!countErr && totalProductsEl) {
            totalProductsEl.textContent = productCount !== null ? productCount : "0";
        }

        // 2. Récupération des transactions récentes (payments / orders)
        let payments = [];
        const { data: payData, error: payErr } = await supabase
            .from("payments")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

        if (!payErr && payData) {
            payments = payData;
        } else {
            // Fallback sur la table orders si payments n'est pas alimentée
            const { data: orderData, error: orderErr } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(5);
            if (!orderErr && orderData) payments = orderData;
        }

        // 3. Remplissage du tableau d'activité récente
        if (tableBody) {
            tableBody.innerHTML = "";
            if (!payments || payments.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                            Aucune transaction récente enregistrée.
                        </td>
                    </tr>
                `;
            } else {
                payments.forEach(tx => {
                    const row = document.createElement("tr");
                    row.style.borderBottom = "1px solid var(--border)";
                    row.innerHTML = `
                        <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">${tx.payment_id || tx.id ? (tx.payment_id || tx.id).substring(0, 8) + '...' : '-'}</td>
                        <td style="padding: 12px 10px; font-weight: 600;">@${tx.pi_uid || tx.username || 'Pioneer'}</td>
                        <td style="padding: 12px 10px; color: var(--text-muted);">${tx.memo || tx.title || 'Achat Marketplace'}</td>
                        <td style="padding: 12px 10px; color: #28a745; font-weight: bold;">${tx.amount || tx.price_pi || 0} π</td>
                        <td style="padding: 12px 10px;">
                            <span class="badge ${tx.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}">
                                ${tx.status || 'PENDING'}
                            </span>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        }
    } catch (err) {
        console.error("Erreur d'initialisation du Dashboard ERP :", err);
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: var(--danger);">
                        Erreur de chargement des données ERP.
                    </td>
                </tr>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadERPStats();
});