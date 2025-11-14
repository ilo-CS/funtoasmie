const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplierController');
const { supplierValidationRules } = require('../validators/supplierValidator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');

router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

// Routes CRUD
router.get('/', SupplierController.getAllSuppliers);
router.get('/active', SupplierController.getActiveSuppliers);
router.get('/:id', SupplierController.getSupplierById);
router.post('/', supplierValidationRules.create, SupplierController.createSupplier);
router.put('/:id', supplierValidationRules.update, SupplierController.updateSupplier);
router.delete('/:id', SupplierController.deleteSupplier);
router.patch('/:id/toggle-status', SupplierController.toggleSupplierStatus);

module.exports = router;
