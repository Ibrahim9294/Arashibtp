import { supabase } from './supabase.js';

window.scrollToPopular = function() {
    const section = document.getElementById("popularSection");
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    loadStats();
    loadPopularProducts();
});

// Gérer l'ouverture du menu mobile
function initMenu() {
    const toggleBtn = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }
}

// Charger dynamiquement les compteurs depuis Supabase
async function loadStats() {
    if (!supabase) return;

    try {
        // 1. Nombre d'utilisateurs
        const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        // 2. Nombre de boutiques
        const { count: vendorsCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
        // 3. Nombre de produits / biens immo
        const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

        document.getElementById("totalUsers").innerText = usersCount || 1250; // Fallback démo
        document.getElementById("totalVendors").innerText = vendorsCount || 85;
        document.getElementById("totalProperties").innerText = productsCount || 34;
        document.getElementById("totalPayments").innerText = "14,850 π";

    } catch (err) {
        console.warn("Erreur de chargement des stats (Données démo affichées) :", err.message);
    }
}

// Charger dynamiquement les produits populaires
async function loadPopularProducts() {
    const grid = document.getElementById("popularProductsGrid");
    if (!grid) return;

    if (!supabase) {
        // Code secours hors ligne avec données d'illustrations de vos secteurs
        grid.innerHTML = getDemoProductsHtml();
        return;
    }

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(4);

        if (error) throw error;

        if (!products || products.length === 0) {
            grid.innerHTML = getDemoProductsHtml();
            return;
        }

        grid.innerHTML = "";
        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img class="product-image" src="${p.images[0] || 'https://via.placeholder.com/300x200'}" alt="${p.title}">
                <div class="product-info">
                    <h3>${p.title}</h3>
                    <p class="product-vendor">📍 ${p.country || 'International'}</p>
                    <div class="product-prices">
                        <span class="price-pi">${p.price_pi} π</span>
                        <span class="price-fcfa">${p.price_fcfa.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <button class="btn-buy" onclick="initiatePiPurchase('${p.id}', ${p.price_pi})">Acheter maintenant</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Erreur de récupération des produits :", err);
        grid.innerHTML = getDemoProductsHtml();
    }
}

function getDemoProductsHtml() {
    return `
        <div class="product-card">
            <img class="product-image" src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80" alt="Villa">
            <div class="product-info">
                <h3>🏡 Villa Bassam Premium</h3>
                <p class="product-vendor">📍 Côte d'Ivoire | ARASHI Immo</p>
                <div class="product-prices">
                    <span class="price-pi">45,000 π</span>
                    <span class="price-fcfa">45 000 000 FCFA</span>
                </div>
                <button class="btn-buy" onclick="alert('Veuillez vous connecter via le Pi Browser pour initier le paiement.')">Acheter</button>
            </div>
        </div>
        <div class="product-card">
            <img class="product-image" src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80" alt="Station GNSS">
            <div class="product-info">
                <h3>📐 Récepteur GNSS RTK v2</h3>
                <p class="product-vendor">📍 Sénégal | Topographie Pro</p>
                <div class="product-prices">
                    <span class="price-pi">1,200 π</span>
                    <span class="price-fcfa">1 200 000 FCFA</span>
                </div>
                <button class="btn-buy" onclick="alert('Veuillez vous connecter via le Pi Browser pour initier le paiement.')">Acheter</button>
            </div>
        </div>
    `;
}
