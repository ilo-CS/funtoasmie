const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

const PrescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { HTTP_STATUS, MESSAGES } = require('../constants');

// Middleware de validation
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.ERROR.VALIDATION_ERROR,
      errors: errors.array()
    });
  }
  next();
};

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @route   POST /api/prescriptions
 * @desc    Créer une nouvelle prescription
 * @access  Pharmacist, Admin Pharmacist, Admin
 */
router.post('/',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    body('patient_name')
      .notEmpty()
      .withMessage('Le nom du patient est obligatoire')
      .isLength({ min: 2, max: 255 })
      .withMessage('Le nom du patient doit contenir entre 2 et 255 caractères')
      .trim(),
    
    body('patient_phone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Le numéro de téléphone ne peut pas dépasser 20 caractères')
      .trim(),
    
    body('items')
      .isArray({ min: 1 })
      .withMessage('Au moins un médicament est obligatoire'),
    
    body('items.*.medication_id')
      .notEmpty()
      .withMessage('Le médicament est obligatoire')
      .isInt({ min: 1 })
      .withMessage('L\'ID du médicament doit être un entier positif'),
    
    body('items.*.quantity')
      .notEmpty()
      .withMessage('La quantité est obligatoire')
      .isInt({ min: 1, max: 1000 })
      .withMessage('La quantité doit être entre 1 et 1000'),
    
    body('dosage')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Le dosage ne peut pas dépasser 500 caractères')
      .trim(),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
      .trim(),
    
    body('site_id')
      .notEmpty()
      .withMessage('Le site est obligatoire')
      .isInt({ min: 1 })
      .withMessage('L\'ID du site doit être un entier positif')
  ],
  validateRequest,
  PrescriptionController.createPrescription
);

/**
 * @route   GET /api/prescriptions
 * @desc    Récupérer toutes les prescriptions (avec filtres)
 * @access  Admin Pharmacist, Admin
 */
router.get('/',
  authorize('admin pharmacist', 'admin'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La page doit être un entier positif'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La limite doit être entre 1 et 100'),
    
    query('status')
      .optional()
      .isIn(['PENDING', 'PREPARING', 'PREPARED', 'CANCELLED'])
      .withMessage('Le statut doit être PENDING, PREPARING, PREPARED ou CANCELLED'),
    
    query('site_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du site doit être un entier positif'),
    
    query('pharmacist_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du pharmacien doit être un entier positif'),
    
    query('patient_name')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Le nom du patient ne peut pas dépasser 255 caractères')
      .trim(),
    
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('La date de début doit être au format ISO 8601'),
    
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('La date de fin doit être au format ISO 8601')
  ],
  validateRequest,
  PrescriptionController.getAllPrescriptions
);

/**
 * @route   GET /api/prescriptions/sites/:site_id
 * @desc    Récupérer les prescriptions d'un site
 * @access  Pharmacist (son site), Admin Pharmacist, Admin
 */
router.get('/sites/:site_id',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('site_id')
      .isInt({ min: 1 })
      .withMessage('L\'ID du site doit être un entier positif'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La page doit être un entier positif'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La limite doit être entre 1 et 100'),
    
    query('status')
      .optional()
      .isIn(['PENDING', 'PREPARING', 'PREPARED', 'CANCELLED'])
      .withMessage('Le statut doit être PENDING, PREPARING, PREPARED ou CANCELLED')
  ],
  validateRequest,
  PrescriptionController.getSitePrescriptions
);

/**
 * @route   GET /api/prescriptions/pharmacists/:pharmacist_id
 * @desc    Récupérer les prescriptions d'un pharmacien
 * @access  Pharmacist (ses prescriptions), Admin Pharmacist, Admin
 */
router.get('/pharmacists/:pharmacist_id',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('pharmacist_id')
      .isInt({ min: 1 })
      .withMessage('L\'ID du pharmacien doit être un entier positif'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La page doit être un entier positif'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La limite doit être entre 1 et 100')
  ],
  validateRequest,
  PrescriptionController.getPharmacistPrescriptions
);

/**
 * @route   GET /api/prescriptions/stats
 * @desc    Récupérer les statistiques des prescriptions
 * @access  Pharmacist, Admin Pharmacist, Admin
 */
router.get('/stats',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    query('site_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du site doit être un entier positif'),
    
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('La date de début doit être au format ISO 8601'),
    
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('La date de fin doit être au format ISO 8601')
  ],
  validateRequest,
  PrescriptionController.getPrescriptionStats
);

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Récupérer une prescription par ID
 * @access  Pharmacist (ses prescriptions ou son site), Admin Pharmacist, Admin
 */
router.get('/:id',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la prescription doit être un entier positif')
  ],
  validateRequest,
  PrescriptionController.getPrescriptionById
);

/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Mettre à jour une prescription
 * @access  Pharmacist (ses prescriptions), Admin Pharmacist, Admin
 */
router.put('/:id',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la prescription doit être un entier positif'),
    
    body('patient_name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Le nom du patient doit contenir entre 2 et 255 caractères')
      .trim(),
    
    body('patient_phone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Le numéro de téléphone ne peut pas dépasser 20 caractères')
      .trim(),
    
    body('medication_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du médicament doit être un entier positif'),
    
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('La quantité doit être entre 1 et 1000'),
    
    body('dosage')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Le dosage ne peut pas dépasser 500 caractères')
      .trim(),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
      .trim(),
    
    body('status')
      .optional()
      .isIn(['PENDING', 'PREPARING', 'PREPARED', 'CANCELLED'])
      .withMessage('Le statut doit être PENDING, PREPARING, PREPARED ou CANCELLED')
  ],
  validateRequest,
  PrescriptionController.updatePrescription
);

/**
 * @route   PATCH /api/prescriptions/:id/prepare
 * @desc    Marquer une prescription comme "en préparation"
 * @access  Pharmacist (ses prescriptions), Admin Pharmacist, Admin
 */
router.patch('/:id/prepare',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la prescription doit être un entier positif')
  ],
  validateRequest,
  PrescriptionController.markAsPreparing
);

/**
 * @route   PATCH /api/prescriptions/:id/prepared
 * @desc    Marquer une prescription comme "préparée" et créer le mouvement de stock
 * @access  Pharmacist (ses prescriptions), Admin Pharmacist, Admin
 */
router.patch('/:id/prepared',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la prescription doit être un entier positif')
  ],
  validateRequest,
  PrescriptionController.markAsPrepared
);

/**
 * @route   PATCH /api/prescriptions/:id/cancel
 * @desc    Annuler une prescription
 * @access  Pharmacist (ses prescriptions), Admin Pharmacist, Admin
 */
router.patch('/:id/cancel',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la prescription doit être un entier positif')
  ],
  validateRequest,
  PrescriptionController.cancelPrescription
);

/**
 * @route   DELETE /api/prescriptions/:id
 * @desc    Supprimer une prescription
 * @access  Pharmacist (ses prescriptions), Admin Pharmacist, Admin
 */
router.delete('/:id',
  authorize('pharmacist', 'admin pharmacist', 'admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la prescription doit être un entier positif')
  ],
  validateRequest,
  PrescriptionController.deletePrescription
);

module.exports = router;
