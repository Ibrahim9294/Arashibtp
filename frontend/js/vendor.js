/* ==========================================
   Entreprise ARASHI v4.0 - Module Espace Vendeur
   Fichier : js/vendor.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Charge les offres et statistiques de l'utilisateur vendeur connecté
 */
export async function loadVendorData() {
    const tbody = document.getElementById("vendorInventoryTable");
    const countEl = document.getElementById("vendorItemsCount");
    const earningsEl = document.getElementById("vendorTotalEarnings");
    
    // Récupération de l'utilisateur Pi connecté
    const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

    if (!user || (!user.uid && !user.username)) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Veuillez vous connecter avec votre compte Pi Network pour gérer vos offres.
                    </td>
                </tr>
            `;
        }
        return;
    }

    const vendorIdentifier = user.username || user.uid;

    try {
        const { data: items, error } = await supabase
            .from("properties")
            .select("*")
            .eq("username", vendorIdentifier)
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (tbody) {
            tbody.innerHTML = "";
            if (!items || items.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                            Vous n'avez encore publié aucun article ou prestation.
                        </td>
                    </tr>
                `;
            } else {
                let totalValue = 0;

                items.forEach(item => {
                    const price = parseFloat(item.price_pi || item.price || 0);
                    totalValue += price;

                    const row = document.createElement("tr");
                    row.style.borderBottom = "1px solid var(--border)";
                    row.innerHTML = `
                        <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">${item.id.toString().substring(0, 8)}...</td>
                        <td style="padding: 12px 10px; font-weight: bold;">${item.title}</td>
                        <td style="padding: 12px 10px; color: #f39c12; font-weight: bold;">${price.toFixed(2)} π</td>
                        <td style="padding: 12px 10px; color: var(--text-muted);">${item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                        <td style="padding: 12px 10px; text-align: right;">
                            <button class="btn btn-danger delete-vendor-item-btn" data-id="${item.id}" style="padding: 5px 10px; font-size: 0.8rem;">
                                <i class="fa-solid fa-trash"></i> Retirer
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                if (earningsEl) earningsEl.textContent = `${totalValue.toFixed(2)} π`;
            }
        }

        if (countEl) countEl.textContent = items ? items.length : 0;

        // Événement pour la suppression des articles
        document.querySelectorAll(".delete-vendor-item-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                deleteVendorItem(id);
            });
        });

    } catch (err) {
        console.error("Erreur lors de la récupération du catalogue vendeur :", err);
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

            alert("L'article a été retiré avec succès.");
            loadVendorData();
        } catch (err) {
            console.error("Erreur de suppression :", err);
            alert("Erreur lors de la suppression : " + err.message);
        }
    }
}

/**
 * Gère l'envoi du formulaire de publication
 */
function initVendorPublishForm() {
    const form = document.getElementById("vendorPublishForm");
    const btnRefresh = document.getElementById("btnRefreshVendor");

    if (btnRefresh) {
        btnRefresh.addEventListener("click", loadVendorData);
    }

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

        if (!user || (!user.uid && !user.username)) {
            alert("Veuillez d'abord vous connecter avec votre compte Pi Network.");
            return;
        }

        const title = document.getElementById("vendorItemTitle")?.value;
        const price = parseFloat(document.getElementById("vendorItemPrice")?.value) || 0;
        const image = document.getElementById("vendorItemImage")?.value;
        const description = document.getElementById("vendorItemDescription")?.value;

        try {
            const { error } = await supabase
                .from("properties")
                .insert([{
                    title: title,
                    price_pi: price,
                    image_url: image || "https://via.placeholder.com/300x200?text=Produit+Vendeur",
                    description: description,
                    username: user.username || user.uid,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert("🎉 Article mis en ligne avec succès sur la Marketplace !");
            form.reset();
            loadVendorData();
        } catch (err) {
            console.error("Erreur lors de la publication :", err);
            alert("Erreur de publication : " + err.message);
        }
    });
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    initVendorPublishForm();
    loadVendorData();
});