import { supabase } from './supabase.js';

export class ArashiAuth {
    static async syncWithSupabase(piUser) {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    username: piUser.username,
                    wallet_address: piUser.uid,
                    created_at: new Date().toISOString()
                }, { onConflict: 'username' });

            if (error) throw error;
            console.log("Utilisateur synchronisé avec succès sur Supabase.");
            return data;
        } catch (err) {
            console.error("Erreur de synchronisation Supabase :", err.message);
        }
    }

    static saveLocalSession(piUser) {
        localStorage.setItem('arashi_user', JSON.stringify(piUser));
    }

    static getLocalSession() {
        return JSON.parse(localStorage.getItem('arashi_user'));
    }
}
