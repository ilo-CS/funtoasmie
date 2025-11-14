const express = require('express');
const router = express.Router();
const StockMovementController = require('../controllers/stockMovementController');
const { stockMovementValidationRules } = require('../validators/medicationValidator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');

router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

router.get('/', StockMovementController.getAllMovements);
router.get('/recent', StockMovementController.getRecentMovements);
router.get('/medication/:medication_id', StockMovementController.getMovementsByMedication);
router.get('/batch/:batch_id', StockMovementController.getMovementsByBatch);
router.get('/summary/:medication_id', StockMovementController.getMovementSummary);
router.get('/:id', StockMovementController.getMovementById);
router.post('/', stockMovementValidationRules.create, StockMovementController.createMovement);
router.post('/adjustment', stockMovementValidationRules.adjustment, StockMovementController.createAdjustment);

module.exports = router;
