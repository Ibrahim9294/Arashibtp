/* ==========================================
   Entreprise ARASHI v4.0 & v3.0
   Fichier : js/dashboard.js - Tableau de bord ERP & Vendeur
========================================== */

import { supabase } from "./supabase.js";
import { changeLanguage } from "./lang.js";

// Récupération de l'utilisateur Pi authentifié
const user = JSON.parse(localStorage.getItem("pi_user") || "null");

/**
 * Charge les métriques et données du tableau de bord
 */
export async function loadDashboard() {
    const status = document.getElementById("userStatus");

    if (!user) {
        if (status) {
            status.innerHTML = `<span class="badge badge-warning" data-lang="user_disconnected">Non connecté</span>`;
        }
        console.warn("Tableau de bord : Aucun utilisateur Pi connecté.");
        return;
    }

    if (status && user.username) {
        status.innerHTML = `🟢 @${user.username}`;
    }

    try {
        // Exécution en parallèle des requêtes Supabase
        const [
            productsRes,
            ordersRes,
            paymentsRes,
            propertiesRes,
            vendorsRes
        ] = await Promise.all([
            supabase.from("products").select("*").eq("username", user.username),
            supabase.from("orders").select("*").eq("username", user.username),
            supabase.from("payments").select("*").eq("username", user.username),
            supabase.from("properties").select("*"),
            supabase.from("vendors").select("*")
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const payments = paymentsRes.data || [];
        const properties = propertiesRes.data || [];
        const vendors = vendorsRes.data || [];

        // 1. Mise à jour des compteurs du Dashboard
        const dashboardProducts = document.getElementById("dashboardProducts");
        if (dashboardProducts) dashboardProducts.textContent = products.length;

        const dashboardOrders = document.getElementById("dashboardOrders");
        if (dashboardOrders) dashboardOrders.textContent = orders.length;

        const dashboardProperties = document.getElementById("dashboardProperties");
        if (dashboardProperties) dashboardProperties.textContent = properties.length;

        const dashboardVendors = document.getElementById("dashboardVendors");
        if (dashboardVendors) dashboardVendors.textContent = vendors.length;

        // 2. Calcul du Revenu Total Cumulé en Pi Network
        const totalRevenue = payments
            .filter(p => p.status === 'completed' || p.status === 'approved' || p.status === 'SUCCESS')
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const dashboardRevenue = document.getElementById("dashboardRevenue");
        if (dashboardRevenue) {
            dashboardRevenue.textContent = totalRevenue.toFixed(2) + " π";
        }

        // 3. Rendu de la table des paiements récents
        renderRecentPayments(payments);

        // 4. Application de la langue
        const currentLang = localStorage.getItem("arashi_lang") || "fr";
        if (typeof changeLanguage === 'function') {
            changeLanguage(currentLang);
        }

    } catch (err) {
        console.error("❌ Erreur lors du chargement du Dashboard :", err);
    }
}

/**
 * Génère les 10 dernières lignes du tableau des paiements
 * @param {Array} payments - Liste des transactions reçues depuis Supabase
 */
function renderRecentPayments(payments) {
    const tableBody = document.getElementById("recentPayments");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (payments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 15px;">
                    Aucune transaction récente enregistrée.
                </td>
            </tr>
        `;
        return;
    }

    payments.slice(0, 10).forEach(payment => {
        const dateStr = payment.updated_at || payment.created_at
            ? new Date(payment.updated_at || payment.created_at).toLocaleString()
            : "-";

        let badgeClass = "badge-warning";
        const statusLower = (payment.status || '').toLowerCase();
        if (statusLower === 'completed' || statusLower === 'success') badgeClass = "badge-success";
        if (statusLower === 'cancelled' || statusLower === 'failed') badgeClass = "badge-danger";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${dateStr}</td>
            <td><strong>${payment.amount || 0} π</strong></td>
            <td><span class="badge ${badgeClass}">${payment.status || 'En attente'}</span></td>
            <td>${payment.memo || payment.payment_id || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", loadDashboard);