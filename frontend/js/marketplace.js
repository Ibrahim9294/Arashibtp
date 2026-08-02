/* ==========================================
   ARASHI Enterprise v4.0 - Dynamic Marketplace
   Fichier : js/marketplace.js
========================================== */

import { supabase, STORAGE_BUCKET } from './supabase.js';
import { PiPaymentManager } from './pi-payments.js';

/**
 * Charger et afficher les produits dynamiquement depuis Supabase
 * @param {string} categoryFilter - Filtre optionnel par catégorie
 * @param {string} searchQuery - Recherche optionnelle par texte
 */
export async function loadMarketplaceProducts(categoryFilter = null, searchQuery = '') {
    const container = document.getElementById('marketplaceContainer');
    if (!container) return;

    try {
        let query = supabase.from('products').select('*');

        // Filtrage par catégorie
        if (categoryFilter && categoryFilter !== 'all') {
            query = query.eq('category', categoryFilter);
        }

        // Filtrage par mot-clé de recherche
        if (searchQuery.trim() !== '') {
            query = query.ilike('name', `%${searchQuery.trim()}%`);
        }

        const { data: products, error } = await query;

        if (error) {
            console.error("❌ Erreur lors du chargement des produits :", error.message);
            container.innerHTML = `
                <div class="product-card-placeholder">
                    <p style="color: var(--danger);">Impossible de charger les produits. Veuillez vérifier votre connexion.</p>
                </div>
            `;
            return;
        }

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="product-card-placeholder">
                    <p>Aucun article disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        // Génération dynamique des cartes de produits
        container.innerHTML = products.map(product => {
            // Construction de l'URL publique de l'image Supabase Storage
            let imageUrl = product.image_url;
            if (!imageUrl && product.image_path) {
                const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(product.image_path);
                imageUrl = data.publicUrl;
            }
            if (!imageUrl) imageUrl = 'assets/placeholder.jpg';

            return `
                <div class="product-card">
                    <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='assets/placeholder.jpg'">
                    <h3>${product.name}</h3>
                    <p>${product.description || 'Équipement & Service qualifié ARASHI'}</p>
                    <strong>${product.price_pi} π</strong>
                    <button class="btn btn-warning hero-btn" onclick="buyMarketplaceItem('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price_pi})">
                        <i class="fa-solid fa-cart-shopping"></i> Acheter avec Pi
                    </button>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("❌ Erreur inattendue :", err);
    }
}

/**
 * Déclenche le processus d'achat Pi Network pour un produit Supabase
 */
window.buyMarketplaceItem = async function(productId, productName, pricePi) {
    if (typeof window.createPiPayment === "function") {
        await window.createPiPayment(Number(pricePi), productName, productId);
    } else {
        await PiPaymentManager.createPayment({
            amount: Number(pricePi),
            memo: `Achat ARASHI: ${productName}`,
            metadata: { productId, productName }
        });
    }
};

// ==========================================
// ÉCOUTEURS D'ÉVÉNEMENTS & INITIALISATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Premier chargement
    loadMarketplaceProducts();

    // Écouteur sur la barre de recherche globale
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        let searchTimeout;
        globalSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadMarketplaceProducts(null, e.target.value);
            }, 300);
        });
    }
});