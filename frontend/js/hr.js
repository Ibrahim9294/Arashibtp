// =====================================
// ARASHI ERP v4.0
// js/hr.js
// =====================================

import { supabase } from "./supabase.js";

// Charger les employés
async function loadEmployees() {

    const table = document.getElementById("employeesTable");

    if (!table) return;

    const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = `
        <tr>
            <td colspan="5">Aucun employé enregistré.</td>
        </tr>`;
        return;
    }

    let salaryTotal = 0;

    data.forEach(employee => {

        salaryTotal += Number(employee.salary || 0);

        table.innerHTML += `
        <tr>
            <td>${employee.name}</td>
            <td>${employee.position}</td>
            <td>${employee.email}</td>
            <td>${employee.phone}</td>
            <td>${employee.salary} π</td>
        </tr>
        `;

    });

    document.getElementById("totalEmployees").textContent = data.length;
    document.getElementById("salaryTotal").textContent =
        salaryTotal.toFixed(2) + " π";

}

// Ajouter un employé
const saveBtn = document.getElementById("saveEmployee");

if (saveBtn) {

    saveBtn.addEventListener("click", async () => {

        const name = document.getElementById("employeeName").value;
        const position = document.getElementById("employeePosition").value;
        const email = document.getElementById("employeeEmail").value;
        const phone = document.getElementById("employeePhone").value;
        const salary = document.getElementById("employeeSalary").value;

        if (!name || !position) {
            alert("Veuillez remplir les champs obligatoires.");
            return;
        }

        const { error } = await supabase
            .from("employees")
            .insert([
                {
                    name,
                    position,
                    email,
                    phone,
                    salary
                }
            ]);

        if (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement.");
            return;
        }

        alert("Employé ajouté avec succès.");

        location.reload();

    });

}

document.addEventListener("DOMContentLoaded", loadEmployees);