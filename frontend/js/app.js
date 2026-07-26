// =====================================
// Entreprise ARASHI v3.0
// js/app.js - Module Principal
// =====================================

import { createPiPayment, loginWithPi } from './pi-payments.js';

document.addEventListener("DOMContentLoaded", () => {
    // Bouton de connexion Pi
    const piLoginBtn = document.getElementById("piLogin");
    if (piLoginBtn) {
        piLoginBtn.addEventListener("click", async () => {
            try {
                await loginWithPi();
            } catch (err) {
                alert("Échec de la connexion Pi Network.");
            }
        });
    }

    // Bouton de déconnexion
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("pi_user");
            const userStatusEl = document.getElementById("userStatus");
            if (userStatusEl) {
                userStatusEl.innerText = "Non connecté";
            }
            alert("Déconnecté avec succès.");
        });
    }

    // Restauration de la session utilisateur au chargement
    const savedUser = localStorage.getItem("pi_user");
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const userStatusEl = document.getElementById("userStatus");
            if (userStatusEl && user.username) {
                userStatusEl.innerText = `@${user.username}`;
            }
        } catch (e) {
            console.error("Erreur lors de la lecture de la session enregistrée :", e);
        }
    }

    // Menu Toggle (Sidebar)
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }
});
