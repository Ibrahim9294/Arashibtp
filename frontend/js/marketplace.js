// =====================================
// Entreprise ARASHI v3.0
// js/marketplace.js - Catalogue & Achats
// =====================================

import { createPiPayment } from './pi-payments.js';
import { setLanguage } from './lang.js';

const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

/**
 * Fonction universelle de traitement des URLs d'images (v2 + v3.0 Supabase)
 */
function getValidImageUrl(rawPath) {
    if (!rawPath) return 'https://via.placeholder.com/300x200?text=Image+ARASHI';

    let url = rawPath.trim();

    // 1. Si c'est une URL Web complète (Supabase, ImgBB, etc.)
    if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')) {
        // Corriger 'Https://' en 'https://'
        return url.replace(/^https?:\/\//i, 'https://');
    }

    // 2. Si c'est une image locale de la v2 (ex: assets/villas/photo.jpg)
    // On ajoute '/' au début pour repartir de la racine absolue du site
    if (url.startsWith('assets/') || url.startsWith('images/')) {
        return '/' + url;
    }

    return url;
}

export async function loadMarketplaceItems() {
    const container = document.getElementById("marketplaceContainer");
    if (!container) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=*`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) throw new Error("Erreur de récupération des données Supabase.");

        const items = await response.json();
        container.innerHTML = "";

        if (!items || items.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#666;" data-lang="no_products">Aucun bien disponible pour le moment.</p>`;
            applyCurrentLanguage();
            return;
        }

        items.forEach(item => {
            // Lecture flexible des colonnes d'images
            const rawPath = item.image_url || item.image_jpg || item.photo || '';
            const imageSrc = getValidImageUrl(rawPath);

            const price = item.price_pi || item.price || 0;
            const title = item.title || 'Service ARASHI';
            const description = item.description || 'Prestation certifiée par Entreprise ARASHI.';

            const card = document.createElement("div");
            card.className = "property-card service-card";
            card.style.marginBottom = "20px";
            card.innerHTML = `
                <img src="${imageSrc}" 
                     alt="${title}" 
                     class="property-img product-image"
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; display: block;"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Erreur+Image';">
                <div class="property-info" style="padding: 15px 0;">
                    <h3>${title}</h3>
                    <p class="description">${description}</p>
                    <p class="price"><strong>${price} π</strong></p>
                    <button class="btn-buy-pi hero-btn" 
                            data-id="${item.id}" 
                            data-price="${price}" 
                            data-title="${title}"
                            data-lang="buy_btn">
                        ⚡ Acheter avec Pi
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        attachPaymentEvents();
        applyCurrentLanguage();

    } catch (error) {
        console.error("Erreur Marketplace :", error);
        container.innerHTML = `<p style="text-align:center; color:#e74c3c;">Impossible de charger les annonces pour le moment.</p>`;
    }
}

function applyCurrentLanguage() {
    const currentLang = localStorage.getItem("arashi_lang") || "fr";
    setLanguage(currentLang);
}

function attachPaymentEvents() {
    const buyButtons = document.querySelectorAll(".btn-buy-pi");
    buyButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const productId = btn.getAttribute("data-id");
            const price = btn.getAttribute("data-price");
            const title = btn.getAttribute("data-title");

            createPiPayment(price, `Achat ARASHI: ${title}`, productId);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadMarketplaceItems();
});
