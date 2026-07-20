const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const seedDatabase = require('./seed');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Seed if empty
const users = db.getCollection('users');
if (!users || users.length === 0) {
  seedDatabase();
}

// Mount REST API Router
app.use('/api', apiRoutes);

// Root Status Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'MedPulse Enterprise Hospital Management REST API',
    version: '1.0.0',
    documentation: '/api/analytics'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  MedPulse Hospital Management Backend API is running! `);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  API Health check: http://localhost:${PORT}/api/analytics`);
  console.log(`=======================================================`);
});
