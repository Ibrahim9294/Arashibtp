/* ==========================================
   ARASHI v3.0 - Marketplace & Supabase Fetch
========================================== */

// Configuration Supabase Client
const SUPABASE_URL = "https://TON_PROJET.supabase.co"; 
const SUPABASE_ANON_KEY = "TA_CLE_ANON_PUBLIC";

const supabase = (window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Données de secours (Fallback HD)
const fallbackListings = [
    {
        id: 1,
        title: "Villa Moderne ARASHI",
        price: "2.5 π",
        category: "Immobilier",
        image_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "Station GPS / GNSS RTK",
        price: "0.18 π",
        category: "Topographie",
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        title: "Lot Matériaux BTP & Béton",
        price: "0.09 π",
        category: "Matériaux",
        image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80"
    }
];

// Chargement dynamique des annonces
export async function loadMarketplaceListings(containerId = "popularProductsGrid") {
    const container = document.getElementById(containerId);
    if (!container) return;

    let listings = fallbackListings;

    // Tentative de récupération depuis Supabase si initialisé
    if (supabase) {
        try {
            const { data, error } = await supabase.from('listings').select('*').limit(6);
            if (!error && data && data.length > 0) {
                listings = data;
            }
        } catch (err) {
            console.warn("Utilisation des données locales de secours (Supabase non relié).");
        }
    }

    container.innerHTML = listings.map(item => `
        <article class="product-card">
            <img src="${item.image_url}" alt="${item.title}">
            <span class="badge badge-warning">${item.category}</span>
            <h3>${item.title}</h3>
            <strong>${item.price}</strong>
            <button class="btn btn-warning" onclick="executePiPayment('${item.title}', '${item.price}')">
                Acheter avec Pi
            </button>
        </article>
    `).join('');
}

// Déclencheur du paiement Pi SDK
window.executePiPayment = function(title, amount) {
    if (typeof Pi === 'undefined') {
        alert(`Commande simulée pour : ${title} au prix de ${amount}. Ouvrez dans Pi Browser pour finaliser avec la crypto Pi.`);
        return;
    }

    const numericAmount = parseFloat(amount.replace('π', '').trim()) || 1.0;

    Pi.createPayment({
        amount: numericAmount,
        memo: `Achat ARASHI: ${title}`,
        metadata: { item: title }
    }, {
        onReadyForServerApproval: (paymentId) => {
            console.log("Paiement prêt pour approbation serveur ID:", paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            console.log("Paiement complété avec succès TXID:", txid);
            alert("Achat réussi ! Merci de votre confiance en Entreprise ARASHI.");
        },
        onCancel: (paymentId) => {
            console.log("Paiement annulé:", paymentId);
        },
        onError: (error, payment) => {
            console.error("Erreur de paiement Pi:", error);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    loadMarketplaceListings();
});