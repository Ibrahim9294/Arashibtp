/* ==========================================
   Entreprise ARASHI v4.0 & v3.0
   Fichier : js/marketplace.js - Catalogue Multi-pages
========================================== */

import { supabase, STORAGE_BUCKET } from './supabase.js';
import { createPiPayment } from './pi-payments.js';
import { changeLanguage } from './lang.js';

const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

/**
 * Normalise et sécurise l'URL d'une image de produit / bien immobilier
 * @param {string} rawPath - Chemin brut ou URL stockée en BDD
 * @returns {string} URL valide utilisable dans une balise <img>
 */
function getValidImageUrl(rawPath) {
    if (!rawPath) return 'https://via.placeholder.com/300x200?text=Image+ARASHI';

    let url = rawPath.trim();

    if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')) {
        return url.replace(/^https?:\/\//i, 'https://');
    }

    if (url.startsWith('assets/') || url.startsWith('images/')) {
        return '/' + url;
    }

    // Récupération depuis le Storage Supabase si c'est un nom de fichier simple
    if (supabase && STORAGE_BUCKET) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(url);
        if (data && data.publicUrl) return data.publicUrl;
    }

    return url;
}

/**
 * Charge dynamiquement les éléments depuis la table properties de Supabase
 * et s'adapte automatiquement à l'élément de grille présent sur la page courante.
 */
export async function loadMarketplaceItems() {
    // 📍 Prise en compte de tous les conteneurs cibles des différentes pages
    const container = document.getElementById("fullProductsGrid") || 
                      document.getElementById("marketplaceContainer") || 
                      document.getElementById("immobilierContainer") ||
                      document.getElementById("propertiesContainer");

    if (!container) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=*`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) throw new Error("Erreur de réponse API Supabase.");

        const items = await response.json();
        container.innerHTML = "";

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="product-card-placeholder">
                    <p style="text-align:center; color:#666;" data-lang="no_products">Aucun bien disponible pour le moment.</p>
                </div>
            `;
            applyCurrentLanguage();
            return;
        }

        items.forEach(item => {
            const rawPath = item.image_url || item.image_jpg || item.photo || item.image_path || '';
            const imageSrc = getValidImageUrl(rawPath);

            const price = item.price_pi || item.price || 0;
            const title = item.title || item.name || 'Prestation ARASHI';
            const description = item.description || 'Bien certifié par l\'Entreprise ARASHI.';

            const card = document.createElement("div");
            card.className = "property-card service-card product-card";
            card.style.marginBottom = "20px";
            card.innerHTML = `
                <img src="${imageSrc}" 
                     alt="${title}" 
                     class="property-img product-image"
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; display: block;"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Indisponible';">
                <div class="property-info" style="padding: 15px 0; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h3 style="margin-bottom: 8px;">${title}</h3>
                        <p class="description" style="font-size: 0.9rem; color: #64748b; margin-bottom: 12px;">${description}</p>
                    </div>
                    <div>
                        <p class="price" style="font-size: 1.1rem; margin-bottom: 10px;"><strong>${price} π</strong></p>
                        <button class="btn-buy-pi hero-btn btn btn-warning" 
                                style="width: 100%; border: none; cursor: pointer;"
                                data-id="${item.id}" 
                                data-price="${price}" 
                                data-title="${title.replace(/"/g, '&quot;')}"
                                data-lang="buy_btn">
                            ⚡ Acheter avec Pi
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        attachPaymentEvents();
        applyCurrentLanguage();

    } catch (error) {
        console.error("Erreur de chargement Marketplace :", error);
        container.innerHTML = `
            <div class="product-card-placeholder">
                <p style="text-align:center; color:#dc3545;">Impossible de charger les annonces pour le moment.</p>
            </div>
        `;
    }
}

/**
 * Applique la langue enregistrée dans le navigateur
 */
function applyCurrentLanguage() {
    const currentLang = localStorage.getItem("arashi_lang") || "fr";
    if (typeof changeLanguage === 'function') {
        changeLanguage(currentLang);
    }
}

/**
 * Attache la logique de paiement Pi aux boutons dynamiques
 */
function attachPaymentEvents() {
    const buyButtons = document.querySelectorAll(".btn-buy-pi");
    buyButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const productId = btn.getAttribute("data-id");
            const price = btn.getAttribute("data-price");
            const title = btn.getAttribute("data-title");

            createPiPayment(Number(price), `Achat ARASHI: ${title}`, productId);
        });
    });
}

// Initialisation automatique au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    loadMarketplaceItems();
});