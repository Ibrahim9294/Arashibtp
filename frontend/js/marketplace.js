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

        renderProducts(products);

    }

    catch (err) {

        console.error(err);

    }

}

function renderProducts(list) {

    if (!grid) return;

    if (list.length === 0) {

        grid.innerHTML = `
        <div class="product-card-placeholder">
            Aucun produit disponible.
        </div>`;

        return;

    }

    grid.innerHTML = "";

    list.forEach(product => {

        let image =
            "../assets/images/placeholder.jpg";

        if (product.image_url) {

            if (product.image_url.startsWith("http")) {

                image = product.image_url;

            } else {

                const { data } =
                    supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(product.image_url);

                image = data.publicUrl;

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
            border-radius:10px;
            ">

            <h3>${product.title}</h3>

            <p>${product.description || ""}</p>

            <h4>${product.price_pi} π</h4>

            <div
            style="
            display:flex;
            gap:10px;
            margin-top:15px;
            ">

                <button
                onclick="buyProduct('${product.id}')">

                Acheter

                </button>

                <button
                onclick="favoriteProduct('${product.id}')">

                ❤

                </button>

            </div>

        </div>

        `;

    });

}

window.buyProduct = function(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) return;

    window.createPiPayment(

        product.price_pi,

        product.title,

        product.id

    );

};

window.favoriteProduct = function(id) {

    let favorites =
        JSON.parse(

            localStorage.getItem("favorites") || "[]"

        );

    if (!favorites.includes(id)) {

        favorites.push(id);

    }

    localStorage.setItem(

        "favorites",

        JSON.stringify(favorites)

    );

    alert("Produit ajouté aux favoris.");

};

if (search) {

    search.addEventListener("keyup", e => {

        const value =
            e.target.value.toLowerCase();

        renderProducts(

            products.filter(product =>

                product.title
                    .toLowerCase()
                    .includes(value)

                ||

                (product.description || "")
                    .toLowerCase()
                    .includes(value)

            )

        );

    });

}

document.addEventListener(

    "DOMContentLoaded",

    loadProducts

);