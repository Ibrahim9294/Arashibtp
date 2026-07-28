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
