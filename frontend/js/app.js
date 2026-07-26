// =====================================
// Entreprise ARASHI v3.0
// js/app.js - Application Principal & Modules
// =====================================

// 1. IMPORTS (Obligatoirement tout en haut du fichier)
import { loginWithPi } from "./pi-payments.js";
import { supabase } from "./supabase.js";

// 2. INITIALISATION ET ÉCOUTEURS DOM
document.addEventListener("DOMContentLoaded", () => {
    
    // Initialisation du bouton de connexion Pi Network
    const piLoginBtn = document.getElementById("piLogin");
    if (piLoginBtn) {
        piLoginBtn.addEventListener("click", loginWithPi);
    }

    // Gestion de la déconnexion
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // Menu Mobile Sidebar Toggle
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }

    // Restauration de la session utilisateur Pi existante
    checkExistingSession();

    // Chargement dynamique des données (Marketplace & Stats)
    loadPlatformStats();
    loadPopularProducts();
});

// 3. VÉRIFICATION DE SESSION LOCALSTORAGE
function checkExistingSession() {
    const savedUser = localStorage.getItem("pi_user");
    const userStatusEl = document.getElementById("userStatus");

    if (savedUser && userStatusEl) {
        try {
            const user = JSON.parse(savedUser);
            if (user && user.username) {
                userStatusEl.innerText = `@${user.username}`;
            }
        } catch (e) {
            console.error("Erreur de lecture du pi_user :", e);
        }
    }
}

// 4. DECONNEXION UTILISATEUR
function handleLogout() {
    localStorage.removeItem("pi_user");
    const userStatusEl = document.getElementById("userStatus");
    if (userStatusEl) {
        userStatusEl.innerText = "";
    }
    alert("Vous avez été déconnecté.");
}

// 5. CHARGEMENT DYNAMIQUE DES STATISTIQUES (Supabase)
async function loadPlatformStats() {
    try {
        const totalUsersEl = document.getElementById("totalUsers");
        const totalVendorsEl = document.getElementById("totalVendors");
        const totalPropertiesEl = document.getElementById("totalProperties");
        const totalPaymentsEl = document.getElementById("totalPayments");

        if (totalUsersEl) {
            const { count } = await supabase.from("users").select("*", { count: "exact", head: true });
            if (count !== null) totalUsersEl.innerText = count;
        }

        if (totalPropertiesEl) {
            const { count } = await supabase.from("properties").select("*", { count: "exact", head: true });
            if (count !== null) totalPropertiesEl.innerText = count;
        }
    } catch (err) {
        console.warn("Mise à jour des statistiques ignorée ou indisponible :", err);
    }
}

// 6. CHARGEMENT DES OPPORTUNITÉS DE LA MARKETPLACE
async function loadPopularProducts() {
    const grid = document.getElementById("popularProductsGrid");
    if (!grid) return;

    try {
        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .limit(6);

        if (error || !products || products.length === 0) {
            // Affichage des opportunités statiques par défaut si la base est vide
            renderDefaultProducts(grid);
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image_url || 'assets/default.jpg'}" alt="${product.title}" style="width:100%; border-radius:8px;">
                <h3>${product.title}</h3>
                <p>${product.description || ''}</p>
                <strong>${product.price} π</strong>
                <button class="btn btn-primary" onclick="createPiPayment(${product.price}, '${product.title}', '${product.id}')">
                    Acheter avec Pi
                </button>
            </div>
        `).join("");

    } catch (err) {
        console.warn("Affichage des produits par défaut :", err);
        renderDefaultProducts(grid);
    }
}

// 7. PRODUITS D'EXEMPLE PAR DÉFAUT (FALLBACK)
function renderDefaultProducts(container) {
    container.innerHTML = `
        <div class="product-card">
            <img src="assets/villas/villa-moderne.jpg" alt="Villa Moderne" style="width:100%; border-radius:8px;">
            <h3>Villa Moderne Niamey</h3>
            <p>5 chambres • Piscine • Jardin</p>
            <strong>2 π</strong>
            <button class="btn btn-primary" onclick="createPiPayment(2, 'Achat Villa Moderne Niamey', 'villa_001')">
                Acheter avec Pi
            </button>
        </div>

        <div class="product-card">
            <img src="assets/terrains/terrain.jpg" alt="Terrain Résidentiel" style="width:100%; border-radius:8px;">
            <h3>Terrain Résidentiel</h3>
            <p>1 m² Lotissement</p>
            <strong>0.5 π</strong>
            <button class="btn btn-primary" onclick="createPiPayment(0.5, 'Achat Terrain Résidentiel', 'terrain_001')">
                Acheter avec Pi
            </button>
        </div>

        <div class="product-card">
            <img src="assets/topographie/gnss-rtk.jpg" alt="GNSS RTK" style="width:100%; border-radius:8px;">
            <h3>GNSS RTK Professionnel</h3>
            <p>GPS • BDS • GLONASS</p>
            <strong>0.1 π</strong>
            <button class="btn btn-primary" onclick="createPiPayment(0.1, 'Achat GNSS RTK Pro', 'gnss_001')">
                Acheter avec Pi
            </button>
        </div>
    `;
}

// Global scroll helper pour le bouton Hero
window.scrollToPopular = function() {
    const section = document.getElementById("popularSection");
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
};
