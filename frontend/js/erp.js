// =====================================
// ARASHI ERP v4.0
// js/erp.js
// =====================================

import { supabase } from "./supabase.js";

// Fonction pour compter les lignes d'une table
async function countTable(tableName, elementId) {
    try {
        const { count, error } = await supabase
            .from(tableName)
            .select("*", {
                count: "exact",
                head: true
            });

        if (error) throw error;

        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count ?? 0;
        }

    } catch (err) {
        console.error(`Erreur ${tableName}:`, err.message);
    }
}

// Chargement du tableau de bord ERP
async function loadERP() {

    await countTable("products", "erpStock");

    await countTable("employees", "erpEmployees");

    await countTable("projects", "erpSites");

    await countTable("properties", "erpProperties");

    await countTable("surveys", "erpSurvey");

    await countTable("logistics", "erpLogistics");

    try {

        const { data } = await supabase
            .from("payments")
            .select("amount");

        let total = 0;

        if (data) {
            data.forEach(item => {
                total += Number(item.amount || 0);
            });
        }

        const revenue = document.getElementById("erpAccounting");

        if (revenue) {
            revenue.textContent = total.toFixed(2) + " π";
        }

    } catch (err) {

        console.error(err);

    }

}

document.addEventListener("DOMContentLoaded", loadERP);