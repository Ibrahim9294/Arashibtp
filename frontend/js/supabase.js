// =====================================
// ARASHI v3.0
// supabase.js
// Version Finale
// =====================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================
// Configuration Supabase
// =============================

const SUPABASE_URL =
"https://cjmunzphzqazivbkgrdq.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_-7GJRL8TW81oHvjt-N17ZQ_OS8qD-cu";

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
// Storage
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

        console.error("Erreur :", err);

    }

}

// =============================
// Vérification Bucket Storage
// =============================

export async function checkStorage() {

    try {

        const { data, error } =
            await supabase.storage.listBuckets();

        if (error) {

            console.error(error);

            return;

        }

        const bucket = data.find(
            b => b.name === STORAGE_BUCKET
        );

        if (bucket) {

            console.log("✅ Bucket products trouvé");

        } else {

            console.warn("⚠ Bucket products introuvable");

        }

    } catch (err) {

        console.error(err);

    }

}

// =============================
// Initialisation
// =============================

checkSupabaseConnection();

checkStorage();