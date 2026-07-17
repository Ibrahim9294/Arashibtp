/* ==========================================
   ENTREPRISE ARASHI v3.0 - Logique Marketplace
========================================== */

import { supabase, STORAGE_BUCKET } from './supabase.js';

console.log("🛒 Module Marketplace ARASHI v3.0 Initialisé");

document.addEventListener("DOMContentLoaded", () => {
    // Charger automatiquement les opportunités vedettes sur la page d'accueil
    loadPopularProducts();
});

/**
 * Récupère et affiche les produits populaires depuis Supabase
 */
async function loadPopularProducts() {
    const gridContainer = document.getElementById("popularProductsGrid");
    if (!gridContainer) return; // Sécurité si le script est chargé sur une page sans cette grille

    try {
        console.log("📦 Chargement des produits depuis la base de données...");

        // Requête Supabase : On récupère les 8 derniers articles actifs
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8);

        if (error) throw error;

        // Si la table est vide ou s'il y a une erreur
        if (!products || products.length === 0) {
            gridContainer.innerHTML = `
                <div class="product-card-placeholder">
                    <p>🛍️ Aucune opportunité n'est disponible pour le moment. Soyez le premier à publier !</p>
                </div>`;
            return;
        }

        // On nettoie le conteneur avant injection
        gridContainer.innerHTML = "";

        // Génération du HTML pour chaque produit
        products.forEach(product => {
            // Construction de l'URL publique de l'image (via le bucket Supabase que tu possèdes)
            let imageUrl = "assets/images/placeholder.jpg"; // Image par défaut si vide
            if (product.image_url) {
                // Si l'URL stockée est juste un nom de fichier, on génère l'adresse publique du bucket
                if (!product.image_url.startsWith('http')) {
                    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(product.image_url);
                    imageUrl = data.publicUrl;
                } else {
                    imageUrl = product.image_url;
                }
            }

            const productCard = document.createElement("div");
            productCard.className = "service-card"; // Réutilisation des cartes design du style.css
            productCard.style.borderTop = "4px solid #F4B400"; // Couleur Or Pi pour la distinguer
            
            // Gestion de l'affichage du prix en Pi ou FCFA
            const priceDisplay = product.price_pi 
                ? `🪙 <strong>${product.price_pi} π</strong>` 
                : `💵 <strong>${product.price_fcfa || product.price} FCFA</strong>`;

            productCard.innerHTML = `
                <div class="product-img-container" style="text-align:center; margin-bottom:15px;">
                    <img src="${imageUrl}" alt="${product.title}" style="max-width:100%; height:140px; object-fit:cover; border-radius:8px;">
                </div>
                <h3>${product.title || product.name}</h3>
                <p>${shortenText(product.description, 80)}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                    <span class="product-price" style="font-size: 16px; color:#0B3D91;">${priceDisplay}</span>
                    <button onclick="triggerPurchase('${product.id}', ${product.price_pi || 0}, '${product.title || product.name}')" 
                            style="background:#0B3D91; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px;">
                        Acheter
                    </button>
                </div>
            `;

            gridContainer.appendChild(productCard);
        });

    } catch (err) {
        console.error("❌ Erreur lors du chargement de la marketplace :", err);
        gridContainer.innerHTML = `
            <div class="product-card-placeholder" style="border-color: #ff4d4d; color: #ff4d4d;">
                <p>⚠️ Erreur de connexion avec la base de données lors du chargement des produits.</p>
            </div>`;
    }
}

/**
 * Fonction déclenchée lors du clic sur "Acheter"
 * Fait le lien direct avec le module pi-payments.js
 */
window.triggerPurchase = function(id, pricePi, title) {
    if (pricePi <= 0) {
        alert("Ce produit est disponible via paiement physique (FCFA). Veuillez contacter le vendeur.");
        return;
    }
    
    if (window.createPiPayment) {
        window.createPiPayment(pricePi, `Achat : ${title}`, id);
    } else {
        alert("Le module de paiement Pi n'est pas encore prêt. Veuillez réessayer.");
    }
};

/**
 * Raccourcit les descriptions trop longues pour garder l'alignement des boîtes
 */
function shortenText(text, maxLength) {
    if (!text) return "Aucune description fournie.";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
          }
        
