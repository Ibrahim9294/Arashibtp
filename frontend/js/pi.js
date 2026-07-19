// ======================================
// ARASHI v3.0
// Pi Network Login
// ======================================

import { supabase } from "./supabase.js";

// Initialisation du SDK Pi
if (window.Pi) {
    Pi.init({
        version: "2.0",
        sandbox: true // Mettre false pour le Mainnet
    });
} else {
    console.error("SDK Pi Network non chargé.");
}

// Fonction de connexion
window.loginWithPi = async function () {

    try {

        const scopes = ["username", "payments"];

        const auth = await Pi.authenticate(scopes, () => {});

        if (!auth) {
            alert("Connexion Pi annulée.");
            return;
        }

        const user = {
            uid: auth.user.uid,
            username: auth.user.username,
            accessToken: auth.accessToken
        };

        // Sauvegarde locale
        localStorage.setItem("pi_user", JSON.stringify(user));

        // Sauvegarde dans Supabase
        const { error } = await supabase
            .from("profiles")
            .upsert({
                pi_uid: user.uid,
                username: user.username
            });

        if (error) {
            console.error(error);
        }

        const status = document.getElementById("userStatus");

        if (status) {
            status.innerHTML = `🟢 @${user.username}`;
        }

        alert("Connexion Pi réussie.");

    } catch (err) {

        console.error(err);

        alert("Erreur de connexion Pi.");

    }

};