// ==========================================
// ENTREPRISE ARASHI v2.0
// Script principal
// ==========================================

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ ARASHI v2.0 démarré");

    initPi();
    updateDateTime();
});

// ================================
// PI NETWORK
// ================================

async function initPi() {

    if (!window.Pi) {
        console.log("Pi SDK non détecté.");
        return;
    }

    Pi.init({
        version: "2.0",
        sandbox: true
    });

    const btn = document.getElementById("piLogin");

    if (!btn) return;

    btn.addEventListener("click", async () => {

        try {

            const auth = await Pi.authenticate(
                ["username", "payments"],
                () => {}
            );

            btn.innerHTML = "🟢 " + auth.user.username;

        } catch (e) {

            alert("Connexion Pi annulée.");

        }

    });

}

// ================================
// DATE
// ================================

function updateDateTime() {

    console.log(new Date().toLocaleString());

}

// ================================
// MENU
// ================================

function openMenu() {

    document.querySelector(".sidebar").classList.toggle("active");

}

// ================================
// RECHERCHE
// ================================

function searchModule(text) {

    console.log("Recherche :", text);

}

// ================================
// NOTIFICATIONS
// ================================

function showNotification(message) {

    alert(message);

        }
