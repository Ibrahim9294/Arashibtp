// =====================================
// Entreprise ARASHI v3.0
// js/app.js - Module Principal & UI
// =====================================

import { createPiPayment, loginWithPi, initPiSdk } from './pi-payments.js';

// Fonction globale pour mettre à jour l'affichage de l'utilisateur
function updateUIWithUser(user) {
    const userStatusEl = document.getElementById("userStatus");
    if (userStatusEl && user) {
        const username = user.username || user.uid || "Utilisateur";
        userStatusEl.innerText = `@${username}`;
        userStatusEl.style.color = "#28a745";
        userStatusEl.style.fontWeight = "bold";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialisation immédiate du SDK Pi Network
    initPiSdk();

    // 2. Gestion Ouverture / Fermeture du Menu Sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("open");
            sidebar.classList.toggle("active"); // Support des deux classes CSS
        });

        // Fermer le menu si on clique en dehors
        document.addEventListener("click", (e) => {
            if (sidebar.classList.contains("open") || sidebar.classList.contains("active")) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove("open", "active");
                }
            }
        });
    }

    // 3. Bouton Connexion Pi Network
    const piLoginBtn = document.getElementById("piLogin");
    if (piLoginBtn) {
        piLoginBtn.addEventListener("click", async () => {
            try {
                const user = await loginWithPi();
                if (user) {
                    updateUIWithUser(user);
                    alert(`Bienvenue @${user.username || 'Pioneer'} !`);
                }
            } catch (err) {
                console.error("Détail de l'erreur Pi :", err);
                const detail = err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
                alert("Échec de la connexion Pi : " + detail);
            }
        });
    }

    // 4. Bouton Déconnexion
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("pi_user");
            const userStatusEl = document.getElementById("userStatus");
            if (userStatusEl) {
                userStatusEl.innerText = "Non connecté";
                userStatusEl.style.color = "";
            }
            alert("Déconnecté avec succès.");
        });
    }

    // 5. Restauration de la session utilisateur enregistrée
    const savedUser = localStorage.getItem("pi_user");
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            updateUIWithUser(user);
        } catch (e) {
            console.error("Erreur lecture session enregistrée :", e);
        }
    }
});
