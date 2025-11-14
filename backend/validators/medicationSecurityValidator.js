const { body } = require('express-validator');

/**
 * Validateur de sécurité pour les modifications de médicaments
 */
class MedicationSecurityValidator {
  
  /**
   * Validation des modifications de quantité avec contrôles de sécurité
   */
  static quantityUpdateRules() {
    return [
      body('quantity')
        .notEmpty()
        .withMessage('La quantité est obligatoire')
        .isInt({ min: 0 })
        .withMessage('La quantité doit être un entier positif ou zéro')
        .custom((value, { req }) => {
          // Vérifier les limites métier
          if (value > 100000) {
            throw new Error('La quantité ne peut pas dépasser 100,000 unités');
          }
          return true;
        }),
      
      body('reason')
        .notEmpty()
        .withMessage('La raison de la modification est obligatoire')
        .isLength({ min: 5, max: 255 })
        .withMessage('La raison doit contenir entre 5 et 255 caractères')
        .trim()
        .custom((value) => {
          // Vérifier que la raison n'est pas générique
          const genericReasons = ['test', 'modification', 'changement', 'update'];
          if (genericReasons.includes(value.toLowerCase())) {
            throw new Error('Veuillez fournir une raison plus spécifique');
          }
          return true;
        }),
      
      body('previous_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La quantité précédente doit être un entier positif ou zéro')
    ];
  }

  /**
   * Validation des modifications générales avec contrôles de sécurité
   */
  static generalUpdateRules() {
    return [
      body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères')
        .trim()
        .custom((value) => {
          // Vérifier les caractères interdits
          const forbiddenChars = /[<>\"'&]/;
          if (forbiddenChars.test(value)) {
            throw new Error('Le nom contient des caractères non autorisés');
          }
          return true;
        }),
      
      body('quantity')
        .optional()
        .isInt({ min: 0, max: 100000 })
        .withMessage('La quantité doit être entre 0 et 100,000')
        .custom((value, { req }) => {
          // Si on modifie la quantité, vérifier la cohérence
          if (value !== undefined && req.body.previous_quantity !== undefined) {
            const difference = Math.abs(value - req.body.previous_quantity);
            if (difference > 1000) {
              throw new Error('Changement de quantité trop important, utilisez la route spécifique /quantity');
            }
          }
          return true;
        }),
      
      body('min_stock')
        .optional()
        .isInt({ min: 0, max: 10000 })
        .withMessage('Le stock minimum doit être entre 0 et 10,000')
        .custom((value, { req }) => {
          // Vérifier que le stock minimum n'est pas supérieur à la quantité
          if (value !== undefined && req.body.quantity !== undefined) {
            if (value > req.body.quantity) {
              throw new Error('Le stock minimum ne peut pas être supérieur à la quantité');
            }
          }
          return true;
        }),
      
      body('price')
        .optional()
        .isFloat({ min: 0, max: 1000000 })
        .withMessage('Le prix doit être entre 0 et 1,000,000 Ar'),
      
      body('supplier')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Le fournisseur ne peut pas dépasser 100 caractères')
        .trim()
        .custom((value) => {
          if (value && /[<>\"'&]/.test(value)) {
            throw new Error('Le fournisseur contient des caractères non autorisés');
          }
          return true;
        })
    ];
  }

  /**
   * Validation des créations avec contrôles de sécurité
   */
  static createRules() {
    return [
      body('name')
        .notEmpty()
        .withMessage('Le nom du médicament est obligatoire')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères')
        .trim()
        .custom((value) => {
          const forbiddenChars = /[<>\"'&]/;
          if (forbiddenChars.test(value)) {
            throw new Error('Le nom contient des caractères non autorisés');
          }
          return true;
        }),
      
      body('quantity')
        .notEmpty()
        .withMessage('La quantité est obligatoire')
        .isInt({ min: 0, max: 100000 })
        .withMessage('La quantité doit être entre 0 et 100,000'),
      
      body('min_stock')
        .notEmpty()
        .withMessage('Le stock minimum est obligatoire')
        .isInt({ min: 0, max: 10000 })
        .withMessage('Le stock minimum doit être entre 0 et 10,000')
        .custom((value, { req }) => {
          if (value > req.body.quantity) {
            throw new Error('Le stock minimum ne peut pas être supérieur à la quantité');
          }
          return true;
        }),
      
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
        .trim()
        .isIn([
          'comprimés', 'gélules', 'flacons', 'ampoules', 'seringues',
          'ml', 'l', 'mg', 'g', 'unités', 'boîtes', 'plaquettes',
          'tubes', 'sachets', 'pompes', 'inhalateurs'
        ])
        .withMessage('Unité non autorisée'),
      
      body('price')
        .optional()
        .isFloat({ min: 0, max: 1000000 })
        .withMessage('Le prix doit être entre 0 et 1,000,000 Ar'),
      
      body('supplier')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Le fournisseur ne peut pas dépasser 100 caractères')
        .trim()
    ];
  }

  /**
   * Middleware de validation des changements critiques
   */
  static validateCriticalChanges() {
    return (req, res, next) => {
      const { quantity, previous_quantity } = req.body;
      
      if (quantity !== undefined && previous_quantity !== undefined) {
        const difference = Math.abs(quantity - previous_quantity);
        const percentage = (difference / previous_quantity) * 100;
        
        // Alerte pour changement > 50%
        if (percentage > 50) {
          console.warn(`CHANGE_ALERT: Critical quantity change detected - ${previous_quantity} -> ${quantity} (${percentage.toFixed(1)}%)`);
        }
        
        // Alerte pour changement > 20%
        if (percentage > 20) {
          console.warn(`CHANGE_WARNING: Significant quantity change detected - ${previous_quantity} -> ${quantity} (${percentage.toFixed(1)}%)`);
        }
      }
      
      next();
    };
  }

  /**
   * Middleware de logging des actions sensibles
   */
  static logSensitiveActions() {
    return (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // Logger les modifications de quantité
        if (req.route?.path?.includes('/quantity') && req.method === 'PUT') {
          console.log(`QUANTITY_UPDATE: Medication ${req.params.id}, User: ${req.user?.id}, Reason: ${req.body.reason}`);
        }
        
        // Logger les modifications générales
        if (req.route?.path?.includes('/medications') && req.method === 'PUT') {
          console.log(`MEDICATION_UPDATE: Medication ${req.params.id}, User: ${req.user?.id}, Fields: ${Object.keys(req.body).join(', ')}`);
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
}

module.exports = MedicationSecurityValidator;
