/* ==========================================
   ARASHI v3.0 - Application Core & Pi SDK
========================================== */

let currentUser = null;

// Initialisation du Pi SDK
export function initPiSDK() {
    if (typeof Pi !== 'undefined') {
        try {
            Pi.init({ version: "2.0", sandbox: false });
            console.log("✅ SDK Pi Network v2.0 Initialisé avec succès");
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation du Pi SDK:", error);
        }
    } else {
        console.warn("⚠️ Pi SDK introuvable. Exécution hors du navigateur Pi Browser.");
    }
}

// Connexion Utilisateur via Pi SDK
export async function authenticatePiUser() {
    const statusElement = document.getElementById('userStatus');

    if (typeof Pi === 'undefined') {
        alert("Veuillez ouvrir cette application dans le navigateur Pi Browser.");
        return;
    }

    const scopes = ['username', 'payments'];

    try {
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        currentUser = auth.user;
        
        if (statusElement) {
            statusElement.textContent = `🟢 @${currentUser.username}`;
            statusElement.style.color = 'var(--success)';
        }
        
        console.log("✅ Authentifié sous :", currentUser.username);
    } catch (error) {
        console.error("❌ Échec de l'authentification Pi :", error);
        alert("Impossible de se connecter avec Pi Network.");
    }
}

// Gestionnaire des paiements incomplets Pi
function onIncompletePaymentFound(payment) {
    console.warn("⚠️ Paiement Pi incomplet détecté :", payment);
    // Transmettre l'ID de paiement au backend si nécessaire
}

// Lancement à la charge de la page
document.addEventListener('DOMContentLoaded', () => {
    initPiSDK();

    const loginBtn = document.getElementById('piLogin');
    if (loginBtn) {
        loginBtn.addEventListener('click', authenticatePiUser);
    }
});