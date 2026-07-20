// =====================================
// ARASHI v3.0
// vendor.js
// =====================================

import { supabase, STORAGE_BUCKET } from "./supabase.js";

window.saveProduct = async function () {

    try {

        const title =
            document.getElementById("title").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const price =
            Number(document.getElementById("price").value);

        const stock =
            Number(document.getElementById("stock").value);

        const image =
            document.getElementById("image").files[0];

        if (!title || !price) {

            alert("Veuillez remplir les champs obligatoires.");

            return;

        }

        let imagePath = null;

        if (image) {

            imagePath =
                Date.now() + "_" + image.name;

            const { error: uploadError } =
                await supabase.storage

                .from(STORAGE_BUCKET)

                .upload(imagePath, image);

            if (uploadError)
                throw uploadError;

        }

        const savedUser =
            JSON.parse(localStorage.getItem("pi_user"));

        if (!savedUser) {

            alert("Connectez-vous avec Pi.");

            return;

        }

        const { data: vendor } =
            await supabase

            .from("vendors")

            .select("id")

            .eq("profile_id", savedUser.id)

            .single();

        await supabase

            .from("products")

            .insert({

                vendor_id: vendor?.id,

                title,

                description,

                price_pi: price,

                stock,

                image_url: imagePath

            });

        alert("Produit publié.");

        location.reload();

    }

    catch (err) {

        console.error(err);

        alert("Erreur lors de l'enregistrement.");

    }

};

async function loadVendorProducts() {

    const container =
        document.getElementById("vendorProducts");

    if (!container) return;

    const saved =
        JSON.parse(localStorage.getItem("pi_user"));

    if (!saved) return;

    const { data: vendor } =
        await supabase

        .from("vendors")

        .select("id")

        .eq("profile_id", saved.id)

        .single();

    if (!vendor) return;

    const { data: products } =
        await supabase

        .from("products")

        .select("*")

        .eq("vendor_id", vendor.id)

        .order("created_at", {
            ascending: false
        });

    container.innerHTML = "";

    products?.forEach(product => {

        container.innerHTML += `

        <div class="service-card">

            <h3>${product.title}</h3>

            <p>${product.description}</p>

            <strong>${product.price_pi} π</strong>

            <br><br>

            <button
            onclick="deleteProduct('${product.id}')">

            Supprimer

            </button>

        </div>

        `;

    });

}

window.deleteProduct = async function(id){

if(!confirm("Supprimer ce produit ?")) return;

await supabase

.from("products")

.delete()

.eq("id",id);

loadVendorProducts();

};

document.addEventListener(

"DOMContentLoaded",

loadVendorProducts

);