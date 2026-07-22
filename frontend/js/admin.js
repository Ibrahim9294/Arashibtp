// =====================================
// ARASHI v3.0
// admin.js
// =====================================

import { supabase } from "./supabase.js";

async function loadAdminDashboard() {

    try {

        await Promise.all([
            loadUsers(),
            loadVendors(),
            loadProducts(),
            loadPayments(),
            loadStatistics()
        ]);

    } catch (err) {

        console.error(err);

    }

}

// ============================
// UTILISATEURS
// ============================

async function loadUsers() {

    const table = document.getElementById("adminUsersLogs");

    if (!table) return;

    const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending:false });

    table.innerHTML = "";

    data?.forEach(user => {

        table.innerHTML += `

        <tr>

            <td>${user.username}</td>

            <td>${user.role}</td>

            <td>${user.pi_uid || "-"}</td>

            <td>

                <button onclick="makeAdmin('${user.id}')">

                    Admin

                </button>

                <button onclick="banUser('${user.id}')">

                    Bannir

                </button>

            </td>

        </tr>

        `;

    });

}

// ============================
// VENDEURS
// ============================

async function loadVendors() {

    const table = document.getElementById("adminVendors");

    if (!table) return;

    const { data } = await supabase
        .from("vendors")
        .select("*");

    table.innerHTML = "";

    data?.forEach(vendor => {

        table.innerHTML += `

        <tr>

            <td>${vendor.shop_name}</td>

            <td>${vendor.status}</td>

            <td>

                <button onclick="approveVendor('${vendor.id}')">

                    Valider

                </button>

            </td>

        </tr>

        `;

    });

}

// ============================
// PRODUITS
// ============================

async function loadProducts() {

    const table = document.getElementById("adminProducts");

    if (!table) return;

    const { data } = await supabase
        .from("products")
        .select("*");

    table.innerHTML = "";

    data?.forEach(product => {

        table.innerHTML += `

        <tr>

            <td>${product.title}</td>

            <td>${product.price_pi} π</td>

            <td>

                <button onclick="deleteProduct('${product.id}')">

                    Supprimer

                </button>

            </td>

        </tr>

        `;

    });

}

// ============================
// PAIEMENTS
// ============================

async function loadPayments() {

    const table = document.getElementById("adminPaymentsLogs");

    if (!table) return;

    const { data } = await supabase
        .from("payments")
        .select("*")
        .order("updated_at",{ascending:false});

    table.innerHTML = "";

    data?.forEach(payment => {

        table.innerHTML += `

        <tr>

            <td>${payment.pi_payment_id}</td>

            <td>${payment.username}</td>

            <td>${payment.amount} π</td>

            <td>${payment.status}</td>

        </tr>

        `;

    });

}

// ============================
// STATISTIQUES
// ============================

async function loadStatistics() {

    const [
        users,
        vendors,
        products,
        payments
    ] = await Promise.all([

        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("vendors").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("*")

    ]);

    let revenue = 0;

    payments.data?.forEach(p => {

        if (p.status === "completed") {

            revenue += Number(p.amount);

        }

    });

    const statUsers = document.getElementById("statUsers");
    const statVendors = document.getElementById("statVendors");
    const statProducts = document.getElementById("statProducts");
    const statRevenue = document.getElementById("statRevenue");

    if (statUsers) statUsers.textContent = users.count || 0;
    if (statVendors) statVendors.textContent = vendors.count || 0;
    if (statProducts) statProducts.textContent = products.count || 0;
    if (statRevenue) statRevenue.textContent = revenue.toFixed(2) + " π";

}
// ============================
// ACTIONS ADMIN
// ============================

window.makeAdmin = async function(id){

    await supabase

    .from("profiles")

    .update({

        role:"admin"

    })

    .eq("id",id);

    loadUsers();

};

window.banUser = async function(id){

    await supabase

    .from("profiles")

    .update({

        role:"banned"

    })

    .eq("id",id);

    loadUsers();

};

window.approveVendor = async function(id){

    await supabase

    .from("vendors")

    .update({

        status:"approved"

    })

    .eq("id",id);

    loadVendors();

};

window.deleteProduct = async function(id){

    if(!confirm("Supprimer ce produit ?")) return;

    await supabase

    .from("products")

    .delete()

    .eq("id",id);

    loadProducts();

};

document.addEventListener(

    "DOMContentLoaded",

    loadAdminDashboard

);