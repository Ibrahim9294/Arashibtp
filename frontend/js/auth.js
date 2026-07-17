/* ==========================================
   ENTREPRISE ARASHI v3.0 - Synchronisation Auth
========================================== */

// On importe l'instance supabase créée dans supabase.js
import { supabase } from './supabase.js';

console.log("👤 Module Auth ARASHI v3.0 Initialisé");

/**
 * Fonction globale appelée par pi.js après une connexion réussie.
 * Elle synchronise l'utilisateur Pi avec la table 'profiles' de Supabase.
 * @param {Object} piUser - L'objet utilisateur renvoyé par le SDK Pi
 */
window.syncUserWithSupabase = async function(piUser) {
    if (!piUser || !piUser.username) {
        console.error("❌ Données utilisateur Pi invalides pour la synchronisation.");
        return;
    }

    const username = piUser.username;
    const uid = piUser.uid; // Identifiant unique et sécurisé fourni par Pi Network

    try {
        console.log(`🗄️ Vérification du profil pour @${username} dans Supabase...`);

        // 1. On cherche si l'utilisateur existe déjà
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (error) {
            throw error;
        }

        // 2. Si le profil n'existe pas, on le crée automatiquement (Inscription)
        if (!profile) {
            console.log(`✨ Nouveau Pionnier détecté ! Création du profil pour @${username}...`);
            
            const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                    { 
                        username: username,
                        pi_uid: uid,
                        full_name: username, // Par défaut
                        avatar_url: null,
                        role: 'user', // Rôle de départ standard
                        created_at: new Date().toISOString()
                    }
                ]);

            if (insertError) {
                console.error("❌ Erreur lors de la création du profil :", insertError);
            } else {
                console.log(`✅ Profil créé avec succès pour @${username} !`);
            }
        } else {
            console.log(`👋 Bon retour parmi nous @${username} ! (Profil déjà existant)`);
            
            // Optionnel : Mettre à jour le pi_uid s'il n'était pas encore enregistré
            if (!profile.pi_uid) {
                await supabase
                    .from('profiles')
                    .update({ pi_uid: uid })
                    .eq('username', username);
            }
        }

    } catch (err) {
        console.error("❌ Erreur de communication avec Supabase Auth :", err);
    }
};

/**
 * Déconnexion de l'utilisateur
 */
window.logoutARASHI = function() {
    localStorage.removeItem("pi_user");
    localStorage.removeItem("pi_accessToken");
    console.log("🚪 Déconnexion effectuée. Rechargement...");
    window.location.reload();
};
                      
