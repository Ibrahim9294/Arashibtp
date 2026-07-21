// =====================================
// ARASHI v3.0
// dashboard.js
// =====================================

import { supabase } from "./supabase.js";

const user = JSON.parse(localStorage.getItem("pi_user") || "null");

async function loadDashboard() {

    if (!user) return;

    try {

        const [
            products,
            orders,
            payments,
            properties,
            vendors
        ] = await Promise.all([

            supabase
                .from("products")
                .select("*")
                .eq("username", user.username),

            supabase
                .from("orders")
                .select("*")
                .eq("username", user.username),

            supabase
                .from("payments")
                .select("*")
                .eq("username", user.username),

            supabase
                .from("properties")
                .select("*"),

            supabase
                .from("vendors")
                .select("*")

        ]);

        document.getElementById("dashboardProducts").textContent =
            products.data?.length || 0;

        document.getElementById("dashboardOrders").textContent =
            orders.data?.length || 0;

        document.getElementById("dashboardProperties").textContent =
            properties.data?.length || 0;

        document.getElementById("dashboardVendors").textContent =
            vendors.data?.length || 0;

        let revenue = 0;

        payments.data?.forEach(payment => {

            if (payment.status === "completed") {

                revenue += Number(payment.amount);

            }

        });

        document.getElementById("dashboardRevenue").textContent =
            revenue.toFixed(2) + " π";

        renderRecentPayments(payments.data || []);

    }

    catch (err) {

        console.error(err);

    }

}

function renderRecentPayments(payments) {

    const table =
        document.getElementById("recentPayments");

    if (!table) return;

    table.innerHTML = "";

    payments.slice(0,10).forEach(payment => {

        table.innerHTML += `

        <tr>

            <td>${payment.pi_payment_id}</td>

            <td>${payment.amount} π</td>

            <td>${payment.status}</td>

            <td>${new Date(payment.updated_at)
                .toLocaleString()}</td>

        </tr>

        `;

    });

}

document.addEventListener(

    "DOMContentLoaded",

    loadDashboard

);