// =====================================
// Entreprise ARASHI v3.0
// js/marketplace.js - Catalogue & Achats
// =====================================

import { createPiPayment } from './pi-payments.js';
import { setLanguage } from './lang.js';

// Configuration Supabase
const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

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
            // 1. Récupération brute du chemin
            let rawPath = (item.image_jpg || item.image_url || '').trim();
            let imageSrc = '';

            // 2. Traitement rigoureux des majuscules et espaces dans l'URL Supabase
            if (rawPath) {
                if (rawPath.toLowerCase().startsWith('http://') || rawPath.toLowerCase().startsWith('https://')) {
                    // Forcer 'https://' en minuscules si l'utilisateur a écrit 'Https://'
                    imageSrc = rawPath.replace(/^https?:\/\//i, 'https://');
                } else if (rawPath.startsWith('data:')) {
                    imageSrc = rawPath;
                } else {
                    imageSrc = rawPath.startsWith('../') ? rawPath : `../${rawPath.replace(/^\//, '')}`;
                }
            } else {
                imageSrc = 'https://via.placeholder.com/300x200?text=Image+Indisponible';
            }

            const price = item.price_pi || item.price || 0;
            const title = item.title || 'Produit ARASHI';
            const description = item.description || 'Projet certifié par ARASHI.';

            const card = document.createElement("div");
            card.className = "property-card service-card";
            card.style.marginBottom = "20px";
            card.innerHTML = `
                <img src="${imageSrc}" 
                     alt="${title}" 
                     class="property-img product-image"
                     style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Erreur+Chargement+Image';">
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
