const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');
const { body } = require('express-validator');

// Validation pour la création de commande
const createOrderValidation = [
  body('supplier_id')
    .notEmpty()
    .withMessage('Le fournisseur est obligatoire')
    .isInt({ min: 1 })
    .withMessage('L\'ID du fournisseur doit être un entier positif'),
  body('order_number')
    .notEmpty()
    .withMessage('Le numéro de commande est obligatoire')
    .isLength({ min: 1, max: 50 })
    .withMessage('Le numéro de commande doit contenir entre 1 et 50 caractères')
    .trim(),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères')
    .trim()
];

// Validation pour la mise à jour de commande
const updateOrderValidation = [
  body('order_number')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Le numéro de commande doit contenir entre 1 et 50 caractères')
    .trim(),
  body('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'])
    .withMessage('Le statut doit être PENDING, APPROVED, IN_TRANSIT, DELIVERED ou CANCELLED'),
  body('delivery_date')
    .optional()
    .isISO8601()
    .withMessage('La date de livraison doit être au format ISO 8601'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères')
    .trim()
];

// Routes publiques (nécessitent une authentification)
router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

// Récupérer toutes les commandes
router.get('/', OrderController.getAllOrders);

// Récupérer les statistiques des commandes
router.get('/statistics', OrderController.getOrderStatistics);

// Récupérer les commandes en attente
router.get('/pending', OrderController.getPendingOrders);

// Récupérer une commande par ID
router.get('/:id', OrderController.getOrderById);

// Créer une nouvelle commande
router.post('/', createOrderValidation, OrderController.createOrder);

// Mettre à jour une commande
router.put('/:id', updateOrderValidation, OrderController.updateOrder);

// Approuver une commande
router.patch('/:id/approve', OrderController.approveOrder);

// Marquer comme en transit
router.patch('/:id/in-transit', OrderController.markAsInTransit);

// Marquer comme livrée
router.patch('/:id/delivered', OrderController.markAsDelivered);

// Annuler une commande
router.patch('/:id/cancel', OrderController.cancelOrder);

// Supprimer une commande
router.delete('/:id', OrderController.deleteOrder);

module.exports = router;