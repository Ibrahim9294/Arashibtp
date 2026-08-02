/* ==========================================
   Entreprise ARASHI v4.0 - Module Marketplace
   Fichier : js/marketplace.js
========================================== */

import { supabase } from './supabase.js';
import { createPiPayment } from './pi-payments.js';

let allProducts = [];

/**
 * Charge les offres depuis Supabase (table 'properties' ou 'products')
 */
export async function loadMarketplaceProducts() {
    const grid = document.getElementById("fullProductsGrid");
    if (!grid) return;

    try {
        const { data: products, error } = await supabase
            .from("properties")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        allProducts = products || [];
        renderProducts(allProducts);

    } catch (err) {
        console.error("Erreur de chargement de la marketplace :", err);
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px 0;">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: #e74c3c; margin-bottom: 10px;"></i>
                <p>Impossible de charger les articles de la Marketplace pour le moment.</p>
            </div>
        `;
    }
}

/**
 * Affiche la liste des produits dans la grille
 */
function renderProducts(items) {
    const grid = document.getElementById("fullProductsGrid");
    if (!grid) return;

    grid.innerHTML = "";

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px 0;">
                <p>Aucun article disponible sur le marché actuellement.</p>
            </div>
        `;
        return;
    }

    items.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.cssText = "background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; justify-content: space-between;";

        const price = parseFloat(product.price_pi || product.price || 0).toFixed(2);
        const imageUrl = product.image_url || "https://via.placeholder.com/300x200?text=ARASHI+Marketplace";
        const title = product.title || "Article sans titre";
        const description = product.description ? (product.description.substring(0, 90) + "...") : "Aucune description fournie.";

        card.innerHTML = `
            <div>
                <img src="${imageUrl}" alt="${title}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;" onerror="this.src='https://via.placeholder.com/300x200?text=Produit'">
                <h3 style="font-size: 1.05rem; margin-bottom: 8px;">${title}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">${description}</p>
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: bold; color: #f39c12; font-size: 1.2rem;">${price} π</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-user"></i> ${product.username || 'ARASHI'}</span>
                </div>
                <button class="btn btn-warning buy-product-btn" data-title="${title}" data-price="${price}" data-id="${product.id}" style="width: 100%; padding: 10px; font-weight: bold; border-radius: 6px; cursor: pointer;">
                    ⚡ Acher en Pi
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Attachement des gestionnaires d'événements d'achat
    document.querySelectorAll(".buy-product-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const itemTitle = e.currentTarget.getAttribute("data-title");
            const itemPrice = e.currentTarget.getAttribute("data-price");
            const itemId = e.currentTarget.getAttribute("data-id");

            createPiPayment(itemPrice, `Achat Marketplace: ${itemTitle}`, { productId: itemId });
        });
    });
}

/**
 * Filtre dynamiquement les produits selon la saisie de recherche
 */
function initSearch() {
    const searchInput = document.getElementById("globalSearch");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allProducts.filter(item => {
            const titleMatch = item.title ? item.title.toLowerCase().includes(query) : false;
            const descMatch = item.description ? item.description.toLowerCase().includes(query) : false;
            return titleMatch || descMatch;
        });
        renderProducts(filtered);
    });
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadMarketplaceProducts();
    initSearch();
});