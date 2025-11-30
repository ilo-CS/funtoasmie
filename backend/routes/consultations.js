const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

const ConsultationController = require('../controllers/consultationController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { HTTP_STATUS, MESSAGES } = require('../constants');

// Middleware de validation
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.ERROR.VALIDATION_ERROR || 'Erreur de validation',
      errors: errors.array()
    });
  }
  next();
};

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @route   POST /api/consultations
 * @desc    Créer une nouvelle consultation
 * @access  Doctor, Head Doctor, Admin
 */
router.post('/',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
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
    
    body('patient_age')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('L\'âge doit être entre 0 et 150 ans'),
    
    body('patient_gender')
      .optional()
      .isIn(['M', 'F', 'OTHER'])
      .withMessage('Le genre doit être M, F ou OTHER'),
    
    body('consultation_date')
      .optional()
      .isISO8601()
      .withMessage('La date de consultation doit être au format ISO 8601'),
    
    body('symptoms')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Les symptômes ne peuvent pas dépasser 5000 caractères'),
    
    body('diagnosis')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Le diagnostic ne peut pas dépasser 5000 caractères'),
    
    body('notes')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Les notes ne peuvent pas dépasser 5000 caractères')
  ],
  validateRequest,
  ConsultationController.createConsultation
);

/**
 * @route   GET /api/consultations
 * @desc    Récupérer toutes les consultations (avec filtres)
 * @access  Doctor, Head Doctor, Admin
 */
router.get('/',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
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
      .isIn(['COMPLETED', 'CANCELLED'])
      .withMessage('Le statut doit être COMPLETED ou CANCELLED'),
    
    query('doctor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du docteur doit être un entier positif'),
    
    query('site_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du site doit être un entier positif'),
    
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
  ConsultationController.getAllConsultations
);

/**
 * @route   GET /api/consultations/stats
 * @desc    Récupérer les statistiques des consultations
 * @access  Doctor, Head Doctor, Admin
 */
router.get('/stats',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    query('site_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du site doit être un entier positif'),
    
    query('doctor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du docteur doit être un entier positif'),
    
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
  ConsultationController.getConsultationStats
);

/**
 * @route   GET /api/consultations/doctors/:doctor_id
 * @desc    Récupérer les consultations d'un docteur
 * @access  Doctor (ses consultations), Head Doctor, Admin
 */
router.get('/doctors/:doctor_id',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('doctor_id')
      .isInt({ min: 1 })
      .withMessage('L\'ID du docteur doit être un entier positif'),
    
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
  ConsultationController.getDoctorConsultations
);

/**
 * @route   GET /api/consultations/:id
 * @desc    Récupérer une consultation par ID
 * @access  Doctor (sa consultation), Head Doctor, Admin
 */
router.get('/:id',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la consultation doit être un entier positif')
  ],
  validateRequest,
  ConsultationController.getConsultationById
);

/**
 * @route   PUT /api/consultations/:id
 * @desc    Mettre à jour une consultation
 * @access  Doctor (sa consultation), Head Doctor, Admin
 */
router.put('/:id',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la consultation doit être un entier positif'),
    
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
    
    body('patient_age')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('L\'âge doit être entre 0 et 150 ans'),
    
    body('patient_gender')
      .optional()
      .isIn(['M', 'F', 'OTHER'])
      .withMessage('Le genre doit être M, F ou OTHER'),
    
    body('consultation_date')
      .optional()
      .isISO8601()
      .withMessage('La date de consultation doit être au format ISO 8601'),
    
    body('symptoms')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Les symptômes ne peuvent pas dépasser 5000 caractères'),
    
    body('diagnosis')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Le diagnostic ne peut pas dépasser 5000 caractères'),
    
    body('notes')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Les notes ne peuvent pas dépasser 5000 caractères'),
    
    body('status')
      .optional()
      .isIn(['COMPLETED', 'CANCELLED'])
      .withMessage('Le statut doit être COMPLETED ou CANCELLED')
  ],
  validateRequest,
  ConsultationController.updateConsultation
);

/**
 * @route   PATCH /api/consultations/:id/cancel
 * @desc    Annuler une consultation
 * @access  Doctor (sa consultation), Head Doctor, Admin
 */
router.patch('/:id/cancel',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la consultation doit être un entier positif')
  ],
  validateRequest,
  ConsultationController.cancelConsultation
);

/**
 * @route   DELETE /api/consultations/:id
 * @desc    Supprimer une consultation
 * @access  Doctor (sa consultation), Head Doctor, Admin
 */
router.delete('/:id',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la consultation doit être un entier positif')
  ],
  validateRequest,
  ConsultationController.deleteConsultation
);

module.exports = router;

