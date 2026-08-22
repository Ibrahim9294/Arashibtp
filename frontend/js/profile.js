import { supabase } from './supabase.js';

export async function loadProfile() {
    const usernameEl = document.getElementById("profileUsername");
    const uidEl = document.getElementById("profileUid");
    const lastLoginEl = document.getElementById("profileLastLogin");

    const user = window.currentUser;
    if (!user) {
        if (usernameEl) usernameEl.textContent = "Non connecté";
        return;
    }

    if (usernameEl) usernameEl.textContent = `@${user.username || 'Utilisateur'}`;
    if (uidEl) uidEl.textContent = user.uid || 'N/A';

    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("uid", user.uid)
            .single();

        if (error) throw error;

        if (data && lastLoginEl) {
            lastLoginEl.textContent = new Date(data.last_login).toLocaleString() || 'Récemment';
        }
    } catch (err) {
        console.error("Erreur lors du chargement du profil depuis Supabase:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
});