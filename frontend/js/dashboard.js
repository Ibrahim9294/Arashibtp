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

const dashboardProducts = document.getElementById("dashboardProducts");
if (dashboardProducts) {
    dashboardProducts.textContent = products.data?.length || 0;
}

const dashboardOrders = document.getElementById("dashboardOrders");
if (dashboardOrders) {
    dashboardOrders.textContent = orders.data?.length || 0;
}

const dashboardProperties = document.getElementById("dashboardProperties");
if (dashboardProperties) {
    dashboardProperties.textContent = properties.data?.length || 0;
}

const dashboardVendors = document.getElementById("dashboardVendors");
if (dashboardVendors) {
    dashboardVendors.textContent = vendors.data?.length || 0;
}

const dashboardRevenue = document.getElementById("dashboardRevenue");
if (dashboardRevenue) {
    dashboardRevenue.textContent = revenue.toFixed(2) + " π";
}
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
const status = document.getElementById("userStatus");
if (status) {
    status.innerHTML = "🟢 @" + user.username;
}

    table.innerHTML = "";

    payments.slice(0,10).forEach(payment => {

        table.innerHTML += `

        <tr>

            <td>${
    payment.updated_at
        ? new Date(payment.updated_at).toLocaleString()
        : "-"
}</td>

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