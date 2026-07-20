// =====================================
// ARASHI v3.0
// pi.js
// =====================================

import { supabase } from "./supabase.js";

const SANDBOX = true;

if (window.Pi) {

    Pi.init({

        version: "2.0",

        sandbox: SANDBOX

    });

}

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

        localStorage.setItem(

            "pi_user",

            JSON.stringify(user)

        );

        const status =

            document.getElementById("userStatus");

        if (status) {

            status.innerHTML =

                "🟢 @" + user.username;

        }

        await supabase

            .from("profiles")

            .upsert({

                pi_uid: user.uid,

                username: user.username

            });

        alert(

            "Connexion Pi réussie."

        );

    }

    catch (err) {

        console.error(err);

        alert(

            "Erreur connexion Pi."

        );

    }

};

async function onIncompletePaymentFound(payment) {

    try {

        console.log(

            "Paiement incomplet",

            payment.identifier

        );

    }

    catch (err) {

        console.error(err);

    }

}

window.logoutPi = function () {

    localStorage.removeItem("pi_user");

    location.reload();

};
