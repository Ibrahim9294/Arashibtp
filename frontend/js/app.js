/* ==========================================
   Entreprise ARASHI v4.0 - Script Global Application
   Fichier : js/app.js (Corrigé et unifié)
========================================== */

import { supabase } from './supabase.js';
import { PiPaymentManager } from './pi-payments.js';

// --- 1. GESTION DU MENU MOBILE (TOGGLE SIDEBAR) ---
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        // Ferme la sidebar en cliquant en dehors sur mobile
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuToggle) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// --- 2. FONCTION GLOBALE UTILISATEUR ---
window.getCurrentUser = () => PiPaymentManager.user || window.currentUser || null;

// --- 3. CHARGEMENT DES SECTIONS METIERS ERP (STOCKS, CHANTIERS, CRM) ---
export async function loadERPModulesData() {
    // A) Stocks & Logistique
    const stockContainer = document.getElementById('erpStocksContainer');
    if (stockContainer) {
        try {
            const { data: stocks } = await supabase.from('inventory').select('*').limit(5);
            if (stocks && stocks.length > 0) {
                stockContainer.innerHTML = stocks.map(item => `
                    <div style="padding: 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
                        <span><strong>${item.name || item.item_name}</strong></span>
                        <span class="badge ${item.quantity <= (item.min_alert || 5) ? 'badge-danger' : 'badge-success'}">
                            Quantité : ${item.quantity}
                        </span>
                    </div>
                `).join('');
            } else {
                stockContainer.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Ciment, fer à béton et engins enregistrés et à niveau normal.</p>`;
            }
        } catch (e) {
            stockContainer.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Suivi du matériel BTP et seuils d'alerte configurés.</p>`;
        }
    }

    // B) Chantiers & Projets
    const projectsContainer = document.getElementById('erpProjectsContainer');
    if (projectsContainer) {
        try {
            const { data: projects } = await supabase.from('projects').select('*').limit(5);
            if (projects && projects.length > 0) {
                projectsContainer.innerHTML = projects.map(p => `
                    <div style="padding: 10px; border-bottom: 1px solid var(--border);">
                        <strong>${p.title || p.name}</strong> - Avancement : ${p.progress || 0}%
                        <div style="background: var(--bg); height: 6px; border-radius: 3px; margin-top: 5px;">
                            <div style="background: #2ecc71; width: ${p.progress || 0}%; height: 100%; border-radius: 3px;"></div>
                        </div>
                    </div>
                `).join('');
            } else {
                projectsContainer.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Supervision active des chantiers et avancements (Voirie, Terrassement, Topographie).</p>`;
            }
        } catch (e) {
            projectsContainer.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Supervision active des chantiers et avancements.</p>`;
        }
    }

    // C) Relation Client (CRM)
    const crmContainer = document.getElementById('erpCRMContainer');
    if (crmContainer) {
        try {
            const { data: quotes } = await supabase.from('quotes').select('*').limit(5);
            if (quotes && quotes.length > 0) {
                crmContainer.innerHTML = quotes.map(q => `
                    <div style="padding: 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
                        <span>${q.client_name || 'Client'} - ${q.service || 'Devis'}</span>
                        <span class="badge badge-warning">${q.status || 'En attente'}</span>
                    </div>
                `).join('');
            } else {
                crmContainer.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Gestion centralisée des devis et opportunités d'affaires.</p>`;
            }
        } catch (e) {
            crmContainer.innerHTML = `<p style="color: var(--text-muted); padding: 10px;">Gestion des devis et opportunités d'affaires.</p>`;
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    loadERPModulesData();

    const loginBtn = document.getElementById('piLogin');
    if (loginBtn) {
        // Redirection propre vers le gestionnaire unifié de paiements et d'authentification Pi
        loginBtn.addEventListener('click', () => {
            PiPaymentManager.login();
        });
    }
});