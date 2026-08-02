/* ==========================================
   Entreprise ARASHI v4.0 & v3.0
   Fichier : js/admin.js - Gestion Admin Supabase & Pi
========================================== */

import { supabase } from "./supabase.js";

/**
 * Charge les statistiques globales (KPI) et remplit les compteurs
 */
export async function loadAdminMetrics() {
    try {
        const [
            { count: usersCount },
            { count: itemsCount },
            { count: vendorsCount },
            { data: paymentsData }
        ] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("properties").select("*", { count: "exact", head: true }),
            supabase.from("vendors").select("*", { count: "exact", head: true }),
            supabase.from("payments").select("amount").eq("status", "COMPLETED")
        ]);

        // Calcul du volume total des transactions Pi complétées
        const totalVolume = (paymentsData || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // Injection dans le DOM
        const usersEl = document.getElementById("adminTotalUsers");
        if (usersEl) usersEl.textContent = usersCount || 0;

        const itemsEl = document.getElementById("adminTotalItems");
        if (itemsEl) itemsEl.textContent = itemsCount || 0;

        const vendorsEl = document.getElementById("adminTotalVendors");
        if (vendorsEl) vendorsEl.textContent = vendorsCount || 0;

        const volumeEl = document.getElementById("adminTotalVolume");
        if (volumeEl) volumeEl.textContent = totalVolume.toFixed(2) + " π";

    } catch (error) {
        console.error("❌ Erreur de chargement des statistiques Admin :", error);
    }
}

/**
 * Charge la liste complète des offres/biens/services pour le tableau admin
 */
export async function loadAdminProperties() {
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
                        Aucune offre enregistrée dans la base de données.
                    </td>
                </tr>
            `;
            return;
        }

        properties.forEach(item => {
            const price = item.price_pi || item.price || 0;
            const title = item.title || "Annonce sans titre";
            const owner = item.username || item.vendor_name || "Système ARASHI";

            const row = document.createElement("tr");
            row.style.borderBottom = "1px solid var(--border)";
            row.innerHTML = `
                <td style="padding: 12px 10px; font-size: 0.85rem; font-family: monospace;">${item.id}</td>
                <td style="padding: 12px 10px; font-weight: bold;">${title}</td>
                <td style="padding: 12px 10px; color: #f39c12; font-weight: bold;">${price} π</td>
                <td style="padding: 12px 10px; color: var(--text-muted);">${owner}</td>
                <td style="padding: 12px 10px; text-align: right;">
                    <button class="btn btn-danger btn-delete-item" 
                            data-id="${item.id}"
                            style="padding: 6px 12px; font-size: 0.8rem; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-trash"></i> Supprimer
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Attachement des événements de suppression
        document.querySelectorAll(".btn-delete-item").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm(`Êtes-vous sûr de vouloir supprimer l'offre ID : ${id} ?`)) {
                    await deleteProperty(id);
                }
            });
        });

    } catch (error) {
        console.error("❌ Erreur de chargement des offres admin :", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #e74c3c;">
                    Erreur de connexion à Supabase.
                </td>
            </tr>
        `;
    }
}

/**
 * Supprime un bien ou service de la table Supabase
 */
async function deleteProperty(id) {
    try {
        const { error } = await supabase
            .from("properties")
            .delete()
            .eq("id", id);

        if (error) throw error;

        alert("✅ Annonce supprimée avec succès !");
        await loadAdminProperties();
        await loadAdminMetrics();
    } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        alert("Impossible de supprimer cette annonce : " + error.message);
    }
}

/**
 * Charge la liste des profils utilisateurs inscrits
 */
export async function loadAdminUsers() {
    const tbody = document.getElementById("adminUsersTable");
    if (!tbody) return;

    try {
        const { data: users, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        tbody.innerHTML = "";

        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Aucun utilisateur enregistré pour le moment.
                    </td>
                </tr>
            `;
            return;
        }

        users.forEach(user => {
            const row = document.createElement("tr");
            row.style.borderBottom = "1px solid var(--border)";
            
            const dateStr = user.created_at ? new Date(user.created_at).toLocaleDateString() : "-";
            const roleBadge = user.role === "admin" 
                ? `<span class="badge badge-danger" style="background: #e74c3c; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">Admin</span>` 
                : `<span class="badge" style="background: var(--border); color: var(--text); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">Utilisateur</span>`;

            row.innerHTML = `
                <td style="padding: 12px 10px; font-size: 0.85rem; font-family: monospace;">${user.pi_uid || '-'}</td>
                <td style="padding: 12px 10px; font-weight: bold;">@${user.username || 'Pioneer'}</td>
                <td style="padding: 12px 10px;">${roleBadge}</td>
                <td style="padding: 12px 10px; color: var(--text-muted);">${dateStr}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Erreur de chargement des utilisateurs :", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #e74c3c;">
                    Erreur de chargement des profils.
                </td>
            </tr>
        `;
    }
}

/**
 * Gère l'envoi du formulaire d'ajout direct d'offre (Admin)
 */
function setupFormSubmission() {
    const form = document.getElementById("adminAddPropertyForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("adminItemTitle").value.trim();
        const price = parseFloat(document.getElementById("adminItemPrice").value);
        const imageUrl = document.getElementById("adminItemImage").value.trim();
        const description = document.getElementById("adminItemDescription").value.trim();

        const currentUser = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;

        if (!title || isNaN(price)) {
            alert("Veuillez renseigner un titre et un prix valide.");
            return;
        }

        try {
            const { error } = await supabase
                .from("properties")
                .insert([{
                    title: title,
                    price_pi: price,
                    image_url: imageUrl || "https://via.placeholder.com/300x200?text=Offre+ARASHI",
                    description: description,
                    username: currentUser ? currentUser.username : "Admin System",
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert("🚀 Offre publiée avec succès sur le réseau !");
            form.reset();

            // Actualisation des vues
            await loadAdminProperties();
            await loadAdminMetrics();

        } catch (error) {
            console.error("❌ Erreur lors de la publication :", error);
            alert("Erreur de création d'offre : " + error.message);
        }
    });
}

/**
 * Fonction maîtresse d'actualisation complète
 */
window.loadAdminData = async function() {
    await Promise.all([
        loadAdminMetrics(),
        loadAdminProperties(),
        loadAdminUsers()
    ]);
};

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    window.loadAdminData();
    setupFormSubmission();
});