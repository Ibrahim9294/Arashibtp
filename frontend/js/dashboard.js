// =====================================
// ARASHI v3.0
// dashboard.js
// =====================================

import { supabase } from "./supabase.js";

async function loadDashboard() {

    try {

        const [

            users,

            vendors,

            products,

            properties,

            payments

        ] = await Promise.all([

            supabase
                .from("profiles")
                .select("*", {
                    count: "exact",
                    head: true
                }),

            supabase
                .from("vendors")
                .select("*", {
                    count: "exact",
                    head: true
                }),

            supabase
                .from("products")
                .select("*", {
                    count: "exact",
                    head: true
                }),

            supabase
                .from("properties")
                .select("*", {
                    count: "exact",
                    head: true
                }),

            supabase
                .from("payments")
                .select("*")

        ]);

        const set = (id, value) => {

            const el = document.getElementById(id);

            if (el) {

                el.textContent = value;

            }

        };

        set("dashboardUsers", users.count || 0);

        set("dashboardVendors", vendors.count || 0);

        set("dashboardProducts", products.count || 0);

        set("dashboardProperties", properties.count || 0);

        let revenue = 0;

        let completed = 0;

        payments.data?.forEach(payment => {

            if (payment.status === "completed") {

                revenue += Number(payment.amount);

                completed++;

            }

        });

        set("dashboardRevenue", revenue + " π");

        set("dashboardPayments", completed);

    }

    catch (err) {

        console.error(err);

    }

}

async function loadRecentPayments() {

    const table = document.getElementById("recentPayments");

    if (!table) return;

    const { data } = await supabase

        .from("payments")

        .select("*")

        .order("updated_at", {

            ascending: false

        })

        .limit(10);

    table.innerHTML = "";

    data?.forEach(payment => {

        table.innerHTML += `

<tr>

<td>${payment.username}</td>

<td>${payment.amount} π</td>

<td>${payment.status}</td>

<td>${new Date(payment.updated_at).toLocaleString()}</td>

</tr>

`;

    });

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadDashboard();

        loadRecentPayments();

    }

);
