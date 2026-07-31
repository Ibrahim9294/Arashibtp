/* ==========================================
   ARASHI v3.0 - Gestionnaire Quadri-langue
========================================== */

const translations = {
    fr: {
        home: "🏠 Accueil",
        marketplace: "🛒 Marketplace",
        core_team: "⚡ Core Team Space",
        login_pi: "🪙 Connexion Pi",
        welcome: "Bienvenue sur ARASHI v3.0",
        welcome_sub: "Construction • Immobilier • Topographie • Paiements Pi Network",
        explore_btn: "Explorer le Marketplace"
    },
    en: {
        home: "🏠 Home",
        marketplace: "🛒 Marketplace",
        core_team: "⚡ Core Team Space",
        login_pi: "🪙 Pi Login",
        welcome: "Welcome to ARASHI v3.0",
        welcome_sub: "Construction • Real Estate • Surveying • Pi Network Payments",
        explore_btn: "Explore Marketplace"
    },
    ha: {
        home: "🏠 Gida",
        marketplace: "🛒 Kasuwa",
        core_team: "⚡ Core Team Space",
        login_pi: "🪙 Shiga Pi",
        welcome: "Barka da zuwa ARASHI v3.0",
        welcome_sub: "Gini • Gida da Filaye • Taswira • Biya da Pi Network",
        explore_btn: "Bincika Kasuwa"
    },
    ar: {
        home: "🏠 الرئيسية",
        marketplace: "🛒 السوق",
        core_team: "⚡ مساحة الفريق الرئيسي",
        login_pi: "🪙 تسجيل Pi",
        welcome: "مرحبا بكم في ARASHI v3.0",
        welcome_sub: "البناء • العقارات • المساحة • مدفوعات Pi Network",
        explore_btn: "استكشف السوق"
    }
};

window.changeLanguage = function(lang) {
    if (!translations[lang]) return;
    
    localStorage.setItem('arashi_lang', lang);

    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Support de la direction RTL pour l'Arabe
    if (lang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
    } else {
        document.body.removeAttribute('dir');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('arashi_lang') || 'fr';
    const selector = document.getElementById('sidebarLanguageSelect');
    if (selector) selector.value = savedLang;
    window.changeLanguage(savedLang);
});