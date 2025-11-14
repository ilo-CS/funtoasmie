const { body } = require('express-validator');

const medicationValidationRules = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('Le nom du médicament est obligatoire')
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom doit contenir entre 2 et 100 caractères')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La description ne peut pas dépasser 500 caractères')
      .trim(),
    
    body('category_id')
      .notEmpty()
      .withMessage('La catégorie est obligatoire')
      .isInt({ min: 1 })
      .withMessage('L\'ID de la catégorie doit être un entier positif'),
    
    body('unit_name')
      .notEmpty()
      .withMessage('L\'unité est obligatoire')
      .isLength({ min: 1, max: 50 })
      .withMessage('L\'unité doit contenir entre 1 et 50 caractères')
      .trim(),
    
    body('quantity')
      .notEmpty()
      .withMessage('La quantité est obligatoire')
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un entier positif ou zéro'),
    
    body('min_stock')
      .notEmpty()
      .withMessage('Le stock minimum est obligatoire')
      .isInt({ min: 0 })
      .withMessage('Le stock minimum doit être un entier positif ou zéro'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Le prix doit être un nombre positif ou zéro'),
    
    body('supplier')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Le fournisseur ne peut pas dépasser 255 caractères')
      .trim()
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
    
    body('category_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID de la catégorie doit être un entier positif'),
    
    body('unit_name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('L\'unité doit contenir entre 1 et 50 caractères')
      .trim(),
    
    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un entier positif ou zéro'),
    
    body('min_stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Le stock minimum doit être un entier positif ou zéro'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Le prix doit être un nombre positif ou zéro'),
    
    body('supplier')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Le fournisseur ne peut pas dépasser 255 caractères')
      .trim()
  ],

  updateQuantity: [
    body('quantity')
      .notEmpty()
      .withMessage('La quantité est obligatoire')
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un entier positif ou zéro'),
    
    body('reason')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La raison ne peut pas dépasser 255 caractères')
      .trim()
  ]
};

const batchValidationRules = {
  create: [
    body('medication_id')
      .notEmpty()
      .withMessage('Le médicament est obligatoire')
      .isInt({ min: 1 })
      .withMessage('L\'ID du médicament doit être un entier positif'),
    
    body('batch_number')
      .notEmpty()
      .withMessage('Le numéro de lot est obligatoire')
      .isLength({ min: 1, max: 50 })
      .withMessage('Le numéro de lot doit contenir entre 1 et 50 caractères')
      .trim(),
    
    body('expiry_date')
      .notEmpty()
      .withMessage('La date d\'expiration est obligatoire')
      .isISO8601()
      .withMessage('La date d\'expiration doit être au format ISO8601')
      .custom((value) => {
        const expiryDate = new Date(value);
        const today = new Date();
        if (expiryDate <= today) {
          throw new Error('La date d\'expiration doit être dans le futur');
        }
        return true;
      }),
    
    body('quantity')
      .notEmpty()
      .withMessage('La quantité est obligatoire')
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un entier positif ou zéro'),
    
    body('supplier_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du fournisseur doit être un entier positif'),
    
    body('purchase_date')
      .optional()
      .isISO8601()
      .withMessage('La date d\'achat doit être au format ISO8601'),
    
    body('status')
      .optional()
      .isIn(['ACTIVE', 'EXPIRED', 'RECALLED'])
      .withMessage('Le statut doit être ACTIVE, EXPIRED ou RECALLED')
  ],

  update: [
    body('batch_number')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Le numéro de lot doit contenir entre 1 et 50 caractères')
      .trim(),
    
    body('expiry_date')
      .optional()
      .isISO8601()
      .withMessage('La date d\'expiration doit être au format ISO8601'),
    
    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un entier positif ou zéro'),
    
    body('supplier_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du fournisseur doit être un entier positif'),
    
    body('purchase_date')
      .optional()
      .isISO8601()
      .withMessage('La date d\'achat doit être au format ISO8601'),
    
    body('status')
      .optional()
      .isIn(['ACTIVE', 'EXPIRED', 'RECALLED'])
      .withMessage('Le statut doit être ACTIVE, EXPIRED ou RECALLED')
  ]
};

const stockMovementValidationRules = {
  create: [
    body('medication_id')
      .notEmpty()
      .withMessage('Le médicament est obligatoire')
      .isInt({ min: 1 })
      .withMessage('L\'ID du médicament doit être un entier positif'),
    
    body('batch_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('L\'ID du lot doit être un entier positif'),
    
    body('movement_type')
      .notEmpty()
      .withMessage('Le type de mouvement est obligatoire')
      .isIn(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'])
      .withMessage('Le type de mouvement doit être IN, OUT, TRANSFER ou ADJUSTMENT'),
    
    body('quantity')
      .notEmpty()
      .withMessage('La quantité est obligatoire')
      .isInt({ min: 1 })
      .withMessage('La quantité doit être un entier positif'),
    
    body('previous_quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('La quantité précédente doit être un entier positif ou zéro'),
    
    body('new_quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('La nouvelle quantité doit être un entier positif ou zéro'),
    
    body('reason')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La raison ne peut pas dépasser 255 caractères')
      .trim(),
    
    body('reference_number')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Le numéro de référence ne peut pas dépasser 50 caractères')
      .trim()
  ],

  adjustment: [
    body('medication_id')
      .notEmpty()
      .withMessage('Le médicament est obligatoire')
      .isInt({ min: 1 })
      .withMessage('L\'ID du médicament doit être un entier positif'),
    
    body('quantity')
      .notEmpty()
      .withMessage('La quantité est obligatoire')
      .isInt({ min: 0 })
      .withMessage('La quantité doit être un entier positif ou zéro'),
    
    body('reason')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La raison ne peut pas dépasser 255 caractères')
      .trim()
  ]
};

module.exports = {
  medicationValidationRules,
  batchValidationRules,
  stockMovementValidationRules
};
