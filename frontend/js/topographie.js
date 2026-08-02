/* ==========================================
   Entreprise ARASHI v4.0 - Module Topographie
   Fichier : js/topographie.js
========================================== */

import { supabase } from './supabase.js';
import { createPiPayment } from './pi-payments.js';

let topoCatalog = [];

/**
 * Initialise le catalogue et les fonctionnalités de topographie
 */
export async function loadTopoData() {
    const gridContainer = document.getElementById("fullProductsGrid");
    const searchInput = document.getElementById("globalSearch");

    try {
        // Récupération des services et équipements topographiques depuis Supabase
        const { data: topoItems, error } = await supabase
            .from("topography_items")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        topoCatalog = topoItems || [];
        renderTopoCatalog(topoCatalog, gridContainer);

        // Barre de recherche en temps réel
        if (searchInput) {
            searchInput.addEventListener("input", () => filterTopoItems(gridContainer));
        }

    } catch (err) {
        console.error("Erreur lors du chargement des données topographiques :", err);
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: #e74c3c; margin-bottom: 10px;"></i>
                    <p>Impossible de charger le catalogue topographique. Vérifiez la connexion à la base de données.</p>
                </div>
            `;
        }
    }
}

/**
 * Filtre les produits et services topographiques selon la recherche
 */
function filterTopoItems(container) {
    const searchVal = document.getElementById("globalSearch")?.value.toLowerCase().trim() || "";

    const filtered = topoCatalog.filter(item => {
        const titleMatch = (item.title || "").toLowerCase().includes(searchVal);
        const descMatch = (item.description || "").toLowerCase().includes(searchVal);
        const categoryMatch = (item.category || "").toLowerCase().includes(searchVal);
        return titleMatch || descMatch || categoryMatch;
    });

    renderTopoCatalog(filtered, container);
}

/**
 * Génère le rendu visuel sous forme de grille de cartes
 */
function renderTopoCatalog(items, container) {
    if (!container) return;
    container.innerHTML = "";

    if (items.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-compass-drafting fa-2x" style="margin-bottom: 10px;"></i>
                <p>Aucune prestation ou équipement ne correspond à votre recherche.</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.cssText = "display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: 0;";

        const imageUrl = item.image_url || 'https://via.placeholder.com/350x200?text=ARASHI+Topographie';

        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imageUrl}" alt="${item.title}" style="width: 100%; height: 180px; object-fit: cover;">
                <span class="badge badge-info" style="position: absolute; top: 10px; right: 10px;">
                    ${item.category || 'Service Topo'}
                </span>
            </div>
            <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">${item.title}</h3>
                    <p style="font-size: 0.85rem; color: var(--text); margin-bottom: 15px; line-height: 1.4;">
                        ${item.description ? item.description.substring(0, 95) + '...' : 'Prestation de levé et d\'expertise foncière.'}
                    </p>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);">
                        <span style="font-size: 1.2rem; font-weight: bold; color: #f39c12;">${item.price_pi} π</span>
                        <button class="btn btn-warning topo-order-btn" data-id="${item.id}" data-title="${item.title}" data-price="${item.price_pi}">
                            <i class="fa-solid fa-cart-shopping"></i> Commander
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Attachement des boutons de commande avec Pi Network
    document.querySelectorAll(".topo-order-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const title = e.currentTarget.getAttribute("data-title");
            const price = parseFloat(e.currentTarget.getAttribute("data-price"));
            const id = e.currentTarget.getAttribute("data-id");

            if (typeof createPiPayment === 'function') {
                createPiPayment(price, `Prestation Topo: ${title}`, { topo_item_id: id, type: 'topography' });
            } else if (typeof window.buy === 'function') {
                window.buy(title, price);
            } else {
                alert(`Commande pour "${title}" à ${price} π enregistrée.`);
            }
        });
    });
}

// Chargement automatique au lancement
document.addEventListener("DOMContentLoaded", () => {
    loadTopoData();
});