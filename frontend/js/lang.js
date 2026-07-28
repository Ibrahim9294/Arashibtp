// Dictionnaire des langues pour ARASHI v3.0
export const translations = {
    fr: {
        welcome: "Règlement Sécurisé en Pi (π)",
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
        buy_btn: "Acheter avec Pi"
    },
    en: {
        welcome: "Secure Payment in Pi (π)",
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
        buy_btn: "Buy with Pi"
    }
};

// Fonction pour changer la langue et la sauvegarder
window.changeLanguage = function(lang) {
    localStorage.setItem('arashi_lang', lang);
    applyLanguage(lang);
};

// Application de la langue sélectionnée sur les éléments munis de l'attribut data-lang
export function applyLanguage(lang) {
    const selectedLang = lang || localStorage.getItem('arashi_lang') || 'fr';
    
    // Mettre à jour la valeur du menu déroulant s'il existe
    const select = document.getElementById('languageSelect');
    if (select) select.value = selectedLang;

    // Traduire tous les éléments avec l'attribut [data-lang]
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[selectedLang] && translations[selectedLang][key]) {
            element.innerText = translations[selectedLang][key];
        }
    });
}

// Initialisation automatique au chargement
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('arashi_lang') || 'fr';
    applyLanguage(savedLang);
});
      
