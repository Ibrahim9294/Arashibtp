/* =================================================================
   ARASHI Enterprise v3.0 - Multi-language Manager
   Fichier : js/lang.js
================================================================= */

const translations = {
    fr: {
        welcome: "Bienvenue sur Entreprise ARASHI v3.0",
        home: "🏠 Accueil",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Immobilier",
        plots: "📍 Parcelles",
        marketplace: "🛒 Marketplace",
        vendor: "🛍️ Vendor Center",
        payment: "💳 Paiement Pi",
        admin: "👑 Admin",
        buy_btn: "Acheter avec Pi",
        construction: "Construction",
        topography: "Topographie"
    },
    ha: {
        welcome: "Barka da zuwa Entreprise ARASHI v3.0",
        home: "🏠 Shafin Gida",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Gidaje da Filaye",
        plots: "📍 Filaye",
        marketplace: "🛒 Kasuwa",
        vendor: "🛍️ Cibiyar Masu Sayarwa",
        payment: "💳 Biya da Pi",
        admin: "👑 Shugaba",
        buy_btn: "Saya da Pi",
        construction: "Ginaye",
        topography: "Binciken Kasa"
    },
    dje: {
        welcome: "Kubani ARASHI v3.0 ra",
        home: "🏠 Hu gaa",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Fuu nda Laabu",
        plots: "📍 Laabu batama",
        marketplace: "🛒 Katako",
        vendor: "🛍️ Neerawkey nyo",
        payment: "💳 Bana nda Pi",
        admin: "👑 Jine bora",
        buy_btn: "Dey nda Pi",
        construction: "Cineyan",
        topography: "Laabu neesa"
    },
    ar: {
        welcome: "مرحباً بكم في شركة أراشي v3.0",
        home: "🏠 الرئيسية",
        dashboard: "📊 لوحة التحكم",
        realestate: "🏡 العقارات",
        plots: "📍 الأراضي",
        marketplace: "🛒 السوق",
        vendor: "🛍️ مركز البائعين",
        payment: "💳 الدفع بواسطة Pi",
        admin: "👑 الإدارة",
        buy_btn: "شراء بواسطة Pi",
        construction: "البناء والتشييد",
        topography: "المسح الطبوغرافي"
    },
    zh: {
        welcome: "欢迎来到 ARASHI 企业平台 v3.0",
        home: "🏠 首页",
        dashboard: "📊 仪表板",
        realestate: "🏡 房地产",
        plots: "📍 地块",
        marketplace: "🛒 交易市场",
        vendor: "🛍️ 商家中心",
        payment: "💳 Pi 支付",
        admin: "👑 管理员",
        buy_btn: "使用 Pi 购买",
        construction: "工程建设",
        topography: "地形测量"
    },
    en: {
        welcome: "Welcome to ARASHI Enterprise v3.0",
        home: "🏠 Home",
        dashboard: "📊 Dashboard",
        realestate: "🏡 Real Estate",
        plots: "📍 Plots",
        marketplace: "🛒 Marketplace",
        vendor: "🛍️ Vendor Center",
        payment: "💳 Pi Payment",
        admin: "👑 Admin",
        buy_btn: "Buy with Pi",
        construction: "Construction",
        topography: "Topography"
    }
};

/**
 * Applique la langue sélectionnée à toute la page
 * @param {string} lang Code langue (fr, ha, dje, ar, zh, en)
 */
export function changeLanguage(lang) {
    if (!translations[lang]) return;

    // Enregistre le choix de l'utilisateur
    localStorage.setItem("selected_lang", lang);

    // Prise en charge de l'Arabe (écriture de droite à gauche)
    if (lang === "ar") {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
    } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = lang;
    }

    // Traduction dynamique des éléments avec l'attribut data-lang
    const elements = document.querySelectorAll("[data-lang]");
    elements.forEach(element => {
        const key = element.getAttribute("data-lang");
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Synchronisation des sélecteurs de langue
    const sidebarSelect = document.getElementById("sidebarLanguageSelect");
    const footerSelect = document.getElementById("footerLanguageSelect");
    if (sidebarSelect) sidebarSelect.value = lang;
    if (footerSelect) footerSelect.value = lang;
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("selected_lang") || "fr";
    changeLanguage(savedLang);
});

// Rendre la fonction accessible globalement pour onchange="..."
window.changeLanguage = changeLanguage;