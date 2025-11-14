const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { categoryValidationRules } = require('../validators/categoryValidator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');

router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

// Routes pour les catégories
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', categoryValidationRules.create, CategoryController.createCategory);
router.put('/:id', categoryValidationRules.update, CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;