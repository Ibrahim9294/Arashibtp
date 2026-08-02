/* ==========================================
   Entreprise ARASHI v4.0 - Module Ressources Humaines
   Fichier : js/hr.js
========================================== */

import { supabase } from './supabase.js';
import { createPiPayment } from './pi-payments.js';

let employeesList = [];

/**
 * Charge les données du module RH et initialise la page
 */
export async function loadHrData() {
    const tableBody = document.getElementById("employeesTableBody");
    const btnAdd = document.getElementById("btnAddEmployee");

    if (btnAdd) {
        btnAdd.addEventListener("click", addNewEmployeePrompt);
    }

    try {
        // Récupération des collaborateurs depuis Supabase
        const { data: employees, error } = await supabase
            .from("employees")
            .select("*")
            .order("name", { ascending: true });

        if (error) throw error;

        employeesList = employees || [];
        updateHrStats(employeesList);
        renderEmployeesTable(employeesList, tableBody);

    } catch (err) {
        console.error("Erreur lors du chargement des RH :", err);
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        Aucun collaborateur trouvé ou erreur de connexion à la base de données.
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Calcule et affiche les statistiques RH (Effectif, Présents, Masse Salariale)
 */
function updateHrStats(employees) {
    const totalEl = document.getElementById("statTotalEmployees");
    const presentEl = document.getElementById("statPresentToday");
    const payrollEl = document.getElementById("statTotalPayroll");

    const totalCount = employees.length;
    const presentCount = employees.filter(e => e.status === "present" || e.status === "actif").length;
    const totalPayroll = employees.reduce((sum, e) => sum + (parseFloat(e.salary_pi) || 0), 0);

    if (totalEl) totalEl.textContent = totalCount;
    if (presentEl) presentEl.textContent = presentCount;
    if (payrollEl) payrollEl.textContent = `${totalPayroll.toFixed(2)} π`;
}

/**
 * Génère les lignes du tableau des employés
 */
function renderEmployeesTable(employees, tableBody) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Aucun collaborateur répertorié.
                </td>
            </tr>
        `;
        return;
    }

    employees.forEach(emp => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid var(--border)";

        const isPresent = emp.status === "present" || emp.status === "actif";

        row.innerHTML = `
            <td style="padding: 10px; font-weight: 600;">${emp.name || 'Nom Inconnu'}</td>
            <td style="padding: 10px; color: var(--text-muted);">${emp.position || 'Employé'}</td>
            <td style="padding: 10px; color: #ffc107; font-weight: bold;">${emp.salary_pi || 0} π</td>
            <td style="padding: 10px;">
                <span class="badge ${isPresent ? 'badge-success' : 'badge-warning'}">
                    ${isPresent ? 'Présent' : 'Absent'}
                </span>
            </td>
            <td style="padding: 10px;">
                <button class="btn btn-warning pay-salary-btn" data-id="${emp.id}" data-name="${emp.name}" data-salary="${emp.salary_pi}" style="padding: 5px 10px; font-size: 0.8rem;">
                    <i class="fa-solid fa-coins"></i> Verser Salaire
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Attachement de la fonction de versation de salaire en Pi
    document.querySelectorAll(".pay-salary-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const name = e.currentTarget.getAttribute("data-name");
            const salary = parseFloat(e.currentTarget.getAttribute("data-salary"));

            if (typeof createPiPayment === 'function') {
                createPiPayment(salary, `Paiement Salaire Pi: ${name}`, { employee_name: name, type: "payroll" });
            } else {
                alert(`Paiement de ${salary} π initialisé pour ${name}.`);
            }
        });
    });
}

/**
 * Formulaire rapide d'ajout de collaborateur
 */
async function addNewEmployeePrompt() {
    const name = prompt("Nom et Prénom du collaborateur :");
    if (!name) return;
    const position = prompt("Poste / Fonction (Ex: Topographe, Ingénieur BTP) :");
    const salary = parseFloat(prompt("Salaire mensuel en Pi (π) :")) || 0;

    try {
        const { data, error } = await supabase
            .from("employees")
            .insert([{ name, position, salary_pi: salary, status: "actif" }])
            .select();

        if (error) throw error;

        alert(`Collaborateur ${name} ajouté avec succès !`);
        loadHrData();
    } catch (err) {
        console.error("Erreur lors de l'ajout :", err);
        alert("Impossible d'ajouter le collaborateur à Supabase.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadHrData();
});