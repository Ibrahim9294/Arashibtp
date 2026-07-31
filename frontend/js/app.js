// =====================================================
// Entreprise ARASHI v3.0 - Script d'initialisation Pi
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    // Initialisation SDK Pi Network
    if (window.Pi) {
        window.Pi.init({ version: "2.0", sandbox: false });
    }

    // Gestion des boutons de connexion
    const loginBtn = document.getElementById("piLogin");
    if(loginBtn) {
        loginBtn.addEventListener("click", async () => {
            try {
                const scopes = ['username', 'payments'];
                const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
                document.getElementById("userStatus").innerText = "@" + auth.user.username;
                loginBtn.style.display = "none";
                document.getElementById("logoutBtn").style.display = "inline-block";
            } catch (err) {
                console.error("Erreur d'authentification Pi:", err);
            }
        });
    }
});

function onIncompletePaymentFound(payment) {
    console.log("Paiement incomplet trouvé:", payment);
}

// Fonction globale pour orchestrer les paiements Pi
window.createPiPayment = async function(amount, memo, metadata) {
    if (!window.Pi) {
        alert("SDK Pi Network indisponible.");
        return;
    }
    
    return window.Pi.createPayment({
        amount: amount,
        memo: memo,
        metadata: { item: metadata }
    }, {
        onReadyForServerApproval: (paymentId) => console.log("Approval ID:", paymentId),
        onReadyForServerCompletion: (paymentId, txid) => console.log("Completion ID:", paymentId, txid),
        onCancel: (paymentId) => alert("Paiement annulé"),
        onError: (error, payment) => console.error("Erreur Paiement:", error)
    });
};