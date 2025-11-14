const { body } = require('express-validator');

const categoryValidationRules = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('Le nom de la catégorie est obligatoire')
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom doit contenir entre 2 et 100 caractères')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La description ne peut pas dépasser 500 caractères')
      .trim(),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('La couleur doit être au format hexadécimal (#RRGGBB)')
  ],

  update: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom doit contenir entre 2 et 100 caractères')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La description ne peut pas dépasser 500 caractères')
      .trim(),
    
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('La couleur doit être au format hexadécimal (#RRGGBB)')
  ]
};

module.exports = {
  categoryValidationRules
};
