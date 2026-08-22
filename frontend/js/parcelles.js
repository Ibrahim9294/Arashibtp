import { supabase } from './supabase.js';

export async function loadParcelles() {
    const grid = document.getElementById("parcellesGrid");
    if (!grid) return;

    try {
        const { data: parcelles, error } = await supabase
            .from("parcelles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        grid.innerHTML = "";
        if (!parcelles || parcelles.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Aucune parcelle disponible pour le moment.</p>`;
            return;
        }

        parcelles.forEach(p => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.cssText = "background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eaeaea;";
            card.innerHTML = `
                <img src="${p.image_url || '/assets/terrains/default.jpg'}" alt="Parcelle" style="width: 100%; height: 180px; object-fit: cover;">
                <div style="padding: 16px;">
                    <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${p.title || 'Parcelle Viabilisée'}</h3>
                    <p style="color: #666; font-size: 14px; margin-bottom: 12px;">${p.description || 'Emplacement stratégique avec documents officiels.'}</p>
                    <div style="font-size: 20px; font-weight: bold; color: #d97706; margin-bottom: 16px;">⚡ ${p.price_pi || 1} π</div>
                    <button onclick="createPiPayment(${p.price_pi || 1}, 'Achat Parcelle: ${p.title}', { type: 'parcelle', id: '${p.id}' })" style="width: 100%; background: #000; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                        💳 Acheter avec Pi
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Erreur chargement parcelles:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadParcelles();
});