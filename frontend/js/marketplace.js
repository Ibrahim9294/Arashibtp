// =====================================
// Entreprise ARASHI v3.0
// js/marketplace.js - Catalogue & Achats
// =====================================

import { createPiPayment } from './pi-payments.js';
import { setLanguage } from './lang.js';

const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

/**
 * Reconstruit l'URL complète Supabase Storage si nécessaire
 */
function resolveImageUrl(rawPath) {
    if (!rawPath) return 'https://via.placeholder.com/300x200?text=Pas+d+image';

    let path = rawPath.trim();

    // Si c'est déjà une URL HTTP/HTTPS complète
    if (path.toLowerCase().startsWith('http://') || path.toLowerCase().startsWith('https://')) {
        return path.replace(/^https?:\/\//i, 'https://');
    }

    // Si c'est une image encodée en base64
    if (path.startsWith('data:')) return path;

    // Si c'est un nom de fichier simple ou un chemin relatif dans le bucket products
    const cleanPath = path.replace(/^\//, '');
    return `${SUPABASE_URL}/storage/v1/object/public/products/${cleanPath}`;
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
            // Extraction de l'image quelle que soit la colonne utilisée
            const rawPath = item.image_jpg || item.image_url || item.photo || '';
            const imageSrc = resolveImageUrl(rawPath);

            const price = item.price_pi || item.price || 0;
            const title = item.title || 'Produit ARASHI';
            const description = item.description || 'Projet certifié par ARASHI.';

            const card = document.createElement("div");
            card.className = "property-card service-card";
            card.style.marginBottom = "20px";
            card.innerHTML = `
                <img src="${encodeURI(imageSrc)}" 
                     alt="${title}" 
                     class="property-img product-image"
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; display: block;"
                     loading="lazy">
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
