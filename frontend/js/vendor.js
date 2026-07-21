// =====================================
// ARASHI v3.0
// vendor.js
// =====================================

import { supabase, STORAGE_BUCKET } from "./supabase.js";

const user = JSON.parse(localStorage.getItem("pi_user") || "null");

// =============================
// Charger les produits
// =============================

async function loadVendorProducts() {

    if (!user) return;

    const container = document.getElementById("vendorProducts");

    if (!container) return;

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("username", user.username)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    container.innerHTML = "";

    data.forEach(product => {

        let image = "";

        if (product.image_url) {

            image = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(product.image_url)
                .data.publicUrl;

        }

        container.innerHTML += `

        <div class="service-card">

            <img
            src="${image}"
            style="
            width:100%;
            height:180px;
            object-fit:cover;
            border-radius:10px;
            ">

            <h3>${product.title}</h3>

            <p>${product.description}</p>

            <h4>${product.price_pi} π</h4>

            <button onclick="editProduct('${product.id}')">

            Modifier

            </button>

            <button onclick="deleteProduct('${product.id}')">

            Supprimer

            </button>

        </div>

        `;

    });

}

// =============================
// Upload image
// =============================

window.uploadProduct = async function () {

    const file =
        document.getElementById("productImage").files[0];

    const title =
        document.getElementById("productTitle").value;

    const description =
        document.getElementById("productDescription").value;

    const price =
        Number(document.getElementById("productPrice").value);

    if (!file) {

        alert("Choisir une image");

        return;

    }

    const filename =
        Date.now() + "_" + file.name;

    const upload =
        await supabase.storage

        .from(STORAGE_BUCKET)

        .upload(filename, file);

    if (upload.error) {

        alert(upload.error.message);

        return;

    }

    await supabase

        .from("products")

        .insert({

            username: user.username,

            title,

            description,

            price_pi: price,

            image_url: filename

        });

    alert("Produit ajouté.");

    loadVendorProducts();

};

// =============================
// Modifier
// =============================

window.editProduct = async function (id) {

    const title =
        prompt("Nouveau titre");

    if (!title) return;

    await supabase

        .from("products")

        .update({

            title

        })

        .eq("id", id);

    loadVendorProducts();

};

// =============================
// Supprimer
// =============================

window.deleteProduct = async function (id) {

    if (!confirm("Supprimer ?"))

        return;

    await supabase

        .from("products")

        .delete()

        .eq("id", id);

    loadVendorProducts();

};

// =============================
// Revenus vendeur
// =============================

async function loadRevenue() {

    const revenue =
        document.getElementById("vendorRevenue");

    if (!revenue)

        return;

    const { data } =
        await supabase

        .from("payments")

        .select("*")

        .eq("username", user.username)

        .eq("status", "completed");

    let total = 0;

    data.forEach(payment => {

        total += Number(payment.amount);

    });

    revenue.textContent =
        total.toFixed(2) + " π";

}

// =============================
// Commandes
// =============================

async function loadOrders() {

    const table =
        document.getElementById("vendorOrders");

    if (!table)

        return;

    const { data } =
        await supabase

        .from("orders")

        .select("*")

        .eq("vendor_username", user.username);

    table.innerHTML = "";

    data.forEach(order => {

        table.innerHTML += `

        <tr>

        <td>${order.username}</td>

        <td>${order.amount} π</td>

        <td>${order.status}</td>

        </tr>

        `;

    });

}

// =============================

document.addEventListener(

"DOMContentLoaded",

() => {

    loadVendorProducts();

    loadRevenue();

    loadOrders();

}

);