// ==========================================
// ENTREPRISE ARASHI v3.0 - Script Principal
// ==========================================

// 1. IMPORTS DES MODULES (Obligatoire au début)
import { loginWithPi } from "./pi-payments.js";

// 2. INITIALISATION AU CHARGEMENT DU DOM
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ ARASHI v3.0 démarré");

    initPiLogin();
    updateDateTime();
    checkSavedUser();
});

// ================================
// GESTION DU PI NETWORK & AUTH
// ================================

function initPiLogin() {
    const btn = document.getElementById("piLogin");

    if (!btn) return;

    btn.addEventListener("click", async () => {
        try {
            // Appel de la fonction de connexion issue de pi-payments.js
            const user = await loginWithPi();
            if (user) {
                btn.innerHTML = "🟢 @" + user.username;
            }
        } catch (e) {
            console.error("Erreur de connexion Pi :", e);
        }
    });
}

// Restaure le nom d'utilisateur dans le bouton si déjà connecté
function checkSavedUser() {
    const savedUser = localStorage.getItem("pi_user");
    const btn = document.getElementById("piLogin");

    if (savedUser && btn) {
        try {
            const user = JSON.parse(savedUser);
            if (user && user.username) {
                btn.innerHTML = "🟢 @" + user.username;
            }
        } catch (e) {
            console.error("Erreur lecture pi_user :", e);
        }
    }
}

// ================================
// FONCTIONNALITÉS DE L'INTERFACE (UI)
// ================================

// Mise à jour / Affichage de la Date
function updateDateTime() {
    const now = new Date();
    console.log("Horodateur :", now.toLocaleString());
    
    // Si vous avez un élément HTML pour afficher l'heure :
    const dateEl = document.getElementById("currentDate");
    if (dateEl) {
        dateEl.innerText = now.toLocaleDateString("fr-FR", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Ouverture / Fermeture du Menu Sidebar (Mobile)
window.openMenu = function () {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
        sidebar.classList.toggle("active");
    }
};

// Module de Recherche
window.searchModule = function (text) {
    console.log("Recherche lancée pour :", text);
};

// Notifications Globales
window.showNotification = function (message) {
    alert(message);
};
