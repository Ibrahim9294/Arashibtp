// js/lang.js
export const translations = {
    fr: {
        login_pi: "🪙 Connexion Pi",
        not_connected: "Non connecté",
        logout: "Déconnexion",
        welcome_sub: "Construction • Immobilier • Topographie • Marketplace • Paiements Pi Network",
        search: "🔎 Rechercher...",
        buy_btn: "⚡ Acheter avec Pi",
        loading_products: "⏳ Chargement des biens immobiliers...",
        empty_cart: "Votre panier est vide.",
        no_payments: "Aucun paiement enregistré",
        no_products: "Aucun bien disponible pour le moment."
    },
    en: {
        login_pi: "🪙 Pi Login",
        not_connected: "Not connected",
        logout: "Logout",
        welcome_sub: "Construction • Real Estate • Topography • Marketplace • Pi Network Payments",
        search: "🔎 Search...",
        buy_btn: "⚡ Buy with Pi",
        loading_products: "⏳ Loading real estate properties...",
        empty_cart: "Your cart is empty.",
        no_payments: "No registered payments",
        no_products: "No properties available at the moment."
    }
};

export function setLanguage(lang) {
    const dictionary = translations[lang] || translations.fr;
    localStorage.setItem("arashi_lang", lang);

    document.querySelectorAll("[data-lang]").forEach(element => {
        const key = element.getAttribute("data-lang");
        if (dictionary[key]) {
            // Traitement spécifique pour les inputs de type search/text (placeholder)
            if (element.tagName === "INPUT" && element.hasAttribute("placeholder")) {
                element.placeholder = dictionary[key];
            } else {
                element.textContent = dictionary[key];
            }
        }
    });
}
