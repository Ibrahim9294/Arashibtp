/* ==========================================
   Entreprise ARASHI v4.0 - Module Vendor Center
   Fichier : js/vendor.js
========================================== */

import { supabase, STORAGE_BUCKET } from './supabase.js';

/**
 * Charge les produits du vendeur connecté
 */
export async function loadVendorProducts() {
    const container = document.getElementById("vendorProductsList");
    if (!container) return;

    const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

    if (!user || (!user.uid && !user.username)) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-muted); grid-column: 1 / -1;">
                Veuillez vous connecter avec Pi Network pour gérer vos produits et votre boutique.
            </div>
        `;
        return;
    }

    const username = user.username || user.uid;

    try {
        container.innerHTML = `<div style="text-align: center; padding: 20px; grid-column: 1 / -1; color: var(--text-muted);">Chargement de vos produits...</div>`;

        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .eq("vendor_username", username)
            .order("created_at", { ascending: false });

        if (error) throw error;

        container.innerHTML = "";

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; color: var(--text-muted); grid-column: 1 / -1;">
                    Vous n'avez publié aucun produit pour le moment. Utilisez le formulaire ci-dessus pour en ajouter un.
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.background = "var(--background)";
            card.style.borderRadius = "10px";
            card.style.border = "1px solid var(--border)";
            card.style.padding = "16px";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.justifyContent = "space-between";

            card.innerHTML = `
                <div>
                    <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 6px; color: var(--text);">${product.name || 'Produit sans nom'}</div>
                    <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">${product.description || ''}</div>
                </div>
                <div>
                    <div style="color: #f39c12; font-weight: bold; font-size: 1.1rem; margin-bottom: 12px;">⚡ ${parseFloat(product.price || 0).toFixed(2)} π</div>
                    <button class="btn btn-danger delete-product-btn" data-id="${product.id}" style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; width: 100%;">
                        <i class="fa-solid fa-trash"></i> Supprimer
                    </button>
                </div>
            `;

            card.querySelector(".delete-product-btn").addEventListener("click", async () => {
                if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
                    await deleteVendorProduct(product.id);
                }
            });

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Erreur chargement produits vendeur :", err);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e74c3c; grid-column: 1 / -1;">
                Erreur lors du chargement de vos produits.
            </div>
        `;
    }
}

/**
 * Ajout d'un nouveau produit par le vendeur
 */
export async function handleAddProductForm(event) {
    if (event) event.preventDefault();

    const user = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;
    if (!user || (!user.uid && !user.username)) {
        alert("Veuillez vous connecter avec Pi Network.");
        return;
    }

    const nameInput = document.getElementById("productName");
    const descInput = document.getElementById("productDescription");
    const priceInput = document.getElementById("productPrice");

    if (!nameInput || !priceInput) return;

    const name = nameInput.value.trim();
    const description = descInput ? descInput.value.trim() : "";
    const price = parseFloat(priceInput.value);

    if (!name || isNaN(price) || price <= 0) {
        alert("Veuillez remplir correctement le nom et le prix du produit.");
        return;
    }

    const username = user.username || user.uid;

    try {
        const { error } = await supabase
            .from("products")
            .insert([{
                vendor_username: username,
                name: name,
                description: description,
                price: price,
                created_at: new Date()
            }]);

        if (error) throw error;

        alert("Produit ajouté avec succès !");
        nameInput.value = "";
        if (descInput) descInput.value = "";
        priceInput.value = "";

        loadVendorProducts();
    } catch (err) {
        console.error("Erreur lors de l'ajout du produit :", err);
        alert("Erreur lors de l'enregistrement du produit.");
    }
}

/**
 * Suppression d'un produit vendeur
 */
async function deleteVendorProduct(productId) {
    try {
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", productId);

        if (error) throw error;

        alert("Produit supprimé.");
        loadVendorProducts();
    } catch (err) {
        console.error("Erreur suppression :", err);
        alert("Impossible de supprimer ce produit.");
    }
}

// Initialisation automatique au chargement de la page vendor.html
document.addEventListener("DOMContentLoaded", () => {
    loadVendorProducts();

    const form = document.getElementById("addProductForm");
    if (form) {
        form.addEventListener("submit", handleAddProductForm);
    }
});

// Exposition globale
window.loadVendorProducts = loadVendorProducts;
window.handleAddProductForm = handleAddProductForm;