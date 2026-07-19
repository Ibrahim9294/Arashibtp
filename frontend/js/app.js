// =====================================
// ARASHI v3.0
// app.js
// =====================================

import { supabase } from "./supabase.js";

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
}

window.scrollToPopular = function () {
    document
        .getElementById("popularSection")
        ?.scrollIntoView({
            behavior: "smooth"
        });
};

async function loadStatistics() {

    try {

        const [
            users,
            vendors,
            properties,
            payments
        ] = await Promise.all([

            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("vendors").select("*", { count: "exact", head: true }),
            supabase.from("properties").select("*", { count: "exact", head: true }),
            supabase.from("payments").select("*")

        ]);

        document.getElementById("totalUsers").textContent =
            users.count || 0;

        document.getElementById("totalVendors").textContent =
            vendors.count || 0;

        document.getElementById("totalProperties").textContent =
            properties.count || 0;

        let totalPi = 0;

        payments.data?.forEach(p => {

            if (p.status === "completed") {

                totalPi += Number(p.amount);

            }

        });

        document.getElementById("totalPayments").textContent =
            totalPi + " π";

    }

    catch (e) {

        console.error(e);

    }

}

loadStatistics();

async function loadStatistics() {

    try {

        const [
            users,
            vendors,
            properties,
            payments
        ] = await Promise.all([

            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("vendors").select("*", { count: "exact", head: true }),
            supabase.from("properties").select("*", { count: "exact", head: true }),
            supabase.from("payments").select("*")

        ]);

        document.getElementById("totalUsers").textContent =
            users.count || 0;

        document.getElementById("totalVendors").textContent =
            vendors.count || 0;

        document.getElementById("totalProperties").textContent =
            properties.count || 0;

        let totalPi = 0;

        payments.data?.forEach(p => {

            if (p.status === "completed") {

                totalPi += Number(p.amount);

            }

        });

        document.getElementById("totalPayments").textContent =
            totalPi + " π";

    }

    catch (e) {

        console.error(e);

    }

}

loadStatistics();