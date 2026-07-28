// Dictionnaire complet des traductions ARASHI v3.0
export const translations = {
    fr: {
        // Navigation & Menu
        home: "🏠 Accueil",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Immobilier",
        plots: "📍 Parcelles",
        marketplace: "🛒 Marketplace",
        vendor: "🛍️ Vendor Center",
        payment: "💳 Paiement Pi",
        admin: "👑 Admin",
        topography: "📐 Topographie",
        construction: "🏗️ Construction",
        materials: "🧱 Matériaux",
        ai_bot: "🤖 ARASHI AI",

        // Auth & Header
        login_pi: "🪙 Connexion Pi",
        not_connected: "Non connecté",
        logout: "Déconnexion",

        // Hero & Sections
        welcome: "Bienvenue sur Entreprise ARASHI v3.0",
        welcome_sub: "Construction • Immobilier • Topographie • Marketplace • Paiements Pi Network",
        main_domains: "💼 Nos Domaines d'Activité",
        realestate_title: "🏡 Immobilier ARASHI",
        topography_title: "📐 Topographie",
        construction_title: "🏗️ Construction",
        popular_title: "🔥 Opportunités Populaires",
        see_all: "Tout voir →",

        // Actions & Buttons
        view_items: "Consulter les biens →",
        request_survey: "Demander un levé →",
        view_projects: "Voir les projets →",
        buy_btn: "Acheter avec Pi",
        quick_actions: "⚡ Actions rapides",

        // Dashboard & Stats
        stats_title: "📊 Statistiques de la plateforme",
        cart_title: "🛒 Mon Panier",
        favorites_title: "❤️ Mes Favoris",
        payments_title: "💳 Derniers Paiements",
        news_title: "📢 Actualités ARASHI"
    },
    en: {
        // Navigation & Menu
        home: "🏠 Home",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Real Estate",
        plots: "📍 Land Plots",
        marketplace: "🛒 Marketplace",
        vendor: "🛍️ Vendor Center",
        payment: "💳 Pi Payment",
        admin: "👑 Admin",
        topography: "📐 Topography",
        construction: "🏗️ Construction",
        materials: "🧱 Materials",
        ai_bot: "🤖 ARASHI AI",

        // Auth & Header
        login_pi: "🪙 Pi Login",
        not_connected: "Not Connected",
        logout: "Logout",

        // Hero & Sections
        welcome: "Welcome to Enterprise ARASHI v3.0",
        welcome_sub: "Construction • Real Estate • Topography • Marketplace • Pi Network Payments",
        main_domains: "💼 Our Business Sectors",
        realestate_title: "🏡 ARASHI Real Estate",
        topography_title: "📐 Topography",
        construction_title: "🏗️ Construction",
        popular_title: "🔥 Popular Opportunities",
        see_all: "See all →",

        // Actions & Buttons
        view_items: "View properties →",
        request_survey: "Request survey →",
        view_projects: "View projects →",
        buy_btn: "Buy with Pi",
        quick_actions: "⚡ Quick Actions",

        // Dashboard & Stats
        stats_title: "📊 Platform Statistics",
        cart_title: "🛒 My Cart",
        favorites_title: "❤️ My Favorites",
        payments_title: "💳 Recent Payments",
        news_title: "📢 ARASHI News"
    }
};

// Fonction globale d'application de la langue
export function setLanguage(lang) {
    // 1. Sauvegarde dans le stockage local
    localStorage.setItem("arashi_lang", lang);

    // 2. Mise à jour de l'attribut lang du HTML
    document.documentElement.lang = lang;

    // 3. Traduction de tous les éléments ayant l'attribut data-lang
    const elements = document.querySelectorAll("[data-lang]");
    elements.forEach(el => {
        const key = el.getAttribute("data-lang");
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    // 4. Synchronisation de tous les sélecteurs de langue présents sur la page
    const selectors = document.querySelectorAll("#sidebarLanguageSelect, #footerLanguageSelect");
    selectors.forEach(select => {
        select.value = lang;
    });
}

// Rendre la fonction accessible pour les événements inline (onchange)
window.changeLanguage = function(lang) {
    setLanguage(lang);
};

// Application automatique de la langue enregistrée au chargement
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("arashi_lang") || "fr";
    setLanguage(savedLang);
});
