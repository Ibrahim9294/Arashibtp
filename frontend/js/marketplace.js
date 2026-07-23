// =====================================
// ARASHI v3.0
// marketplace.js
// =====================================

import { supabase, STORAGE_BUCKET } from "./supabase.js";

const grid = document.getElementById("fullProductsGrid");
const search = document.getElementById("marketSearch");

let products = [];

async function loadProducts() {

    try {

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        products = data || [];

        displayProducts(products);

    } catch (err) {

        console.error(err);

        if (grid) {

            grid.innerHTML = `
            <div class="product-card-placeholder">
                Impossible de charger les produits.
            </div>`;

        }

    }

}

function displayProducts(list) {

    if (!grid) return;

    if (list.length === 0) {

        grid.innerHTML = `
        <div class="product-card-placeholder">
            Aucun produit trouvé.
        </div>`;

        return;

    }

    grid.innerHTML = "";

    list.forEach(product => {

        let image = "https://placehold.co/600x400?text=ARASHI";

        if (product.image_url) {

            if (product.image_url.startsWith("http")) {

                image = product.image_url;

            } else {

                const { data } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(product.image_url);

                image = data?.publicUrl || "https://placehold.co/600x400?text=ARASHI";

            }

        }

        grid.innerHTML += `

        <div class="service-card">

            <img
            src="${image}"
            style="
            width:100%;
            height:180px;
            object-fit:cover;
            border-radius:8px;
            ">

            <h3>${product.title}</h3>

            <p>${product.description || ""}</p>

            <h2 style="color:#0B3D91;">
            ${product.price_pi} π
            </h2>

            <button
            onclick="createPiPayment(${product.price_pi}, 'Achat ${product.title}', '${product.id}')"
            class="hero-btn"
            style="width:100%;margin-top:10px;">

            Acheter

            </button>

        </div>

        `;

    });

}

if (search) {

    search.addEventListener("keyup", e => {

        const value = e.target.value.toLowerCase();

        const result = products.filter(product =>

            (product.title || "")
            .toLowerCase()
            .includes(value)

            ||

            (product.description || "")
            .toLowerCase()
            .includes(value)

        );

        displayProducts(result);

    });

}

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

});
window.refreshMarketplace = function () {
    loadProducts();
};