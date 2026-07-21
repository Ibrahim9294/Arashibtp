// =====================================
// ARASHI v3.0 - App Principal
// app.js
// =====================================

// Import des modules
import "./supabase.js";
import "./pi.js";
import "./pi-payments.js";
import "./auth.js";
import "./marketplace.js";
import "./vendor.js";
import "./dashboard.js";
import "./admin.js";
import "./ai.js";

// Initialisation globale
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 ARASHI v3.0 initialisée avec succès");

  // Vérification connexion Pi
  if (window.Pi) {
    console.log("Pi SDK détecté");
  }

  // Mise à jour du statut utilisateur
  const status = document.getElementById("userStatus");
  if (status && localStorage.getItem("pi_user")) {
    const user = JSON.parse(localStorage.getItem("pi_user"));
    status.innerHTML = `🟢 @${user.username}`;
  }
});

// Fonction globale de déconnexion
window.logout = function () {
  localStorage.removeItem("pi_user");
  window.location.href = "index.html";
};

// Fonction globale de test paiement
window.testPayment = function () {
  window.createPiPayment(1, "Test Paiement ARASHI v3.0", "test-001");
};
