// =====================================
// ARASHI v3.0
// pi.js
// =====================================

import { supabase } from "./supabase.js";

// Initialisation du SDK Pi
try {
    Pi.init({
        version: "2.0",
        sandbox: true // mettre false lors du passage en Mainnet
    });
} catch (err) {
    console.error("Erreur Pi.init :", err);
}

// Connexion Pi
window.loginWithPi = async function () {

    try {

        const scopes = [
            "username",
            "payments"
        ];

        const auth = await Pi.authenticate(
            scopes,
            function (payment) {
                console.log("Paiement incomplet :", payment);
            }
        );

        if (!auth) {
            alert("Connexion Pi annulée.");
            return;
        }

        const user = {
            uid: auth.user.uid,
            username: auth.user.username,
            accessToken: auth.accessToken
        };

        localStorage.setItem(
            "pi_user",
            JSON.stringify(user)
        );

        await supabase
            .from("profiles")
            .upsert({
                pi_uid: user.uid,
                username: user.username
            });

        const status =
            document.getElementById("userStatus");

        if (status) {
            status.innerHTML =
                `🟢 @${user.username}`;
        }

        console.log("Utilisateur connecté :", user);

        return user;

    } catch (err) {

        console.error(err);

        alert("Connexion Pi impossible.");

    }

};

// Déconnexion
window.logoutPi = function () {

    localStorage.removeItem("pi_user");

    location.reload();

};

// Vérification de la session
window.getCurrentPiUser = function () {

    const saved =
        localStorage.getItem("pi_user");

    if (!saved) return null;

    return JSON.parse(saved);

};