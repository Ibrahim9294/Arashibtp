// api/approve-payment.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { paymentId } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY; // Clé Secrète du Developer Portal

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId manquant' });
  }

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur Pi API Approve:", data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erreur serveur approve:", error);
    return res.status(500).json({ error: "Erreur serveur lors de l'approbation" });
  }
}