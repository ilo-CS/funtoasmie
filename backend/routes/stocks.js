const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const StockController = require('../controllers/stockController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// Validation pour la création/mise à jour de stock de site
const siteStockValidation = [
  param('site_id').isInt({ min: 1 }).withMessage('L\'ID du site doit être un entier positif'),
  param('medication_id').isInt({ min: 1 }).withMessage('L\'ID du médicament doit être un entier positif'),
  body('quantity').isInt({ min: 0 }).withMessage('La quantité doit être un entier positif ou zéro'),
  body('min_stock').optional().isInt({ min: 0 }).withMessage('Le stock minimum doit être un entier positif ou zéro'),
  body('max_stock').optional().isInt({ min: 0 }).withMessage('Le stock maximum doit être un entier positif ou zéro')
];

// Validation pour l'annulation de transfert
const cancelTransferValidation = [
  body('reference_type').isIn(['DISTRIBUTION', 'ORDER', 'ADJUSTMENT', 'TRANSFER']).withMessage('Type de référence invalide'),
  body('reference_id').isInt({ min: 1 }).withMessage('L\'ID de référence doit être un entier positif'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Les notes ne peuvent pas dépasser 500 caractères')
];

// Routes pour les résumés et statistiques
router.get('/summary', 
  authorize('admin', 'admin pharmacist', 'pharmacist'),
  StockController.getStockSummary
);

router.get('/movements', 
  authorize('admin', 'admin pharmacist', 'pharmacist'),
  StockController.getStockMovements
);

// Résumé des mouvements de stock
router.get('/movements/summary',
  authorize('admin', 'admin pharmacist', 'pharmacist'),
  StockController.getMovementSummary
);

router.get('/alerts', 
  authorize('admin', 'admin pharmacist', 'pharmacist'),
  StockController.getStockAlerts
);

// Routes pour les stocks par site
router.get('/sites/:site_id', 
  authorize('admin', 'admin pharmacist', 'pharmacist'),
  param('site_id').isInt({ min: 1 }).withMessage('L\'ID du site doit être un entier positif'),
  StockController.getSiteStocks
);

router.put('/sites/:site_id/medications/:medication_id', 
  authorize('admin', 'admin pharmacist'),
  siteStockValidation,
  StockController.createOrUpdateSiteStock
);

router.post('/sites/:site_id/synchronize', 
  authorize('admin', 'admin pharmacist'),
  param('site_id').isInt({ min: 1 }).withMessage('L\'ID du site doit être un entier positif'),
  StockController.synchronizeSiteStock
);

// Route pour annuler un transfert
router.post('/cancel-transfer', 
  authorize('admin', 'admin pharmacist'),
  cancelTransferValidation,
  StockController.cancelStockTransfer
);

module.exports = router;

