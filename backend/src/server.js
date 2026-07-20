const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const seedDatabase = require('./seed');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const openapiSpec = require('./docs/openapi.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize Database Seed if empty
const users = db.getCollection('users');
if (!users || users.length === 0) {
  seedDatabase();
}

// Mount REST API Router
app.use('/api', apiRoutes);

// Swagger / OpenAPI Specification Endpoint
app.get('/api-docs', (req, res) => {
  res.json(openapiSpec);
});

// Root Status Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'MedPulse Enterprise Hospital Management REST API',
    version: '1.0.0',
    documentation: '/api-docs',
    analytics: '/api/analytics'
  });
});

// Centralized Error Handling Middleware (Must be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  MedPulse Hospital Management Backend API is running! `);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  OpenAPI Specs: http://localhost:${PORT}/api-docs`);
  console.log(`=======================================================`);
});
