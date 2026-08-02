/* ==========================================
   Entreprise ARASHI v4.0 - Module Vendor Center
   Fichier : js/vendor.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Charge les statistiques et l'inventaire du vendeur connecté
 */
export async function loadVendorData() {
    const tbody = document.getElementById("vendorInventoryTable");
    const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

    if (!user || (!user.uid && !user.username)) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Veuillez vous connecter avec Pi Network pour gérer vos produits.
                    </td>
                </tr>
            `;
        }
        return;
    }

    const currentUsername = user.username || user.uid;

    try {
        // Récupération des articles publiés par le vendeur
        const { data: items, error } = await supabase
            .from("properties")
            .select("*")
            .eq("username", currentUsername)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Mise à jour du tableau d'inventaire
        if (tbody) {
            tbody.innerHTML = "";
            if (!items || items.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                            Vous n'avez encore publié aucun article.
                        </td>
                    </tr>
                `;
            } else {
                items.forEach(item => {
                    const row = document.createElement("tr");
                    row.style.borderBottom = "1px solid var(--border)";
                    row.innerHTML = `
                        <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">${item.id}</td>
                        <td style="padding: 12px 10px; font-weight: bold;">${item.title}</td>
                        <td style="padding: 12px 10px; color: #f39c12; font-weight: bold;">${item.price_pi || item.price || 0} π</td>
                        <td style="padding: 12px 10px; color: var(--text-muted);">${item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                        <td style="padding: 12px 10px; text-align: right;">
                            <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteVendorItem('${item.id}')">
                                <i class="fa-solid fa-trash"></i> Retirer
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }

        // Mise à jour des compteurs et statistiques
        const countEl = document.getElementById("vendorItemsCount");
        if (countEl) countEl.textContent = items ? items.length : 0;

        // Calcul des revenus estimés si des articles existent
        const totalEarningsEl = document.getElementById("vendorTotalEarnings");
        if (totalEarningsEl && items) {
            const total = items.reduce((sum, item) => sum + parseFloat(item.price_pi || item.price || 0), 0);
            totalEarningsEl.textContent = `${total.toFixed(2)} π`;
        }

    } catch (err) {
        console.error("Erreur lors du chargement de l'inventaire vendeur :", err);
    }
}

/**
 * Supprime un article appartenant au vendeur
 */
export async function deleteVendorItem(id) {
    if (confirm("Voulez-vous vraiment retirer cet article de la vente ?")) {
        try {
            const { error } = await supabase
                .from("properties")
                .delete()
                .eq("id", id);

            if (error) throw error;

            alert("Article retiré avec succès.");
            loadVendorData();
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    }
}

/**
 * Initialise le formulaire de publication de produits/services
 */
export function setupVendorForm() {
    const form = document.getElementById("vendorPublishForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

        if (!user) {
            alert("Veuillez d'abord vous connecter avec Pi Network.");
            return;
        }

        const title = document.getElementById("vendorItemTitle").value;
        const price = parseFloat(document.getElementById("vendorItemPrice").value);
        const image = document.getElementById("vendorItemImage").value;
        const description = document.getElementById("vendorItemDescription").value;

        try {
            const { error } = await supabase.from("properties").insert([{
                title: title,
                price_pi: price,
                image_url: image || "https://via.placeholder.com/300x200?text=Produit+Vendeur",
                description: description,
                username: user.username || user.uid,
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;

            alert("🎉 Article mis en ligne avec succès !");
            form.reset();
            loadVendorData();
        } catch (err) {
            alert("Erreur de publication : " + err.message);
        }
    });
}

// Expositions globales pour les événements inline (onclick) et l'initialisation DOM
window.loadVendorData = loadVendorData;
window.deleteVendorItem = deleteVendorItem;

document.addEventListener("DOMContentLoaded", () => {
    setupVendorForm();
    loadVendorData();
});