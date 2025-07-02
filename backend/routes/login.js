const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { runQuery } = require('../services/bigquery');

// Route POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
  }

  try {
    // Requête pour trouver l'utilisateur actif
    const query = `
      SELECT id, email, password, prenom, role, is_active
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET}.users\`
      WHERE email = '${email}' AND is_active = true
      LIMIT 1
    `;
    const users = await runQuery(query);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé ou inactif.' });
    }
    const user = users[0];
    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Mot de passe invalide.' });
    }
    // Mise à jour du last_login
    try {
      const updateQuery = `
        UPDATE \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET}.users\`
        SET last_login = CURRENT_TIMESTAMP()
        WHERE email = '${email}'
      `;
      await runQuery(updateQuery);
    } catch (updateError) {
      // On log juste l'erreur, mais on ne bloque pas le login
      console.warn('Erreur lors de la mise à jour du last_login:', updateError);
    }
    // Authentification réussie
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        role: user.role,
      },
      token: 'demo-token' // Remplace par un vrai JWT si besoin
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router; 
// Remplace PROJECT.DATASET par les valeurs réelles ou utilise process.env comme dans le code Next.js 