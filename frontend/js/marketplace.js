// =====================================
// ARASHI v3.0
// marketplace.js
// =====================================

import { supabase, STORAGE_BUCKET } from "./supabase.js";

async function loadMarketplace() {

    const grid = document.getElementById("fullProductsGrid")
        || document.getElementById("popularProductsGrid");

    if (!grid) return;

    try {

        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!products || products.length === 0) {

            grid.innerHTML =
                "<p>Aucun produit disponible.</p>";

            return;

        }

        grid.innerHTML = "";

        products.forEach(product => {

            let image =
                "../assets/images/placeholder.jpg";

            if (product.image_url) {

                const { data } =
                    supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(product.image_url);

                image = data.publicUrl;

            }

            grid.innerHTML += `

            <div class="service-card">

                <img
                src="${image}"
                style="width:100%;height:180px;object-fit:cover;border-radius:10px;">

                <h3>${product.title}</h3>

                <p>${product.description || ""}</p>

                <h4>${product.price_pi} π</h4>

                <button
                class="hero-btn"
                onclick="buy('${product.title.replace(/'/g,"\\'")}',${product.price_pi})">

                Acheter

                </button>

            </div>

            `;

        });

    }

    catch(err){

        console.error(err);

    }

}

const search =
document.getElementById("marketSearch");

if(search){

search.addEventListener("keyup",e=>{

const value=e.target.value.toLowerCase();

document.querySelectorAll(".service-card").forEach(card=>{

card.style.display=
card.innerText.toLowerCase().includes(value)
?"block":"none";

});

});

}

document.addEventListener("DOMContentLoaded",loadMarketplace);