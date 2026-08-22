/**
 * Entreprise ARASHI v4.0 - Paramètres de l'application
 * Fichier : js/settings.js
 */

export function initSettings() {
    const themeToggle = document.getElementById("themeToggle");
    const notificationsToggle = document.getElementById("notificationsToggle");

    // Charger les préférences sauvegardées
    const savedTheme = localStorage.getItem("arashi_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (themeToggle) {
        themeToggle.checked = savedTheme === "dark";
        themeToggle.addEventListener("change", (e) => {
            const newTheme = e.target.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("arashi_theme", newTheme);
        });
    }

    // Gestion des notifications locales
    if (notificationsToggle) {
        const notifPrefs = localStorage.getItem("arashi_notifs") !== "false";
        notificationsToggle.checked = notifPrefs;
        notificationsToggle.addEventListener("change", (e) => {
            localStorage.setItem("arashi_notifs", e.target.checked);
            alert("Préférences de notifications mises à jour.");
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSettings();
});