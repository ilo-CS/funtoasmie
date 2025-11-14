const { body } = require('express-validator');

const supplierValidationRules = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('Le nom du fournisseur est obligatoire')
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom doit contenir entre 2 et 100 caractères')
      .trim(),
    
    body('contact_person')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom du contact doit contenir entre 2 et 100 caractères')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('L\'email doit être valide')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('Le téléphone doit contenir entre 8 et 20 caractères')
      .trim(),
    
    body('address')
      .optional()
      .isLength({ max: 255 })
      .withMessage('L\'adresse ne peut pas dépasser 255 caractères')
      .trim(),
    
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('La note doit être entre 0 et 5'),
    
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('Le statut actif doit être un booléen')
  ],

  update: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom doit contenir entre 2 et 100 caractères')
      .trim(),
    
    body('contact_person')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom du contact doit contenir entre 2 et 100 caractères')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('L\'email doit être valide')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('Le téléphone doit contenir entre 8 et 20 caractères')
      .trim(),
    
    body('address')
      .optional()
      .isLength({ max: 255 })
      .withMessage('L\'adresse ne peut pas dépasser 255 caractères')
      .trim(),
    
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('La note doit être entre 0 et 5'),
    
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('Le statut actif doit être un booléen')
  ]
};

module.exports = {
  supplierValidationRules
};
