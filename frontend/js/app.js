// =====================================
// ARASHI v3.0
// app.js
// =====================================

// Import des modules
import "./supabase.js";
import "./auth.js";
import "./pi.js";
import "./pi-payments.js";

// =====================================
// INITIALISATION
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 ARASHI v3.0 chargé");

    // ==========================
    // Menu Mobile
    // ==========================

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("active");

        });

        document.addEventListener("click", (e) => {

            if (

                window.innerWidth <= 900 &&

                !sidebar.contains(e.target) &&

                !menuToggle.contains(e.target)

            ) {

                sidebar.classList.remove("active");

            }

        });

    }

    // ==========================
    // Affichage utilisateur
    // ==========================

    const status = document.getElementById("userStatus");

    const savedUser = localStorage.getItem("pi_user");

    if (status && savedUser) {

        const user = JSON.parse(savedUser);

        status.innerHTML = `🟢 @${user.username}`;

    }

    // ==========================
    // Connexion Pi
    // ==========================

    const loginBtn = document.getElementById("piLogin");

    if (loginBtn) {

        loginBtn.addEventListener("click", async () => {

            if (window.loginWithPi) {

                await window.loginWithPi();

            } else {

                alert("Module Pi non chargé.");

            }

        });

    }

    // ==========================
    // Déconnexion
    // ==========================

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            if (window.logoutPi) {

                window.logoutPi();

            }

        });

    }

});

// =====================================
// Déconnexion Globale
// =====================================

window.logout = function () {

    localStorage.removeItem("pi_user");

    location.href = "../index.html";

};

// =====================================
// Test Paiement Pi
// =====================================

window.testPayment = async function () {

    if (!window.createPiPayment) {

        alert("Paiement Pi indisponible.");

        return;

    }

    await window.createPiPayment(

        1,

        "Test Paiement ARASHI",

        "test-001"

    );

};