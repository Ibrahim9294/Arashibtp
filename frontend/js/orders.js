/* ==========================================
   Entreprise ARASHI v4.0 & v3.0
   Fichier : js/orders.js - Gestion des Commandes Supabase & Pi
========================================== */

import { supabase } from "./supabase.js";

/**
 * Charge et affiche les commandes associées à l'utilisateur Pi connecté
 */
export async function loadUserOrders() {
    const tbody = document.getElementById("userOrdersTable");
    if (!tbody) return;

    // Récupération de l'utilisateur actif via auth.js
    const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

    if (!user || !user.uid) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-lock"></i> Connectez-vous avec Pi Network pour consulter vos commandes.
                </td>
            </tr>
        `;
        updateKPIs(0, 0, 0);
        return;
    }

    try {
        // Requête simultanée dans la table des commandes ou des paiements validés
        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("pi_uid", user.uid)
            .order("created_at", { ascending: false });

        if (error) {
            // Repli alternatif sur la table 'payments' si la table 'orders' n'existe pas encore
            console.warn("⚠️ Table 'orders' non accessible, tentative sur la table 'payments'...");
            return await loadOrdersFromPayments(user.uid);
        }

        renderOrdersTable(orders || []);

    } catch (err) {
        console.error("❌ Erreur de chargement des commandes :", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #e74c3c;">
                    Impossible de récupérer vos commandes pour le moment.
                </td>
            </tr>
        `;
    }
}

/**
 * Repli automatique : charge les commandes enregistrées dans la table 'payments'
 */
async function loadOrdersFromPayments(piUid) {
    const tbody = document.getElementById("userOrdersTable");
    try {
        const { data: payments, error } = await supabase
            .from("payments")
            .select("*")
            .eq("pi_uid", piUid)
            .order("created_at", { ascending: false });

        if (error) throw error;

        renderOrdersTable(payments || []);
    } catch (error) {
        console.error("❌ Erreur de chargement depuis 'payments' :", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #e74c3c;">
                    Erreur d'accès à la base de données.
                </td>
            </tr>
        `;
    }
}

/**
 * Formate et injecte la liste des commandes dans le tableau HTML
 */
function renderOrdersTable(items) {
    const tbody = document.getElementById("userOrdersTable");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Vous n'avez passé aucune commande pour le moment.
                </td>
            </tr>
        `;
        updateKPIs(0, 0, 0);
        return;
    }

    let pendingCount = 0;
    let completedCount = 0;

    items.forEach(item => {
        const orderId = item.id || item.payment_id || "ORD-000";
        const title = item.title || item.memo || item.product_id || "Commande ARASHI";
        const price = item.amount || item.price_pi || 0;
        const rawStatus = (item.status || "COMPLETED").toUpperCase();
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : "-";

        let statusBadge = "";
        if (rawStatus === "COMPLETED" || rawStatus === "DELIVERED" || rawStatus === "PAYÉ") {
            completedCount++;
            statusBadge = `<span class="badge" style="background: #2ecc71; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;"><i class="fa-solid fa-check"></i> Complété</span>`;
        } else if (rawStatus === "PENDING" || rawStatus === "EN COURS") {
            pendingCount++;
            statusBadge = `<span class="badge" style="background: #f39c12; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;"><i class="fa-solid fa-clock"></i> En cours</span>`;
        } else {
            statusBadge = `<span class="badge" style="background: #e74c3c; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Annulé</span>`;
        }

        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid var(--border)";
        row.innerHTML = `
            <td style="padding: 12px 10px; font-size: 0.85rem; font-family: monospace;">${orderId}</td>
            <td style="padding: 12px 10px; font-weight: bold;">${title}</td>
            <td style="padding: 12px 10px; color: #f39c12; font-weight: bold;">${price} π</td>
            <td style="padding: 12px 10px;">${statusBadge}</td>
            <td style="padding: 12px 10px; color: var(--text-muted);">${dateStr}</td>
        `;
        tbody.appendChild(row);
    });

    updateKPIs(items.length, pendingCount, completedCount);
}

/**
 * Met à jour les compteurs KPI en haut de page
 */
function updateKPIs(total, pending, completed) {
    const totalEl = document.getElementById("totalOrdersCount");
    const pendingEl = document.getElementById("pendingOrdersCount");
    const completedEl = document.getElementById("completedOrdersCount");

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (completedEl) completedEl.textContent = completed;
}

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    loadUserOrders();

    const refreshBtn = document.getElementById("refreshOrdersBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            loadUserOrders();
        });
    }
});