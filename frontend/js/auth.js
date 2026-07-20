// =====================================
// ARASHI v3.0
// auth.js
// =====================================

import { supabase } from "./supabase.js";

window.checkAuth = async function () {

    try {

        const saved = localStorage.getItem("pi_user");

        if (!saved) {

            console.log("Aucun utilisateur connecté.");

            return null;

        }

        const user = JSON.parse(saved);

        const status =
            document.getElementById("userStatus");

        if (status) {

            status.innerHTML =
                `🟢 @${user.username}`;

        }

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("username", user.username)
            .single();

        if (error && error.code !== "PGRST116") {

            console.error(error);

            return user;

        }

        if (!data) {

            await supabase
                .from("profiles")
                .insert({

                    username: user.username,

                    pi_uid: user.uid,

                    role: "user"

                });

        }

        return user;

    }

    catch (err) {

        console.error(err);

        return null;

    }

};

window.logout = function () {

    localStorage.removeItem("pi_user");

    location.href = "../index.html";

};

window.isAdmin = async function () {

    const saved = localStorage.getItem("pi_user");

    if (!saved) return false;

    const user = JSON.parse(saved);

    const { data } = await supabase

        .from("profiles")

        .select("role")

        .eq("username", user.username)

        .single();

    return data?.role === "admin";

};

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await checkAuth();

    }

);