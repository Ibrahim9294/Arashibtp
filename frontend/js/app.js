/* ==========================================
   ENTREPRISE ARASHI v3.0 - Script App UI
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Entreprise ARASHI v3.0 - Interface Initialisée");

    // 1. Gestion du Menu Mobile (Sidebar)
    initMobileMenu();

    // 2. Gestion de la Barre de Recherche Globale
    initGlobalSearch();

    // 3. Animation / Initialisation des Statistiques de l'Accueil
    initStatsPlaceholder();
});

/**
 * Gère l'ouverture et la fermeture de la sidebar sur mobile
 */
function initMobileMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => {
            sidebar.classList.toggle("active");
            e.stopPropagation(); // Empêche la fermeture immédiate
        });

        // Ferme la sidebar si on clique en dehors (sur le contenu principal)
        document.addEventListener("click", (e) => {
            if (sidebar.classList.contains("active") && !sidebar.contains(e.target) && e.target !== menuToggle) {
                sidebar.classList.remove("active");
            }
        });
    }
}

/**
 * Gère la saisie dans la barre de recherche globale
 */
function initGlobalSearch() {
    const searchInput = document.getElementById("globalSearch");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length > 2) {
                console.log(`🔍 Entreprise ARASHI - Recherche en cours pour : "${query}"`);
                // Plus tard, cette fonction pourra filtrer les éléments de la marketplace ou de l'immobilier
            }
        });
    }
}

/**
 * Initialise des données visuelles de départ pour les statistiques
 * Note : Ce code sera connecté à Supabase dans l'étape 'supabase.js'
 */
function initStatsPlaceholder() {
    const totalUsers = document.getElementById("totalUsers");
    const totalVendors = document.getElementById("totalVendors");
    const totalProperties = document.getElementById("totalProperties");
    const totalPayments = document.getElementById("totalPayments");

    // Valeurs de démonstration professionnelles en attendant la synchro live
    if (totalUsers) totalUsers.innerText = "1,250+";
    if (totalVendors) totalVendors.innerText = "84";
    if (totalProperties) totalProperties.innerText = "310";
    if (totalPayments) totalPayments.innerText = "45,820 π";
}

/**
 * Fonction de défilement fluide vers la section des opportunités
 */
window.scrollToPopular = function() {
    const section = document.getElementById("popularSection");
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
};
// ... (tes codes existants, laisse-les tranquilles) ...

// ==========================================
// DEBUT DU BLOC A AJOUTER TOUT EN BAS :
// ==========================================
window.triggerPurchase = async function(propertyId, pricePi, propertyTitle) {
    console.log(`Tentative d'achat pour le bien : ${propertyTitle} (${pricePi} Pi)`);
    
    // 1. Vérifier si l'utilisateur est connecté via l'écosystème Pi
    const savedUser = localStorage.getItem("pi_user");
    if (!savedUser) {
        alert("⚠️ Vous devez être connecté avec votre compte Pi pour effectuer un achat.");
        return;
    }

    // 2. Lancer la procédure de paiement Pi Network
    if (window.createPiPayment) {
        // Appelle la fonction de paiement présente dans pi-payments.js
        window.createPiPayment(pricePi, `Achat Immobilier : ${propertyTitle}`, propertyId);
    } else {
        alert("⚙️ Le module de paiement Pi Blockchain n'est pas encore totalement initialisé. Veuillez réessayer dans un instant.");
    }
};
// ==========================================
// FIN DU BLOC
// ==========================================
   
