const express = require('express');
const router = express.Router();
const DistributionController = require('../controllers/distributionController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');
const { body } = require('express-validator');

// Validation pour la création d'une distribution
const createDistributionValidation = [
  body('site_id')
    .notEmpty().withMessage('L\'ID du site est obligatoire')
    .isInt({ min: 1 }).withMessage('L\'ID du site doit être un entier positif'),
  body('items')
    .isArray({ min: 1 }).withMessage('Au moins un médicament doit être ajouté à la distribution'),
  body('items.*.medication_id')
    .notEmpty().withMessage('L\'ID du médicament est obligatoire pour chaque item')
    .isInt({ min: 1 }).withMessage('L\'ID du médicament doit être un entier positif'),
  body('items.*.quantity')
    .notEmpty().withMessage('La quantité est obligatoire pour chaque item')
    .isInt({ min: 1 }).withMessage('La quantité doit être un entier positif'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Les notes ne peuvent pas dépasser 500 caractères')
];

// Validation pour la mise à jour d'une distribution
const updateDistributionValidation = [
  body('site_id')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'ID du site doit être un entier positif'),
  body('status')
    .optional()
    .isIn(['pending', 'distributed', 'cancelled']).withMessage('Le statut doit être pending, distributed ou cancelled'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Les notes ne peuvent pas dépasser 500 caractères')
];

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

// Récupérer les distributions par site (DOIT être AVANT /:id)
router.get('/site/:siteId', DistributionController.getDistributionsBySite);

// Récupérer les distributions en attente (DOIT être AVANT /:id)
router.get('/pending/all', DistributionController.getPendingDistributions);

// Récupérer les statistiques des distributions (DOIT être AVANT /:id)
router.get('/statistics/summary', DistributionController.getDistributionStatistics);

// Récupérer toutes les distributions
router.get('/', DistributionController.getAllDistributions);

// Récupérer une distribution par ID (DOIT être EN DERNIER)
router.get('/:id', DistributionController.getDistributionById);

// Créer une nouvelle distribution
router.post('/', createDistributionValidation, DistributionController.createDistribution);

// Mettre à jour une distribution
router.put('/:id', updateDistributionValidation, DistributionController.updateDistribution);

// Marquer comme distribuée
router.patch('/:id/distributed', DistributionController.markAsDistributed);

// Annuler une distribution
router.patch('/:id/cancel', DistributionController.cancelDistribution);

// Supprimer une distribution
router.delete('/:id', DistributionController.deleteDistribution);

module.exports = router;
