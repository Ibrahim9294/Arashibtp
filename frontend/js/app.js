/* ==========================================
   ARASHI Enterprise v4.0 - Global App Controller
   Fichier : js/app.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Contrôleur Global de l'Application ARASHI
 */
export const App = {

    /**
     * Initialisation au chargement de la page
     */
    init: async function() {
        this.setupMobileMenu();
        this.setupAuthListeners();
        await this.checkUserSession();
    },

    /**
     * Gestion du menu latéral Toggle sur Mobile
     */
    setupMobileMenu: function() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('active');
            });

            // Fermer la sidebar lors d'un clic à l'extérieur
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            });
        }
    },

    /**
     * Vérifie la session Supabase courante au démarrage
     */
    checkUserSession: async function() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Erreur de récupération de la session :", error.message);
                return;
            }

            if (session) {
                this.updateUIForUser(session.user);
            } else {
                this.updateUIForGuest();
            }
        } catch (err) {
            console.error("Erreur d'authentification :", err);
        }
    },

    /**
     * Écouteurs pour le formulaire de connexion Admin / ERP
     */
    setupAuthListeners: function() {
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
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (error) {
                        alert(`Erreur de connexion : ${error.message}`);
                    } else {
                        console.log("Connexion réussie :", data.user);
                        this.updateUIForUser(data.user);
                        alert("Connexion réussie à l'espace ERP ARASHI !");
                        
                        // Redirection si sur la page d'accueil ou de login
                        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                            window.location.href = 'pages/erp.html';
                        }
                    }
                } catch (err) {
                    console.error("Erreur lors de la tentative de connexion :", err);
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        // Écouter les changements d'état d'authentification Supabase
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.updateUIForUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.updateUIForGuest();
            }
        });
    },

    /**
     * Met à jour l'interface lorsqu'un utilisateur est connecté
     */
    updateUIForUser: function(user) {
        const userStatus = document.getElementById('userStatus');
        const loginSection = document.getElementById('loginSection');

        if (userStatus) {
            userStatus.innerHTML = `<span class="badge badge-success"><i class="fa-solid fa-user-check"></i> ${user.email}</span>`;
        }

        // Masquer le formulaire de connexion si déjà connecté
        if (loginSection) {
            loginSection.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <h3><i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Connecté en tant que Admin/ERP</h3>
                    <p style="margin: 10px 0; font-size: 0.9rem; opacity: 0.8;">${user.email}</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <a href="pages/erp.html" class="btn btn-primary"><i class="fa-solid fa-chart-line"></i> Accéder au Dashboard</a>
                        <button onclick="App.logout()" class="btn btn-danger"><i class="fa-solid fa-right-from-bracket"></i> Déconnexion</button>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Met à jour l'interface en mode visiteur
     */
    updateUIForGuest: function() {
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            userStatus.innerHTML = `<span class="badge badge-warning" data-lang="user_disconnected">Non connecté</span>`;
        }
    },

    /**
     * Déconnexion de l'utilisateur
     */
    logout: async function() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Erreur lors de la déconnexion :", error.message);
        } else {
            alert("Vous avez été déconnecté.");
            window.location.reload();
        }
    }
};

// Rendre la méthode logout globale pour l'attribut onclick HTML
window.App = App;

// Démarrage de l'application
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});