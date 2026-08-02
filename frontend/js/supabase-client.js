/* ==========================================
   ARASHI Enterprise v4.0 - Client Supabase
   Fichier : js/supabase-client.js
========================================== */

// URLs et Clés de configuration Supabase (à remplacer par vos identifiants réels)
const SUPABASE_URL = 'https://votre-projet.supabase.co';
const SUPABASE_ANON_KEY = 'votre-cle-anon-public-here';

// Initialisation du client Supabase
export const supabase = (typeof createClient !== 'undefined')
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!supabase) {
    console.warn("Le SDK Supabase CDN n'a pas été chargé dans la page.");
}

/**
 * Service pour gérer les opérations récurrentes de l'ERP & Marketplace
 */
export const DBService = {

    /**
     * Récupère tous les produits / services de la Marketplace
     * @param {string} category - Optionnel : filtrer par catégorie ('real_estate', 'topography', 'construction')
     */
    getMarketplaceItems: async function(category = null) {
        if (!supabase) return [];

        let query = supabase.from('products').select('*').eq('is_active', true);
        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Erreur Supabase (getMarketplaceItems) :', error.message);
            return [];
        }
        return data;
    },

    /**
     * Enregistre un devis ou une commande dans Supabase
     * @param {Object} orderData - Données du devis/commande
     */
    createOrder: async function(orderData) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();

        if (error) {
            console.error('Erreur Supabase (createOrder) :', error.message);
            return null;
        }
        return data[0];
    },

    /**
     * Enregistre une transaction effectuée via Pi Network
     * @param {Object} txData - Données du paiement Pi (txid, paymentId, amount, user)
     */
    logPiTransaction: async function(txData) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('pi_transactions')
            .insert([{
                pi_payment_id: txData.paymentId,
                pi_txid: txData.txid,
                username: txData.username,
                amount_pi: txData.amount,
                status: txData.status || 'completed',
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Erreur Supabase (logPiTransaction) :', error.message);
            return null;
        }
        return data;
    }
};