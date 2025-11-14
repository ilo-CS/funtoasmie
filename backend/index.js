// Core dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Configuration and utilities
const config = require('./config/config');
const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route handlers
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const companyRoutes = require('./routes/company');
const distributionRoutes = require('./routes/distributions');
const medicationRoutes = require('./routes/medications');
const orderItemRoutes = require('./routes/orderItems');
const orderRoutes = require('./routes/orders');
const prescriptionRoutes = require('./routes/prescriptions');
const siteRoutes = require('./routes/sites');
const supplierRoutes = require('./routes/suppliers');
const unitRoutes = require('./routes/units');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS doit passer AVANT tout middleware qui peut répondre (ex: rate limiter)
const normalizeOrigin = (origin) => origin.replace(/\/$/, '');

const allowedOrigins = Array.isArray(config.cors.origin)
  ? config.cors.origin
  : [config.cors.origin];

const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed =
      normalizedAllowedOrigins.includes('*') ||
      normalizedAllowedOrigins.includes(normalizedOrigin);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: config.cors.credentials
}));

// Limiteur après CORS pour que les réponses 429 aient les bons en-têtes CORS
app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'FUNTOA SMIE API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'healthy',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes (alphabetical order)
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/stock-movements', require('./routes/stockMovements'));
app.use('/api/suppliers', supplierRoutes);
app.use('/api/units', unitRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = config.server.port;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

startServer();
