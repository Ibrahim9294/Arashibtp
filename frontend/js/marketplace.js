// =====================================================
// Entreprise ARASHI v3.0
// js/marketplace.js - Catalogue Multi-pages & Supabase
// =====================================================

import { createPiPayment } from './app.js';
import { setLanguage } from './lang.js';

const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

/**
 * Normalise les URLs d'images Supabase, assets locaux ou placeholders
 */
function getValidImageUrl(rawPath) {
    if (!rawPath) return 'https://via.placeholder.com/400x200?text=Image+ARASHI';
    
    let url = rawPath.trim();
    
    if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')) {
        return url.replace(/^https?:\/\//i, 'https://');
    }
    
    if (url.startsWith('assets/') || url.startsWith('images/')) {
        return '/' + url;
    }
    
    return url;
}

/**
 * Charge dynamiquement les annonces depuis Supabase
 */
export async function loadMarketplaceItems() {
    // 📍 Support de tous les conteneurs d'affichage sur vos différentes pages
    const container = document.getElementById("marketplaceContainer") || 
                      document.getElementById("fullProductsGrid") || 
                      document.getElementById("popularProductsGrid") ||
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

        if (!response.ok) throw new Error("Erreur de réponse Supabase API.");

        const items = await response.json();
        container.innerHTML = "";

        if (!items || items.length === 0) {
            container.innerHTML = `<p style="text-align:center; color: var(--text-muted); grid-column: 1/-1;" data-lang="no_products">Aucun bien disponible pour le moment.</p>`;
            applyCurrentLanguage();
            return;
        }

        items.forEach(item => {
            const rawPath = item.image_url || item.image_jpg || item.photo || '';
            const imageSrc = getValidImageUrl(rawPath);

            const price = item.price_pi || item.price || 0;
            const title = item.title || 'Prestation ARASHI';
            const description = item.description || 'Certifié par l\'Entreprise ARASHI.';
            const category = item.category || item.type || 'OFFRE';

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="image-container">
                    <img src="${imageSrc}" 
                         alt="${title}" 
                         loading="lazy"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/400x200?text=ARASHI+v3.0';">
                    <button class="fav-btn">❤️</button>
                    <span class="tag-badge">${category}</span>
                </div>
                <div class="product-details">
                    <div class="price-tag">${price} π</div>
                    <h3>${title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">${description}</p>
                    
                    <div class="badges-row">
                        <span class="badge-item">✨ Certifié ARASHI</span>
                        <span class="badge-item">🛡️ Escrow Pi</span>
                    </div>

                    <button class="btn-buy-pi" 
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
        console.error("Erreur de chargement Marketplace :", error);
        container.innerHTML = `<p style="text-align:center; color:#ef4444; grid-column: 1/-1;">Impossible de charger les annonces pour le moment.</p>`;
    }
}

/**
 * Applique la langue sauvegardée dans le LocalStorage
 */
function applyCurrentLanguage() {
    const currentLang = localStorage.getItem("arashi_lang") || "fr";
    setLanguage(currentLang);
}

/**
 * Attache l'événement de paiement Pi aux boutons dynamiques
 */
function attachPaymentEvents() {
    const buyButtons = document.querySelectorAll(".btn-buy-pi");
    buyButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const productId = btn.getAttribute("data-id");
            const price = btn.getAttribute("data-price");
            const title = btn.getAttribute("data-title");

            if (typeof window.createPiPayment === "function") {
                window.createPiPayment(Number(price), `Achat ARASHI: ${title}`, productId);
            } else if (typeof createPiPayment === "function") {
                createPiPayment(Number(price), `Achat ARASHI: ${title}`, productId);
            } else {
                alert("Système de paiement Pi Network en cours de chargement...");
            }
        });
    });
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadMarketplaceItems();
});
