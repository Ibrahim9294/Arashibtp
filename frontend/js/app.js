/* ==========================================
   Entreprise ARASHI v4.0 - Module Principal & UI
   Fichier : js/app.js
========================================== */

import { supabase } from './supabase.js';
import { createPiPayment, loginWithPi, initPiSdk } from './pi-payments.js';

/**
 * Mise à jour de l'affichage du statut Pi Network dans l'en-tête
 */
export function updateUIWithUser(user) {
    const userStatusEl = document.getElementById("userStatus");
    if (userStatusEl && user) {
        const username = user.username || user.uid || "Utilisateur";
        userStatusEl.innerText = `@${username}`;
        userStatusEl.style.color = "#28a745";
        userStatusEl.style.fontWeight = "bold";
    }
}

/**
 * Contrôleur Global de l'Application ARASHI
 */
export const App = {

    /**
     * Initialisation au chargement de la page
     */
    init: async function() {
        // 1. Initialisation SDK Pi
        if (typeof initPiSdk === 'function') {
            initPiSdk();
        }

        // 2. Gestion Menu & Écouteurs UI
        this.setupMobileMenu();
        this.setupAuthListeners();

        // 3. Vérification des sessions enregistrées (Pi + Supabase)
        this.restorePiSession();
        await this.checkSupabaseSession();
    },

    /**
     * Gestion Ouverture / Fermeture du Menu Sidebar
     */
    setupMobileMenu: function() {
        const menuToggle = document.getElementById("menuToggle");
        const sidebar = document.getElementById("sidebar");

        if (menuToggle && sidebar) {
            menuToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                sidebar.classList.toggle("open");
                sidebar.classList.toggle("active");
            });

            document.addEventListener("click", (e) => {
                if (sidebar.classList.contains("open") || sidebar.classList.contains("active")) {
                    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove("open", "active");
                    }
                }
            });
        }
    },

    /**
     * Restauration de la session Pi Network
     */
    restorePiSession: function() {
        const savedUser = localStorage.getItem("pi_user");
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                updateUIWithUser(user);
            } catch (e) {
                console.error("Erreur lecture session Pi :", e);
            }
        }
    },

    /**
     * Vérification de la session Supabase
     */
    checkSupabaseSession: async function() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Erreur session Supabase :", error.message);
                return;
            }
            if (session) {
                this.updateUIForSupabaseUser(session.user);
            }
        } catch (err) {
            console.error("Erreur d'authentification Supabase :", err);
        }
    },

    /**
     * Écouteurs de formulaires et boutons d'action
     */
    setupAuthListeners: function() {
        // Bouton Connexion Pi Network
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

        // Formulaire Login Supabase (Admin / ERP)
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value;
                const password = document.getElementById('loginPassword')?.value;

                if (!email || !password) {
                    alert("Veuillez remplir tous les champs.");
                    return;
                }

                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Connexion...`;
                submitBtn.disabled = true;

                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) {
                        alert(`Erreur de connexion : ${error.message}`);
                    } else {
                        this.updateUIForSupabaseUser(data.user);
                        alert("Connexion réussie à l'espace ERP ARASHI !");
                        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                            window.location.href = 'pages/erp.html';
                        }
                    }
                } catch (err) {
                    console.error("Erreur connexion Supabase :", err);
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        // Écouteur Supabase Auth State
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.updateUIForSupabaseUser(session.user);
            }
        });
    },

    /**
     * Mise à jour de l'UI pour un administrateur Supabase connecté
     */
    updateUIForSupabaseUser: function(user) {
        const loginSection = document.getElementById('loginSection');
        if (loginSection) {
            loginSection.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <h3><i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Connecté à l'ERP</h3>
                    <p style="margin: 10px 0; font-size: 0.9rem; opacity: 0.8;">${user.email}</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <a href="pages/erp.html" class="btn btn-primary"><i class="fa-solid fa-chart-line"></i> Accéder au Dashboard</a>
                        <button onclick="App.logoutSupabase()" class="btn btn-danger"><i class="fa-solid fa-right-from-bracket"></i> Déconnexion</button>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Déconnexion Supabase
     */
    logoutSupabase: async function() {
        await supabase.auth.signOut();
        alert("Déconnecté du compte ERP.");
        window.location.reload();
    }
};

// Exposition globale pour les appels dans le DOM
window.App = App;

// Démarrage au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});