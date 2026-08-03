/* ==========================================
   Entreprise ARASHI v4.0 - Module Suivi des Commandes
   Fichier : js/orders.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Charge l'historique des commandes de l'utilisateur connecté
 */
export async function loadUserOrders() {
    const tbody = document.getElementById("userOrdersTable");
    if (!tbody) return;

    // Récupération de l'utilisateur connecté via la fonction globale d'auth
    const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

    if (!user || (!user.uid && !user.username)) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 25px; color: var(--text-muted);">
                    Veuillez vous connecter avec Pi Network pour consulter vos commandes.
                </td>
            </tr>
        `;
        return;
    }

    const username = user.username || user.uid;

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 25px; color: var(--text-muted);">
                    Chargement de vos commandes...
                </td>
            </tr>
        `;

        // Requête Supabase sur la table "orders" filtrée par username
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
                    <td colspan="5" style="text-align: center; padding: 25px; color: var(--text-muted);">
                        Vous n'avez passé aucune commande pour le moment.
                    </td>
                </tr>
            `;
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid var(--border)";

            // Formatage de la date
            const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';
            
            // Badge de statut dynamique
            let statusBadge = `<span class="badge" style="background: #eab308; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">En cours</span>`;
            if (order.status === 'completed' || order.status === 'Validée') {
                statusBadge = `<span class="badge" style="background: #22c55e; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Validée</span>`;
            } else if (order.status === 'cancelled' || order.status === 'Annulée') {
                statusBadge = `<span class="badge" style="background: #ef4444; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Annulée</span>`;
            }

            tr.innerHTML = `
                <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">${order.payment_id || order.id || 'N/A'}</td>
                <td style="padding: 12px 10px;">${order.memo || 'Prestation / Article ARASHI'}</td>
                <td style="padding: 12px 10px; font-weight: bold; color: var(--warning);">⚡ ${parseFloat(order.amount || 0).toFixed(2)} π</td>
                <td style="padding: 12px 10px; color: var(--text-muted);">${dateStr}</td>
                <td style="padding: 12px 10px;">${statusBadge}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Erreur chargement des commandes :", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 25px; color: #ef4444;">
                    Erreur lors du chargement de l'historique des commandes.
                </td>
            </tr>
        `;
    }
}

// Initialisation automatique au chargement de la page orders.html
document.addEventListener("DOMContentLoaded", () => {
    loadUserOrders();
});

// Exposition globale pour le bouton "Actualiser" de la page HTML
window.loadUserOrders = loadUserOrders;