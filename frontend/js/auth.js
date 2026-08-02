/* ==========================================
   Entreprise ARASHI v4.0 & v3.0
   Fichier : js/auth.js - Authentification & Gestion Profils
========================================== */

import { supabase } from "./supabase.js";

/**
 * Récupère l'utilisateur Pi enregistré localement
 */
window.getCurrentUser = function () {
    const saved = localStorage.getItem("pi_user");
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error("Erreur parsing pi_user :", e);
        return null;
    }
};

/**
 * Vérifie si un utilisateur Pi est connecté
 */
window.isLoggedIn = function () {
    return localStorage.getItem("pi_user") !== null;
};

/**
 * Déconnexion de l'utilisateur Pi Network
 */
window.logout = function () {
    localStorage.removeItem("pi_user");

    const status = document.getElementById("userStatus");
    if (status) {
        status.innerHTML = `<span class="badge badge-warning" data-lang="user_disconnected">Non connecté</span>`;
    }

    const loginBtn = document.getElementById("piLogin");
    if (loginBtn) {
        loginBtn.style.display = "inline-block";
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.style.display = "none";
    }

    // Redirection vers l'accueil si présent dans un sous-dossier pages/
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = "../index.html";
    } else {
        window.location.reload();
    }
};

/**
 * Synchronise les données utilisateur Pi Network avec la BDD Supabase
 */
async function syncProfile() {
    try {
        const user = window.getCurrentUser();
        if (!user || !user.uid) return;

        const { error } = await supabase
            .from("profiles")
            .upsert({
                pi_uid: user.uid,
                username: user.username || user.uid,
                role: "user",
                updated_at: new Date().toISOString()
            }, { onConflict: "pi_uid" });

        if (error) {
            console.error("❌ Erreur de synchronisation Supabase profile :", error.message);
        }
    } catch (err) {
        console.error("❌ Erreur pendant la synchronisation :", err);
    }
}

/**
 * Charge le profil de l'utilisateur et adapte l'interface selon son rôle (ex: admin)
 */
async function loadProfile() {
    try {
        const user = window.getCurrentUser();
        if (!user || !user.uid) return;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("pi_uid", user.uid)
            .maybeSingle();

        if (error) {
            console.error("❌ Erreur lors de la lecture du profil :", error.message);
            return;
        }

        // Mise à jour de l'affichage UI
        const status = document.getElementById("userStatus");
        const loginBtn = document.getElementById("piLogin");
        const logoutBtn = document.getElementById("logoutBtn");

        if (status) {
            status.innerHTML = `🟢 @${user.username || 'Pioneer'}`;
        }

        if (loginBtn) {
            loginBtn.style.display = "none";
        }

        if (logoutBtn) {
            logoutBtn.style.display = "inline-block";
        }

        // Privilèges d'administration
        if (data && data.role === "admin") {
            console.log("👑 Administrateur connecté");
            const adminLinks = document.querySelectorAll(".admin-only");
            adminLinks.forEach(link => link.style.display = "block");
        }

    } catch (err) {
        console.error("❌ Erreur au chargement du profil :", err);
    }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
    if (window.isLoggedIn()) {
        await syncProfile();
        await loadProfile();
    }
});