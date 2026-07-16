/**
 * ARASHI v2.0 - Configuration Supabase Client
 */
const SUPABASE_URL = "https://VOTRE_PROJET.supabase.co"; // À remplacer par votre URL
const SUPABASE_ANON_KEY = "VOTRE_CLE_ANONYME"; // À remplacer par votre clé anonyme

export const supabase = (typeof window.supabase !== 'undefined')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!supabase) {
    console.warn("Script d'importation CDN Supabase manquant ou mal configuré.");
}
