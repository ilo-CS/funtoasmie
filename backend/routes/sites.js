const express = require('express');
const router = express.Router();
const SiteController = require('../controllers/siteController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');
const { body } = require('express-validator');

// Validation pour la création/mise à jour d'un site
const siteValidation = [
  body('name')
    .notEmpty().withMessage('Le nom du site est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('address')
    .optional()
    .isLength({ max: 255 }).withMessage('L\'adresse ne peut pas dépasser 255 caractères'),
  body('contact_person')
    .optional()
    .isLength({ max: 100 }).withMessage('Le nom du contact ne peut pas dépasser 100 caractères'),
  body('phone')
    .optional()
    .isLength({ max: 20 }).withMessage('Le téléphone ne peut pas dépasser 20 caractères')
];

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

// Récupérer les sites actifs (DOIT être AVANT /:id)
router.get('/active', SiteController.getActiveSites);

// Récupérer tous les sites
router.get('/', SiteController.getAllSites);

// Récupérer un site par ID (DOIT être EN DERNIER)
router.get('/:id', SiteController.getSiteById);

// Créer un nouveau site
router.post('/', siteValidation, SiteController.createSite);

// Mettre à jour un site
router.put('/:id', siteValidation, SiteController.updateSite);

// Désactiver un site
router.patch('/:id/deactivate', SiteController.deactivateSite);

// Supprimer un site
router.delete('/:id', SiteController.deleteSite);

module.exports = router;
