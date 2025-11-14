const express = require('express');
const router = express.Router();
const MedicationController = require('../controllers/medicationController');
const { medicationValidationRules } = require('../validators/medicationValidator');
const MedicationSecurityValidator = require('../validators/medicationSecurityValidator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');

router.use(authenticateToken);

// Routes publiques (lecture seule) pour tous les utilisateurs authentifiés
router.get('/', authorize('admin', 'admin pharmacist', 'pharmacist'), MedicationController.getAllMedications);
router.get('/:id', authorize('admin', 'admin pharmacist', 'pharmacist'), MedicationController.getMedicationById);

// Routes protégées pour admin et admin pharmacist seulement
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));
router.get('/statistics', MedicationController.getMedicationStatistics);
router.get('/low-stock', MedicationController.getLowStockMedications);
router.get('/out-of-stock', MedicationController.getOutOfStockMedications);
router.get('/status/:status', MedicationController.getMedicationsByStatus);
router.get('/expired', MedicationController.getExpiredMedications);
router.get('/:id', MedicationController.getMedicationById);
router.post('/', medicationValidationRules.create, MedicationController.createMedication);
router.put('/:id', medicationValidationRules.update, MedicationController.updateMedication);
router.delete('/:id', MedicationController.deleteMedication);
router.put('/:id/quantity', 
  MedicationSecurityValidator.quantityUpdateRules(),
  MedicationSecurityValidator.validateCriticalChanges(),
  MedicationSecurityValidator.logSensitiveActions(),
  MedicationController.updateQuantity
);

// Routes pour la gestion des statuts
router.patch('/:id/deactivate', MedicationController.deactivateMedication);
router.patch('/:id/reactivate', MedicationController.reactivateMedication);
router.patch('/:id/discontinue', MedicationController.discontinueMedication);

// Routes pour les mouvements de stock
router.get('/:id/movements', MedicationController.getMedicationMovements);

// Routes pour les lots
router.get('/:id/batches', MedicationController.getMedicationBatches);

module.exports = router;
