// =====================================
// ARASHI v3.0
// vendor.js
// =====================================

import { supabase, STORAGE_BUCKET } from "./supabase.js";

const form = document.getElementById("productForm");
const productsContainer = document.getElementById("vendorProducts");

let currentUser = JSON.parse(localStorage.getItem("pi_user") || "null");

// =========================
// Charger les produits
// =========================

async function loadVendorProducts() {

    if (!currentUser) return;

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("username", currentUser.username)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    renderProducts(data || []);
}

// =========================
// Affichage
// =========================

function renderProducts(products) {

    if (!productsContainer) return;

    if (products.length === 0) {

        productsContainer.innerHTML =
        "<p>Aucun produit.</p>";

        return;

    }

    productsContainer.innerHTML = "";

    products.forEach(product => {

        let image = "";

        if (product.image_url) {

            image = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(product.image_url)
            .data.publicUrl;

        }

        productsContainer.innerHTML += `

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

            <button
            onclick="editProduct('${product.id}')">

            Modifier

            </button>

            <button
            onclick="deleteProduct('${product.id}')">

            Supprimer

            </button>

        </div>

        `;

    });

}

// =========================
// Ajouter produit
// =========================

if (form) {

form.addEventListener("submit", async e => {

e.preventDefault();

const title =
document.getElementById("title").value;

const description =
document.getElementById("description").value;

const price =
Number(
document.getElementById("price").value
);

const image =
document.getElementById("image").files[0];

let imagePath = null;

if (image) {

const filename =
Date.now() + "_" + image.name;

const upload =
await supabase.storage
.from(STORAGE_BUCKET)
.upload(filename, image);

if (!upload.error) {

imagePath = filename;

}

}

const { error } =
await supabase
.from("products")
.insert({

username:
currentUser.username,

title,

description,

price_pi: price,

image_url: imagePath

});

if (error) {

console.error(error);

alert("Erreur.");

return;

}

alert("Produit ajouté.");

form.reset();

loadVendorProducts();

});

}

// =========================
// Modifier
// =========================

window.editProduct =
async function(id) {

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

// =========================
// Supprimer
// =========================

window.deleteProduct =
async function(id) {

if (!confirm("Supprimer ?"))

return;

await supabase
.from("products")
.delete()
.eq("id", id);

loadVendorProducts();

};

document.addEventListener(

"DOMContentLoaded",

loadVendorProducts

);