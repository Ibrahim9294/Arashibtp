/* ==========================================
   Entreprise ARASHI v4.0 - Configuration Supabase
   Fichier : js/supabase.js
========================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================
// Configuration Supabase
// =============================

const SUPABASE_URL = "https://cjmunzphzqazivbkgrdq.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

// =============================
// Client Supabase
// =============================

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

// =============================
// Storage Bucket
// =============================

export const STORAGE_BUCKET = "products";

// =============================
// Vérification connexion
// =============================

export async function checkSupabaseConnection() {
    try {
        const { error } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);

        if (error) {
            console.error("❌ Supabase :", error.message);
        } else {
            console.log("✅ Supabase connecté");
        }
    } catch (err) {
        console.error("Erreur de connexion Supabase :", err);
    }
}

// =============================
// Vérification Bucket Storage
// =============================

export async function checkStorage() {
    try {
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error("Erreur Storage :", error);
            return;
        }

        const bucket = data.find(b => b.name === STORAGE_BUCKET);

        if (bucket) {
            console.log("✅ Bucket products trouvé");
        } else {
            console.warn("⚠ Bucket products introuvable dans Supabase Storage");
        }
    } catch (err) {
        console.error("Erreur vérification bucket :", err);
    }
}

// =============================
// Exécution des vérifications au chargement
// =============================

checkSupabaseConnection();
checkStorage();