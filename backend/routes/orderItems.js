const express = require('express');
const router = express.Router();
const OrderItemController = require('../controllers/orderItemController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');
const { body } = require('express-validator');

// Validation pour l'ajout d'un article
const addOrderItemValidation = [
  body('medication_id')
    .notEmpty()
    .withMessage('L\'ID du médicament est obligatoire')
    .isInt({ min: 1 })
    .withMessage('L\'ID du médicament doit être un entier positif'),
  body('quantity')
    .notEmpty()
    .withMessage('La quantité est obligatoire')
    .isInt({ min: 1, max: 10000 })
    .withMessage('La quantité doit être entre 1 et 10,000')
];

// Validation pour la mise à jour d'un article
const updateOrderItemValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('La quantité doit être entre 1 et 10,000')
];

// Routes publiques (nécessitent une authentification)
router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

// Récupérer tous les articles d'une commande
router.get('/order/:orderId', OrderItemController.getOrderItems);

// Récupérer le total d'une commande
router.get('/order/:orderId/total', OrderItemController.getOrderTotal);

// Recalculer le total d'une commande
router.patch('/order/:orderId/recalculate', OrderItemController.recalculateOrderTotal);

// Récupérer un article par ID
router.get('/:id', OrderItemController.getOrderItemById);

// Ajouter un article à une commande
router.post('/order/:orderId', addOrderItemValidation, OrderItemController.addOrderItem);

// Mettre à jour un article
router.put('/:id', updateOrderItemValidation, OrderItemController.updateOrderItem);

// Supprimer un article
router.delete('/:id', OrderItemController.deleteOrderItem);

module.exports = router;
