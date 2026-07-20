const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour analyser le JSON dans les requêtes
app.use(express.json());

// Service des fichiers statiques du Frontend sur Render
app.use(express.static(path.join(__dirname, '../frontend')));

// URL de base de l'API Pi Network
const PI_API_URL = 'https://api.minepi.com/v2';

// En-têtes pour les requêtes vers l'API Pi Network
const getPiHeaders = () => ({
  headers: {
    Authorization: `Key ${process.env.PI_API_KEY}`,
    'Content-Type': 'json'
  }
});

// ==========================================
// ENDPOINTS DE PAIEMENT PI NETWORK
// ==========================================

/**
 * 1. APPROVE PAYMENT (/approve)
 * Appelé par le SDK Pi JS ou le client backend lorsque l'utilisateur initie un paiement.
 * Transmet l'approbation à l'API Pi.
 */
app.post('/approve', async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId est requis' });
  }

  try {
    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/approve`,
      {},
      getPiHeaders()
    );
    console.log(`[Pi Payment] Approbé avec succès: ${paymentId}`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`[Error /approve]:`, error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Échec lors de l\'approbation du paiement' });
  }
});

/**
 * 2. COMPLETE PAYMENT (/complete)
 * Appelé une fois que le paiement a été soumis à la Blockchain Pi ou validé.
 */
app.post('/complete', async (req, res) => {
  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'paymentId et txid sont requis' });
  }

  try {
    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/complete`,
      { txid },
      getPiHeaders()
    );
    console.log(`[Pi Payment] Complété avec succès: ${paymentId}, TXID: ${txid}`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`[Error /complete]:`, error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Échec lors de la complétion du paiement' });
  }
});

/**
 * 3. VERIFY PAYMENT (/verify)
 * Vérifie l'état actuel d'un paiement directement auprès des serveurs de Pi Network.
 */
app.get('/verify/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const response = await axios.get(
      `${PI_API_URL}/payments/${paymentId}`,
      getPiHeaders()
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`[Error /verify]:`, error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Impossible de vérifier le paiement' });
  }
});

/**
 * 4. WEBHOOK (/webhook)
 * Reçoit les événements asynchrones envoyés par Pi Network (paiements incomplets, annulations, etc.).
 */
app.post('/webhook', async (req, res) => {
  const event = req.body;

  console.log('[Pi Webhook] Événement reçu:', JSON.stringify(event, null, 2));

  try {
    // Traitement selon le type d'événement Pi
    if (event && event.action) {
      switch (event.action) {
        case 'payment_completed':
          console.log(`Paiement ${event.payment_id} confirmé via webhook.`);
          break;
        case 'payment_cancelled':
          console.log(`Paiement ${event.payment_id} annulé.`);
          break;
        default:
          console.log(`Action non gérée: ${event.action}`);
      }
    }

    // Répondre toujours 200 OK à Pi Network pour valider la réception du Webhook
    return res.status(200).send('Webhook reçu');
  } catch (error) {
    console.error('[Error /webhook]:', error);
    return res.status(500).send('Erreur serveur webhook');
  }
});

// Route fallback : renvoie index.html du frontend pour toute autre route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`=== Serveur Backend ArashiBTP démarré sur le port ${PORT} ===`);
});
