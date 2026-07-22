// =====================================
// ARASHI v3.0
// pi.js
// =====================================

import { supabase } from "./supabase.js";

const SANDBOX = false;

// Initialisation du SDK Pi
if (window.Pi) {
    Pi.init({
        version: "2.0",
        sandbox: SANDBOX
    });
}

// ==============================
// CONNEXION PI
// ==============================

window.loginWithPi = async function () {

    try {

        if (!window.Pi) {
            alert("SDK Pi introuvable.");
            return;
        }

        const scopes = [
            "username",
            "payments"
        ];

        const auth = await Pi.authenticate(
            scopes,
            onIncompletePaymentFound
        );

        if (!auth) {
            alert("Connexion échouée.");
            return;
        }

        const user = {
            uid: auth.uid,
            username: auth.user.username,
            accessToken: auth.accessToken
        };

        // Sauvegarde locale
        localStorage.setItem(
            "pi_user",
            JSON.stringify(user)
        );

        // Affichage utilisateur
        const status = document.getElementById("userStatus");
        if (status) {
            status.innerHTML = "🟢 @" + user.username;
        }

        // Boutons
        const loginBtn = document.getElementById("piLogin");
        if (loginBtn) {
            loginBtn.style.display = "none";
        }

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.style.display = "inline-block";
        }

        // Enregistrement dans Supabase
        const { error } = await supabase
            .from("profiles")
            .upsert({
                pi_uid: user.uid,
                username: user.username
            });

        if (error) {
            console.error(error);
        }

        alert("Connexion Pi réussie.");

    } catch (err) {

        console.error(err);

        alert("Erreur de connexion Pi.");

    }

};

// ==============================
// Paiement incomplet
// ==============================

async function onIncompletePaymentFound(payment) {

    console.log("Paiement incomplet :", payment);

}

// ==============================
// Déconnexion
// ==============================

window.logoutPi = function () {

    localStorage.removeItem("pi_user");

    const status = document.getElementById("userStatus");
    if (status) {
        status.innerHTML = "";
    }

    const loginBtn = document.getElementById("piLogin");
    if (loginBtn) {
        loginBtn.style.display = "inline-block";
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.style.display = "none";
    }

    window.location.href = "../index.html";

};

// ==============================
// Restauration de la session
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    const savedUser = localStorage.getItem("pi_user");

    if (!savedUser) return;

    const user = JSON.parse(savedUser);

    const status = document.getElementById("userStatus");
    if (status) {
        status.innerHTML = "🟢 @" + user.username;
    }

    const loginBtn = document.getElementById("piLogin");
    if (loginBtn) {
        loginBtn.style.display = "none";
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
    }

});