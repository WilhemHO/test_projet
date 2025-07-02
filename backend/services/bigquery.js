const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

// Chemin vers le credentials.json (placer le fichier à la racine du dossier backend)
const keyFilename = path.join(__dirname, '../credentials.json');

const bigquery = new BigQuery({ keyFilename });

/**
 * Exécute une requête SQL sur BigQuery
 * @param {string} query - La requête SQL à exécuter
 * @returns {Promise<Array>} - Les résultats de la requête
 */
async function runQuery(query) {
  const [rows] = await bigquery.query({ query });
  return rows;
}

module.exports = { runQuery }; 