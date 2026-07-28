// =====================================
// Entreprise ARASHI v3.0
// js/marketplace.js - Catalogue & Achats
// =====================================

import { createPiPayment } from './pi-payments.js';

// URL Supabase (déjà configurée)
const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

// Fonction d'affichage des biens
export async function loadMarketplaceItems() {
    const container = document.getElementById("marketplaceContainer");
    if (!container) return;

    try {
        // Chargement depuis l'API REST de Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=*`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error("Erreur de récupération des données Supabase.");
        }

        const items = await response.json();
        
        // Nettoyage du conteneur
        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#666;">Aucun bien disponible pour le moment.</p>`;
            return;
        }

        // Génération des cartes de biens
        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "property-card";
            card.innerHTML = `
                <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=ARASHI+BTP'}" alt="${item.title}" class="property-img">
                <div class="property-info">
                    <h3>${item.title}</h3>
                    <p class="description">${item.description || 'Projet immobilier certifié par ARASHI.'}</p>
                    <p class="price"><strong>${item.price_pi} π</strong></p>
                    <button class="btn-buy-pi" data-id="${item.id}" data-price="${item.price_pi}" data-title="${item.title}">
                        ⚡ Acheter avec Pi
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Attachement des événements de paiement sur les nouveaux boutons
        attachPaymentEvents();

    } catch (error) {
        console.error("Erreur Marketplace :", error);
        // Affichage de secours en cas de problème Supabase
        container.innerHTML = `<p style="text-align:center; color:#e74c3c;">Impossible de charger les annonces pour le moment.</p>`;
    }
}

// Attachement des clics sur les boutons "Acheter avec Pi"
function attachPaymentEvents() {
    const buyButtons = document.querySelectorAll(".btn-buy-pi");
    buyButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = e.target.getAttribute("data-id");
            const price = e.target.getAttribute("data-price");
            const title = e.target.getAttribute("data-title");

            console.log(`Lancement du paiement Pi pour : ${title} (${price} Pi)`);
            createPiPayment(price, `Achat ARASHI: ${title}`, productId);
        });
    });
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadMarketplaceItems();
});

import { setLanguage } from './lang.js';

// Référence vers l'élément container du DOM
const container = document.getElementById('marketplaceContainer');

/**
 * Affiche la liste des produits dans le Marketplace
 * @param {Array} products - Liste des produits récupérés depuis Supabase
 */
export function renderProducts(products) {
    if (!container) return;

    // Si aucun produit n'est disponible
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="product-card-placeholder">
                <p data-lang="no_products">Aucun produit disponible pour le moment.</p>
            </div>
        `;
        // Re-traduire le message "Aucun produit"
        const currentLang = localStorage.getItem("arashi_lang") || "fr";
        setLanguage(currentLang);
        return;
    }

    // Génération du HTML pour chaque produit
    let html = '';
    products.forEach(product => {
        const imageSrc = product.image_url || 'assets/placeholder.jpg';
        const price = product.price || 0;
        const title = product.title || 'Produit sans nom';
        const description = product.description || '';

        html += `
            <div class="service-card" data-id="${product.id}">
                <img src="${imageSrc}" class="product-image" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500';">
                <h3>${title}</h3>
                <p>${description}</p>
                <h2>${price} π</h2>
                <button class="hero-btn" onclick="buy('${title.replace(/'/g, "\\'")}', ${price})" data-lang="buy_btn">
                    Acheter avec Pi
                </button>
            </div>
        `;
    });

    // Injection dans le DOM
    container.innerHTML = html;

    // 📍 ÉTAPE CLÉ : Réappliquer la langue actuelle sur les nouveaux éléments injectés
    const currentLang = localStorage.getItem("arashi_lang") || "fr";
    setLanguage(currentLang);
}

/**
 * Exemple de fonction pour charger les produits depuis l'API / Supabase
 */
export async function loadMarketplaceProducts() {
    try {
        // Remplacez cette URL par votre endpoint API ou votre requête Supabase client
        const response = await fetch('/api/pi/products'); 
        if (!response.ok) throw new Error('Erreur de chargement');
        
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
    }
}

// Initialisation au chargement du module
document.addEventListener('DOMContentLoaded', () => {
    loadMarketplaceProducts();
});
