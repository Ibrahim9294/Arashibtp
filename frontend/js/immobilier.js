/* ==========================================
   Entreprise ARASHI v4.0 - Module Immobilier
   Fichier : js/immobilier.js
========================================== */

import { supabase } from './supabase.js';
import { createPiPayment } from './pi-payments.js';

let allProperties = [];

/**
 * Initialise la page Immobilière et charge les données depuis Supabase
 */
export async function loadImmobilierData() {
    const gridContainer = document.getElementById("propertiesGrid");
    const searchInput = document.getElementById("globalSearch");
    const typeFilter = document.getElementById("propertyTypeFilter");

    try {
        // Récupération des biens immobiliers depuis la table Supabase 'properties'
        const { data: properties, error } = await supabase
            .from("properties")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        allProperties = properties || [];
        
        // Mise à jour du tableau de bord et affichage de la grille
        updateStats(allProperties);
        renderProperties(allProperties, gridContainer);

        // Écouteurs d'événements pour la recherche et le filtre
        if (searchInput) {
            searchInput.addEventListener("input", filterAndRender);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", filterAndRender);
        }

    } catch (err) {
        console.error("Erreur lors du chargement des biens immobiliers :", err);
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: #e74c3c; margin-bottom: 10px;"></i>
                    <p>Impossible de charger le catalogue immobilier. Veuillez vérifier votre connexion Supabase.</p>
                </div>
            `;
        }
    }
}

/**
 * Filtre la liste des biens en fonction de la barre de recherche et du sélecteur
 */
function filterAndRender() {
    const gridContainer = document.getElementById("propertiesGrid");
    const searchVal = document.getElementById("globalSearch")?.value.toLowerCase().trim() || "";
    const filterVal = document.getElementById("propertyTypeFilter")?.value || "all";

    const filtered = allProperties.filter(property => {
        const titleMatch = (property.title || "").toLowerCase().includes(searchVal);
        const descMatch = (property.description || "").toLowerCase().includes(searchVal);
        const locationMatch = (property.location || "").toLowerCase().includes(searchVal);
        const matchesSearch = titleMatch || descMatch || locationMatch;

        const matchesType = (filterVal === "all") || 
                            (property.type && property.type.toLowerCase() === filterVal.toLowerCase());

        return matchesSearch && matchesType;
    });

    renderProperties(filtered, gridContainer);
}

/**
 * Recalcule et affiche les statistiques globales de la page
 */
function updateStats(properties) {
    const totalEl = document.getElementById("statTotalProperties");
    const availEl = document.getElementById("statAvailableProperties");
    const valuationEl = document.getElementById("statTotalValuation");

    const totalCount = properties.length;
    const availableCount = properties.filter(p => p.status === "disponible" || !p.status).length;
    const totalValuation = properties.reduce((sum, p) => sum + (parseFloat(p.price_pi) || 0), 0);

    if (totalEl) totalEl.textContent = totalCount;
    if (availEl) availEl.textContent = availableCount;
    if (valuationEl) valuationEl.textContent = `${totalValuation.toLocaleString()} π`;
}

/**
 * Génère le HTML pour l'affichage sous forme de cartes
 */
function renderProperties(properties, container) {
    if (!container) return;
    container.innerHTML = "";

    if (properties.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-building-circle-xmark fa-2x" style="margin-bottom: 10px;"></i>
                <p>Aucun bien immobilier ne correspond à votre recherche.</p>
            </div>
        `;
        return;
    }

    properties.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.cssText = "display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: 0;";

        const imageUrl = item.image_url || 'https://via.placeholder.com/350x200?text=ARASHI+Immobilier';
        const isAvailable = (item.status === 'disponible' || !item.status);

        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imageUrl}" alt="${item.title}" style="width: 100%; height: 180px; object-fit: cover;">
                <span class="badge ${isAvailable ? 'badge-success' : 'badge-warning'}" style="position: absolute; top: 10px; right: 10px;">
                    ${item.type || 'Vente'}
                </span>
            </div>
            <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">${item.title}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-location-dot" style="color: #e74c3c;"></i> ${item.location || 'Niamey, Niger'}
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text); margin-bottom: 15px; line-height: 1.4;">
                        ${item.description ? item.description.substring(0, 90) + '...' : 'Aucune description fournie.'}
                    </p>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);">
                        <span style="font-size: 1.2rem; font-weight: bold; color: #f39c12;">${item.price_pi} π</span>
                        <button class="btn btn-warning property-buy-btn" data-id="${item.id}" data-title="${item.title}" data-price="${item.price_pi}">
                            <i class="fa-solid fa-wallet"></i> Acheter / Réserver
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Attachement des gestionnaires de clic pour le paiement Pi
    document.querySelectorAll(".property-buy-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const title = e.currentTarget.getAttribute("data-title");
            const price = parseFloat(e.currentTarget.getAttribute("data-price"));
            const id = e.currentTarget.getAttribute("data-id");

            if (typeof createPiPayment === 'function') {
                createPiPayment(price, `Acquisition Immobilière: ${title}`, { property_id: id, action: 'purchase' });
            } else if (typeof window.buy === 'function') {
                window.buy(title, price);
            } else {
                alert(`Initialisation de l'achat pour : ${title} (${price} π)`);
            }
        });
    });
}

// Initialisation au chargement de la page DOM
document.addEventListener("DOMContentLoaded", () => {
    loadImmobilierData();
});