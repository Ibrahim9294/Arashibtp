/* ==========================================
   Entreprise ARASHI v4.0 - Module Administration
   Fichier : js/admin.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Charge l'ensemble des données d'administration (stats, annonces, utilisateurs)
 */
export async function loadAdminData() {
    await Promise.all([
        loadAdminStats(),
        loadAdminProperties(),
        loadAdminUsers()
    ]);
}

/**
 * Calcule et affiche les statistiques globales du système
 */
async function loadAdminStats() {
    try {
        // Nombre total d'utilisateurs
        const { count: usersCount, error: usersErr } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

        if (!usersErr && usersCount !== null) {
            const userEl = document.getElementById("adminTotalUsers");
            if (userEl) userEl.textContent = usersCount;
        }

        // Nombre total d'offres / biens
        const { count: itemsCount, error: itemsErr } = await supabase
            .from("properties")
            .select("*", { count: "exact", head: true });

        if (!itemsErr && itemsCount !== null) {
            const itemEl = document.getElementById("adminTotalItems");
            if (itemEl) itemEl.textContent = itemsCount;
        }

        // Nombre de vendeurs distincts
        const { data: vendorData, error: vendorErr } = await supabase
            .from("properties")
            .select("username");

        if (!vendorErr && vendorData) {
            const uniqueVendors = new Set(vendorData.map(v => v.username).filter(Boolean));
            const vendorEl = document.getElementById("adminTotalVendors");
            if (vendorEl) vendorEl.textContent = uniqueVendors.size;
        }

        // Volume des transactions validées
        const { data: orders, error: ordersErr } = await supabase
            .from("orders")
            .select("amount")
            .eq("status", "completed");

        if (!ordersErr && orders) {
            const totalVolume = orders.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0);
            const volumeEl = document.getElementById("adminTotalVolume");
            if (volumeEl) volumeEl.textContent = `${totalVolume.toFixed(2)} π`;
        }

    } catch (err) {
        console.error("Erreur de chargement des statistiques d'administration :", err);
    }
}

/**
 * Récupère et affiche la liste de tous les biens/services publiés
 */
async function loadAdminProperties() {
    const tbody = document.getElementById("adminPropertiesTable");
    if (!tbody) return;

    try {
        const { data: properties, error } = await supabase
            .from("properties")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        tbody.innerHTML = "";

        if (!properties || properties.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Aucune offre cataloguée pour le moment.
                    </td>
                </tr>
            `;
            return;
        }

        properties.forEach(item => {
            const price = parseFloat(item.price_pi || item.price || 0).toFixed(2);
            const row = document.createElement("tr");
            row.style.borderBottom = "1px solid var(--border)";

            row.innerHTML = `
                <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">${item.id}</td>
                <td style="padding: 12px 10px; font-weight: bold;">${item.title || 'Sans titre'}</td>
                <td style="padding: 12px 10px; color: #f39c12; font-weight: bold;">${price} π</td>
                <td style="padding: 12px 10px; color: var(--text-muted);">${item.username || 'ARASHI Official'}</td>
                <td style="padding: 12px 10px; text-align: right;">
                    <button class="btn btn-danger delete-property-btn" data-id="${item.id}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-trash"></i> Supprimer
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Attachement des écouteurs de suppression
        document.querySelectorAll(".delete-property-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm(`Voulez-vous vraiment supprimer l'offre ID : ${id} ?`)) {
                    await deleteProperty(id);
                }
            });
        });

    } catch (err) {
        console.error("Erreur lors de la récupération des offres :", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Erreur de chargement des offres.
                </td>
            </tr>
        `;
    }
}

/**
 * Supprime une offre spécifique de Supabase
 */
async function deleteProperty(id) {
    try {
        const { error } = await supabase
            .from("properties")
            .delete()
            .eq("id", id);

        if (error) throw error;

        loadAdminData();
    } catch (err) {
        console.error("Erreur de suppression de l'offre :", err);
        alert("Impossible de supprimer cette offre.");
    }
}

/**
 * Récupère et affiche la liste des utilisateurs inscrits
 */
async function loadAdminUsers() {
    const tbody = document.getElementById("adminUsersTable");
    if (!tbody) return;

    try {
        const { data: users, error } = await supabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        tbody.innerHTML = "";

        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Aucun utilisateur enregistré.
                    </td>
                </tr>
            `;
            return;
        }

        users.forEach(user => {
            const row = document.createElement("tr");
            row.style.borderBottom = "1px solid var(--border)";

            row.innerHTML = `
                <td style="padding: 12px 10px; font-family: monospace; font-size: 0.85rem;">${user.uid || '-'}</td>
                <td style="padding: 12px 10px; font-weight: bold;">${user.username || 'Inconnu'}</td>
                <td style="padding: 12px 10px;"><span class="badge badge-warning">${user.role || 'Utilisateur'}</span></td>
                <td style="padding: 12px 10px; color: var(--text-muted);">
                    ${user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs :", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Erreur de récupération des comptes.
                </td>
            </tr>
        `;
    }
}

/**
 * Gestion du formulaire de création d'offre par l'administrateur
 */
function initAdminForm() {
    const form = document.getElementById("adminAddPropertyForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("adminItemTitle").value.trim();
        const price = parseFloat(document.getElementById("adminItemPrice").value);
        const imageUrl = document.getElementById("adminItemImage").value.trim();
        const description = document.getElementById("adminItemDescription").value.trim();

        if (!title || isNaN(price)) return;

        try {
            const { error } = await supabase
                .from("properties")
                .insert([{
                    title,
                    price_pi: price,
                    image_url: imageUrl || null,
                    description: description || null,
                    username: "ARASHI Official"
                }]);

            if (error) throw error;

            form.reset();
            loadAdminData();
            alert("Offre publiée avec succès !");

        } catch (err) {
            console.error("Erreur lors de la publication d'offre :", err);
            alert("Erreur lors de la publication de l'offre.");
        }
    });
}

// Rendre disponible globalement pour le bouton "Actualiser" de admin.html
window.loadAdminData = loadAdminData;

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    loadAdminData();
    initAdminForm();
});