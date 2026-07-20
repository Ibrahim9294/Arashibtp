// =====================================
// ARASHI v3.0
// admin.js
// =====================================

import { supabase } from "./supabase.js";

async function loadUsers() {

    const table = document.getElementById("adminUsersLogs");

    if (!table) return;

    try {

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        table.innerHTML = "";

        data.forEach(user => {

            table.innerHTML += `
            <tr>
                <td>@${user.username}</td>
                <td>${user.pi_uid || "-"}</td>
                <td>${user.role || "user"}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}

async function loadPayments() {

    const table = document.getElementById("adminPaymentsLogs");

    if (!table) return;

    try {

        const { data, error } = await supabase
            .from("payments")
            .select("*")
            .order("updated_at", { ascending: false });

        if (error) throw error;

        table.innerHTML = "";

        data.forEach(payment => {

            table.innerHTML += `
            <tr>
                <td>${payment.pi_payment_id}</td>
                <td>${payment.username}</td>
                <td>${payment.amount} π</td>
                <td>${payment.status}</td>
                <td>${new Date(payment.updated_at).toLocaleString()}</td>
            </tr>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}

async function loadStatistics() {

    try {

        const [

            users,

            vendors,

            products,

            properties,

            payments

        ] = await Promise.all([

            supabase.from("profiles").select("*", {
                count: "exact",
                head: true
            }),

            supabase.from("vendors").select("*", {
                count: "exact",
                head: true
            }),

            supabase.from("products").select("*", {
                count: "exact",
                head: true
            }),

            supabase.from("properties").select("*", {
                count: "exact",
                head: true
            }),

            supabase.from("payments").select("*")

        ]);

        let revenue = 0;

        payments.data?.forEach(p => {

            if (p.status === "completed") {

                revenue += Number(p.amount);

            }

        });

        const set = (id, value) => {

            const el = document.getElementById(id);

            if (el) el.textContent = value;

        };

        set("adminUsers", users.count || 0);
        set("adminVendors", vendors.count || 0);
        set("adminProducts", products.count || 0);
        set("adminProperties", properties.count || 0);
        set("adminRevenue", revenue + " π");

    } catch (err) {

        console.error(err);

    }

}

window.approveVendor = async function(id) {

    await supabase
        .from("vendors")
        .update({
            status: "approved"
        })
        .eq("id", id);

    alert("Vendeur approuvé.");

};

window.suspendVendor = async function(id) {

    await supabase
        .from("vendors")
        .update({
            status: "suspended"
        })
        .eq("id", id);

    alert("Vendeur suspendu.");

};

window.deleteProduct = async function(id) {

    if (!confirm("Supprimer ce produit ?")) return;

    await supabase
        .from("products")
        .delete()
        .eq("id", id);

    alert("Produit supprimé.");

};

document.addEventListener("DOMContentLoaded", () => {

    loadUsers();

    loadPayments();

    loadStatistics();

});
