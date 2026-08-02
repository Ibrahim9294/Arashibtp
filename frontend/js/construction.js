/* ==========================================
   Entreprise ARASHI v4.0 - Module Construction BTP
   Fichier : js/construction.js
========================================== */

import { supabase } from './supabase.js';
import { createPiPayment } from './pi-payments.js';

/**
 * Initialise le module de construction BTP
 */
export async function loadConstructionData() {
    const tableBody = document.getElementById("constructionProjectsTable");
    const quoteForm = document.getElementById("constructionQuoteForm");
    const areaInput = document.getElementById("constructionArea");
    const typeSelect = document.getElementById("constructionType");
    const priceEstimateInput = document.getElementById("constructionPriceEstimate");

    // Tarifs indicatifs par type de projet (en Pi par m²)
    const rateCard = {
        Pavageroad: 0.85,
        GrosOeuvre: 2.50,
        BatimentComplet: 5.00,
        Renovation: 1.20
    };

    // Calcul dynamique de l'estimation du devis
    function calculateEstimate() {
        if (!areaInput || !priceEstimateInput || !typeSelect) return;
        const area = parseFloat(areaInput.value) || 0;
        const rate = rateCard[typeSelect.value] || 1.0;
        const total = area * rate;
        priceEstimateInput.value = `${total.toFixed(2)} π`;
    }

    if (areaInput && typeSelect) {
        areaInput.addEventListener("input", calculateEstimate);
        typeSelect.addEventListener("change", calculateEstimate);
    }

    // Traitement de la soumission du devis
    if (quoteForm) {
        quoteForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const type = typeSelect.value;
            const location = document.getElementById("constructionLocation").value;
            const area = parseFloat(areaInput.value) || 0;
            const priceStr = priceEstimateInput.value;
            const pricePi = parseFloat(priceStr.replace(" π", "")) || 0;

            if (pricePi <= 0) {
                alert("Veuillez saisir une superficie valide.");
                return;
            }

            if (typeof createPiPayment === 'function') {
                createPiPayment(pricePi, `Chantier BTP (${type}) - ${area}m²`, {
                    project_type: type,
                    location: location,
                    area_m2: area
                });
            } else {
                alert(`Devis enregistré : ${type} (${area} m²) à ${location} pour ${pricePi} π.`);
            }
        });
    }

    // Chargement des chantiers depuis la base Supabase
    try {
        const { data: projects, error } = await supabase
            .from("construction_projects")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        updateConstructionStats(projects || []);
        renderConstructionProjects(projects || [], tableBody);

    } catch (err) {
        console.error("Erreur chargement chantiers BTP :", err);
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 15px; color: var(--text-muted);">
                        Aucun chantier enregistré pour le moment.
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Mise à jour des cartes de statistiques des travaux
 */
function updateConstructionStats(projects) {
    const activeEl = document.getElementById("statActiveProjects");
    const completedEl = document.getElementById("statCompletedProjects");
    const pendingEl = document.getElementById("statPendingQuotes");

    const active = projects.filter(p => p.status === 'en_cours').length;
    const completed = projects.filter(p => p.status === 'termine').length;
    const pending = projects.filter(p => p.status === 'devis' || !p.status).length;

    if (activeEl) activeEl.textContent = active;
    if (completedEl) completedEl.textContent = completed;
    if (pendingEl) pendingEl.textContent = pending;
}

/**
 * Rendu du tableau des projets de construction
 */
function renderConstructionProjects(projects, tableBody) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (projects.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Aucun chantier ou devis enregistré.
                </td>
            </tr>
        `;
        return;
    }

    projects.forEach(p => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid var(--border)";

        let badgeClass = "badge-warning";
        if (p.status === "en_cours") badgeClass = "badge-info";
        if (p.status === "termine") badgeClass = "badge-success";

        row.innerHTML = `
            <td style="padding: 10px; font-weight: 600;">${p.project_type || 'Chantier BTP'}</td>
            <td style="padding: 10px; color: var(--text-muted);">${p.area_m2 || 0} m²</td>
            <td style="padding: 10px; color: #d35400; font-weight: bold;">${p.price_pi || 0} π</td>
            <td style="padding: 10px;">
                <span class="badge ${badgeClass}">
                    ${p.status || 'Devis'}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadConstructionData();
});