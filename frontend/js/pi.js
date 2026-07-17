/* ==========================================
   ENTREPRISE ARASHI v3.0 - SDK Pi Network
========================================== */

// On s'assure que le SDK Pi est bien chargé globalement via index.html
const Pi = window.Pi;

document.addEventListener("DOMContentLoaded", () => {
    // Tenter d'initialiser le SDK dès que la page est prête
    initPiSDK();
});

/**
 * Initialise le SDK Pi Network de manière sécurisée
 */
function initPiSDK() {
    if (!Pi) {
        console.error("❌ SDK Pi introuvable. Assurez-vous d'ouvrir ARASHI dans le Pi Browser.");
        return;
    }

    try {
        // Initialisation officielle (Version sandbox pour les tests, production pour le Pi Browser)
        Pi.init({ version: "2.0", sandbox: false });
        console.log("✅ SDK Pi Network initialisé avec succès !");
        
        // Optionnel : Tenter une connexion automatique si l'utilisateur s'est déjà connecté
        checkExistingAuth();
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation du SDK Pi :", error);
    }
}

/**
 * Fonction appelée lors du clic sur le bouton "Connexion Pi"
 * Déclenche la popup d'autorisation officielle Pi Network
 */
window.loginWithPi = function() {
    if (!Pi) {
        alert("Veuillez ouvrir cette application dans le Pi Browser pour vous connecter avec votre Wallet Pi.");
        return;
    }

    const scopes = ["username", "payments"];

    // Demande d'authentification à l'utilisateur
    Pi.authenticate(scopes, onIncompletePaymentFound)
        .then(function(auth) {
            console.log("🔑 Authentification Pi réussie !", auth);
            
            // On enregistre les données de session localement
            localStorage.setItem("pi_user", JSON.stringify(auth.user));
            localStorage.setItem("pi_accessToken", auth.accessToken);

            // Mise à jour de l'affichage utilisateur
            updateUserUI(auth.user.username);

            // TODO : Envoyer ces données à supabase.js / auth.js pour créer/connecter le profil dans ta BDD
            if (window.syncUserWithSupabase) {
                window.syncUserWithSupabase(auth.user);
            }
        })
        .catch(function(error) {
            console.error("❌ Échec de l'authentification Pi :", error);
            alert("Erreur de connexion Pi. Veuillez réessayer.");
        });
};

/**
 * Vérifie si une session Pi existe déjà dans le stockage local
 */
function checkExistingAuth() {
    const savedUser = localStorage.getItem("pi_user");
    if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log(`👤 Utilisateur Pi déjà connecté : ${user.username}`);
        updateUserUI(user.username);
    }
}

/**
 * Met à jour l'en-tête (Topbar) du portail avec le pseudo de l'utilisateur
 */
function updateUserUI(username) {
    const loginBtn = document.getElementById("piLogin");
    const userStatus = document.getElementById("userStatus");
    const profileName = document.getElementById("profileName");

    if (loginBtn && userStatus) {
        // On cache le bouton de connexion et on affiche le pseudo
        loginBtn.style.display = "none";
        userStatus.innerHTML = `🟢 <strong>@${username}</strong>`;
        userStatus.style.color = "#0B3D91";
        userStatus.style.fontWeight = "600";
    }

    if (profileName) {
        // Met à jour le bloc de profil dans l'upper-dashboard
        profileName.innerText = username;
    }
}

/**
 * Gestionnaire requis par le SDK Pi au cas où un paiement précédent a été interrompu
 */
function onIncompletePaymentFound(payment) {
    console.log("⚠️ Paiement incomplet trouvé :", payment);
    // Ce point sera géré en détail dans le fichier js/pi-payments.js
}
