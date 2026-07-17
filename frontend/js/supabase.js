/* ==========================================
   ENTREPRISE ARASHI v3.0 - Configuration Supabase
========================================== */

// Import officiel du SDK Supabase via module ESM
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Vos identifiants de projet réels et vérifiés
const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu"; 

// Exportation pour les autres fichiers modules (marketplace.js, auth.js, etc.)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const STORAGE_BUCKET = "products";

// On attache également le client à l'objet global window au cas où un script classique en aurait besoin
window.supabaseClient = supabase;

document.addEventListener("DOMContentLoaded", () => {
    console.log("🗄️ Entreprise ARASHI - Connexion Supabase établie avec succès !");
    fetchRealStats();
});

/**
 * Récupère les vraies statistiques depuis tes tables Supabase
 */
async function fetchRealStats() {
    try {
        console.log("📊 Récupération des statistiques dynamiques depuis Supabase...");

        // 1. Nombre total d'utilisateurs
        const { count: usersCount, error: userError } = await supabase
            .from('profiles') 
            .select('*', { count: 'exact', head: true });

        // 2. Nombre total de vendeurs
        const { count: vendorsCount, error: vendorError } = await supabase
            .from('vendors') 
            .select('*', { count: 'exact', head: true });

        // 3. Nombre total de biens immobiliers
        const { count: propertiesCount, error: propError } = await supabase
            .from('properties') 
            .select('*', { count: 'exact', head: true });

        // Mise à jour de l'affichage de l'index.html
        if (!userError && usersCount !== null) {
            document.getElementById("totalUsers").innerText = usersCount + "+";
        }
        if (!vendorError && vendorsCount !== null) {
            document.getElementById("totalVendors").innerText = vendorsCount;
        }
        if (!propError && propertiesCount !== null) {
            document.getElementById("totalProperties").innerText = propertiesCount;
        }

    } catch (err) {
        console.warn("⚠️ Impossible de charger les statistiques live, conservation des valeurs par défaut.", err);
    }
                    }
               
