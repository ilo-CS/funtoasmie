const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

const MedicalPrescriptionController = require('../controllers/medicalPrescriptionController');
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
 * @route   POST /api/medical-prescriptions
 * @desc    Créer une nouvelle ordonnance médicale
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
    
    body('items.*.dosage')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Le dosage ne peut pas dépasser 500 caractères')
      .trim(),
    
    body('items.*.duration')
      .optional()
      .isLength({ max: 100 })
      .withMessage('La durée ne peut pas dépasser 100 caractères')
      .trim(),
    
    body('items.*.instructions')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Les instructions ne peuvent pas dépasser 1000 caractères'),
    
    body('consultation_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID de la consultation doit être un entier positif'),
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
      .trim()
  ],
  validateRequest,
  MedicalPrescriptionController.createPrescription
);

/**
 * @route   GET /api/medical-prescriptions
 * @desc    Récupérer toutes les ordonnances médicales (avec filtres)
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
      .isIn(['ACTIVE', 'FULFILLED', 'CANCELLED'])
      .withMessage('Le statut doit être ACTIVE, FULFILLED ou CANCELLED'),
    
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
  MedicalPrescriptionController.getAllPrescriptions
);

/**
 * @route   GET /api/medical-prescriptions/stats
 * @desc    Récupérer les statistiques des ordonnances médicales
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
  MedicalPrescriptionController.getPrescriptionStats
);

/**
 * @route   GET /api/medical-prescriptions/doctors/:doctor_id
 * @desc    Récupérer les ordonnances médicales d'un docteur
 * @access  Doctor (ses ordonnances), Head Doctor, Admin
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
  MedicalPrescriptionController.getDoctorPrescriptions
);

/**
 * @route   GET /api/medical-prescriptions/:id
 * @desc    Récupérer une ordonnance médicale par ID
 * @access  Doctor (son ordonnance), Head Doctor, Admin
 */
router.get('/:id',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de l\'ordonnance médicale doit être un entier positif')
  ],
  validateRequest,
  MedicalPrescriptionController.getPrescriptionById
);

/**
 * @route   PUT /api/medical-prescriptions/:id
 * @desc    Mettre à jour une ordonnance médicale
 * @access  Doctor (son ordonnance), Head Doctor, Admin
 */
router.put('/:id',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de l\'ordonnance médicale doit être un entier positif'),
    
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
    
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
      .trim(),
    
    body('status')
      .optional()
      .isIn(['ACTIVE', 'FULFILLED', 'CANCELLED'])
      .withMessage('Le statut doit être ACTIVE, FULFILLED ou CANCELLED')
  ],
  validateRequest,
  MedicalPrescriptionController.updatePrescription
);

/**
 * @route   PATCH /api/medical-prescriptions/:id/cancel
 * @desc    Annuler une ordonnance médicale
 * @access  Doctor (son ordonnance), Head Doctor, Admin
 */
router.patch('/:id/cancel',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de l\'ordonnance médicale doit être un entier positif')
  ],
  validateRequest,
  MedicalPrescriptionController.cancelPrescription
);

/**
 * @route   DELETE /api/medical-prescriptions/:id
 * @desc    Supprimer une ordonnance médicale
 * @access  Doctor (son ordonnance), Head Doctor, Admin
 */
router.delete('/:id',
  authorize('doctor', 'head doctor', 'admin', 'admin personnel'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID de l\'ordonnance médicale doit être un entier positif')
  ],
  validateRequest,
  MedicalPrescriptionController.deletePrescription
);

module.exports = router;

