# Hanalytics - Projet Fonctionnel en Local

Ce projet est une application web développée avec React (Create React App) et un backend Node.js/Express pour la récupération de données bigquery. **Cette version fonctionne en local.**

## 🚀 Version en ligne

La version en ligne du projet est accessible sur Vercel :
➡️ [template-hanal.vercel.app](template-tracking-prod.vercel.app)

Le code source de la version en ligne est disponible ici :
➡️ [https://github.com/data-hanalytics-io/template_tracking_prod.git](https://github.com/data-hanalytics-io/template_tracking_prod.git)

---

## ⚡️ Démarrage en local détaillé

### 1. Lancer le frontend (React)

```bash
npm install
npm start
```

- Cela démarre l'application React sur [http://localhost:3000](http://localhost:3000).

### 2. Lancer le backend (Express)

Dans un autre terminal, allez dans le dossier `backend/` :

```bash
cd backend
npm install
npm start
```

- Cela démarre le serveur backend sur [http://localhost:4000](http://localhost:4000).
- Le backend expose des routes API pour le frontend.

---

## 🔑 Connexion à BigQuery : Credentials et .env

Pour que le backend puisse accéder à BigQuery, il faut fournir un fichier d'identifiants Google (credentials).

- Placez le fichier `credentials.json` à la **racine du dossier `backend/`** :

```
backend/credentials.json
```

Le fichier doit contenir la clé de service Google Cloud au format JSON.

**Par défaut, le chemin est déjà configuré dans le code (`services/bigquery.js`).**

### Utilisation d'un fichier `.env`

créez un fichier `.env` dans `backend/` :

```
GOOGLE_CLOUD_PROJECT : ID de votre projet Google Cloud.
GOOGLE_APPLICATION_CREDENTIALS_JSON= credentials.json
BIGQUERY_DATASET : Nom du dataset BigQuery à utiliser pour les requêtes.

```

---

## 🛠️ Dépendances principales

- React (Create React App)
- react-router-dom
- chart.js, react-chartjs-2
- Node.js, Express (backend)

---

## ℹ️ Remarques

- Cette version du projet est conçue pour fonctionner en local.
