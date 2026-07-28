// Dictionnaire complet des traductions ARASHI v3.0
export const translations = {
    fr: {
        // Navigation & Menu
        welcome: "Bienvenue sur Entreprise ARASHI v3.0",
        home: "🏠 Accueil",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Immobilier",
        plots: "📍 Parcelles",
        topography: "📐 Topographie",
        construction: "🏗️ Construction",
        marketplace: "🛒 Marketplace",
        vendor: "🛍️ Vendor Center",
        payment: "💳 Paiement Pi",
        admin: "👑 Admin",
        buy_btn: "Acheter avec Pi",

        // Sections & Titres
        materials: "🧱 Matériaux",
        ai_bot: "🤖 ARASHI AI",
        main_domains: "💼 Nos Domaines d'Activité",
        realestate_title: "🏡 Immobilier ARASHI",
        topography_title: "📐 Topographie",
        construction_title: "🏗️ Construction",
        popular_title: "🔥 Opportunités Populaires",
        stats_title: "📊 Statistiques de la plateforme",
        quick_actions: "⚡ Actions rapides",
        cart_title: "🛒 Mon Panier",
        favorites_title: "❤️ Mes Favoris",
        payments_title: "💳 Derniers Paiements",
        news_title: "📢 Actualités ARASHI",

        // Boutons & Liens
        see_all: "Tout voir →",
        view_items: "Consulter les biens →",
        request_survey: "Demander un levé →",
        view_projects: "Voir les projets →",
        login_pi: "🪙 Connexion Pi",
        logout: "Déconnexion",
        not_connected: "Non connecté"
    },
    en: {
        // Navigation & Menu
        welcome: "Welcome to ARASHI Enterprise v3.0",
        home: "🏠 Home",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Real Estate",
        plots: "📍 Land Plots",
        topography: "📐 Topography",
        construction: "🏗️ Construction",
        marketplace: "🛒 Marketplace",
        vendor: "🛍️ Vendor Center",
        payment: "💳 Pi Payment",
        admin: "👑 Admin",
        buy_btn: "Buy with Pi",

        // Sections & Titles
        materials: "🧱 Materials",
        ai_bot: "🤖 ARASHI AI",
        main_domains: "💼 Business Sectors",
        realestate_title: "🏡 ARASHI Real Estate",
        topography_title: "📐 Topography",
        construction_title: "🏗️ Construction",
        popular_title: "🔥 Popular Opportunities",
        stats_title: "📊 Platform Statistics",
        quick_actions: "⚡ Quick Actions",
        cart_title: "🛒 My Cart",
        favorites_title: "❤️ My Favorites",
        payments_title: "💳 Recent Payments",
        news_title: "📢 ARASHI News",

        // Buttons & Links
        see_all: "See all →",
        view_items: "View properties →",
        request_survey: "Request survey →",
        view_projects: "View projects →",
        login_pi: "🪙 Pi Login",
        logout: "Logout",
        not_connected: "Not connected"
    }
};

// Fonction globale pour changer la langue depuis les sélecteurs <select>
window.changeLanguage = function(lang) {
    localStorage.setItem('arashi_lang', lang);
    applyLanguage(lang);
};

// Applique la traduction sur TOUS les éléments marqués avec data-lang
export function applyLanguage(lang) {
    const selectedLang = lang || localStorage.getItem('arashi_lang') || 'fr';
    
    // Synchroniser les menus déroulants s'ils existent
    const selectSidebar = document.getElementById('sidebarLanguageSelect');
    const selectFooter = document.getElementById('footerLanguageSelect');
    if (selectSidebar) selectSidebar.value = selectedLang;
    if (selectFooter) selectFooter.value = selectedLang;

    // Traduire chaque élément de la page
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[selectedLang] && translations[selectedLang][key]) {
            element.innerText = translations[selectedLang][key];
        }
    });
}

// Lancer la traduction dès le chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('arashi_lang') || 'fr';
    applyLanguage(savedLang);
});
