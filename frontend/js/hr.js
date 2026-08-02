/* ==========================================
   Entreprise ARASHI v4.0 - Module HR & Payroll
   Fichier : js/hr.js
========================================== */

import { supabase } from './supabase.js';

/**
 * Charge l'effectif et met à jour le tableau RH
 */
export async function loadHRData() {
    const tbody = document.getElementById("hrEmployeeTable");

    try {
        const { data: employees, error } = await supabase
            .from("employees")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (tbody) {
            tbody.innerHTML = "";

            if (!employees || employees.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px;" class="text-muted">
                            Aucun employé inscrit dans la base de données.
                        </td>
                    </tr>
                `;
            } else {
                let payrollTotal = 0;

                employees.forEach(emp => {
                    payrollTotal += parseFloat(emp.salary_pi || 0);

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td style="font-family: monospace;">${emp.id.substring(0, 8)}...</td>
                        <td style="font-weight: bold;">${emp.full_name || emp.username}</td>
                        <td>${emp.position || 'Non spécifié'}</td>
                        <td>${emp.department || 'Général'}</td>
                        <td style="color: #f39c12; font-weight: bold;">${emp.salary_pi || 0} π</td>
                        <td>
                            <span class="badge ${emp.status === 'actif' ? 'badge-success' : 'badge-danger'}">
                                ${emp.status || 'actif'}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="paySalary('${emp.id}', ${emp.salary_pi})">
                                <i class="fa-solid fa-money-bill-transfer"></i> Payer en π
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Calculs statistiques
                const totalEl = document.getElementById("statTotalEmployees");
                const payrollEl = document.getElementById("statTotalPayroll");
                
                if (totalEl) totalEl.textContent = employees.length;
                if (payrollEl) payrollEl.textContent = `${payrollTotal.toFixed(2)} π`;
            }
        }
    } catch (err) {
        console.error("Erreur chargement RH :", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadHRData();
});