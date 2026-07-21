// =====================================
// ARASHI v3.0
// auth.js
// =====================================

import { supabase } from "./supabase.js";

window.getCurrentUser = function () {

    const saved = localStorage.getItem("pi_user");

    if (!saved) return null;

    return JSON.parse(saved);

};

window.isLoggedIn = function () {

    return localStorage.getItem("pi_user") !== null;

};

window.logout = function () {

    localStorage.removeItem("pi_user");

    window.location.href = "../index.html";

};

async function syncProfile() {

    try {

        const user = window.getCurrentUser();

        if (!user) return;

        const { error } = await supabase

            .from("profiles")

            .upsert({

                pi_uid: user.uid,

                username: user.username,

                role: "user"

            });

        if (error) {

            console.error(error);

        }

    }

    catch (err) {

        console.error(err);

    }

}

async function loadProfile() {

    try {

        const user = window.getCurrentUser();

        if (!user) return;

        const {

            data,

            error

        } = await supabase

            .from("profiles")

            .select("*")

            .eq("pi_uid", user.uid)

            .single();

        if (error) return;

        const status = document.getElementById("userStatus");

        if (status) {

            status.innerHTML = `🟢 @${data.username}`;

        }

        if (data.role === "admin") {

            console.log("Administrateur connecté");

        }

    }

    catch (err) {

        console.error(err);

    }

}

document.addEventListener("DOMContentLoaded", async () => {

    await syncProfile();

    await loadProfile();

});