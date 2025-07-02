const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Express is running!' });
});

// Importer et utiliser les routes API (à venir)
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);
const realtimeRoutes = require('./routes/realtime');
app.use('/api/realtime', realtimeRoutes);
const trackingRoutes = require('./routes/tracking');
app.use('/api/tracking', trackingRoutes);
const anomalyRoutes = require('./routes/anomaly');
app.use('/api/anomaly', anomalyRoutes);
const loginRoutes = require('./routes/login');
app.use('/api/login', loginRoutes);
// Ajouter ici d'autres routes (realtime, tracking, etc.)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 