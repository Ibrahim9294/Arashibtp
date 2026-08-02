/* ==========================================
   Entreprise ARASHI v4.0 - Module Mes Commandes
   Fichier : js/orders.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Charge l'ensemble des commandes passées par l'utilisateur connecté
 */
export async function loadUserOrders() {
    const tbody = document.getElementById("userOrdersTable");
    if (!tbody) return;

    const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

    if (!user || (!user.uid && !user.username)) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Veuillez vous connecter avec Pi Network pour consulter vos commandes.
                </td>
            </tr>
        `;
        return;
    }

    const username = user.username || user.uid;

    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("username", username)
            .order("created_at", { ascending: false });

        if (error) throw error;

        tbody.innerHTML = "";

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Vous n'avez passé aucune commande pour le moment.
                    </td>
                </tr>
            `;
            return;
        }

        orders.forEach(order => {
            const row = document.createElement("tr");
            row.style.borderBottom = "1px solid var(--border)";

            let badgeClass = "badge-warning";
            let statusLabel = "En cours";

            if (order.status === "completed") {
                badgeClass = "badge-success";
                statusLabel = "Validée";
            } else if (order.status === "cancelled") {
                badgeClass = "badge-danger";
                statusLabel = "Annulée";
            }

            row.innerHTML = `
                <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">
                    ${order.payment_id ? order.payment_id.substring(0, 10) + "..." : (order.id || "-")}
                </td>
                <td style="padding: 12px 10px; font-weight: bold;">${order.memo || "Commande d'article"}</td>
                <td style="padding: 12px 10px; color: #f39c12; font-weight: bold;">${parseFloat(order.amount || 0).toFixed(2)} π</td>
                <td style="padding: 12px 10px; color: var(--text-muted);">
                    ${order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                </td>
                <td style="padding: 12px 10px;">
                    <span class="badge ${badgeClass}">${statusLabel}</span>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Erreur lors du chargement des commandes :", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Erreur de récupération des données des commandes.
                </td>
            </tr>
        `;
    }
}

// Initialisation automatique au chargement
document.addEventListener("DOMContentLoaded", () => {
    loadUserOrders();
});