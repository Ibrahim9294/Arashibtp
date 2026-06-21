const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PI_API_KEY = process.env.PI_API_KEY;
const PI_BASE_URL = 'https://api.minepi.com/v2';

// Route principale (test)
app.get('/', (req, res) => {
  res.send('✅ ARASHI BTP Backend OK - Paiements Pi actifs');
});

// ===================== ROUTE APPROVE =====================
app.post('/approve', async (req, res) => {
  const { paymentId, amount, item } = req.body;

  if (!paymentId) {
    return res.status(400).json({ success: false, message: "paymentId manquant" });
  }

  if (!PI_API_KEY) {
    return res.status(500).json({ success: false, message: "Clé API Pi non configurée" });
  }

  try {
    const config = {
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    await axios.post(`\( {PI_BASE_URL}/payments/ \){paymentId}/approve`, {}, config);

    console.log(`Paiement approuvé : \( {item} ( \){amount} Pi)`);
    
    res.json({ 
      success: true, 
      message: "Paiement approuvé avec succès" 
    });

  } catch (error) {
    console.error("Erreur approve:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'approbation" 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur port ${PORT}`);
});