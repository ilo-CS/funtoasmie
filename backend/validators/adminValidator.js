const { body, query, param } = require('express-validator');
const { LIMITS } = require('../constants');
const { RoleService } = require('../services/roleService');

const validateRole = (value) => {
  if (!value || !RoleService.isValidRole(value)) {
    throw new Error(`Rôle invalide. Rôles acceptés: ${RoleService.getAllRoles().join(', ')}`);
  }
  return true;
};
const validateCreateUser = [
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets')
    .notEmpty()
    .withMessage('Le nom est requis'),

  body('first_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le prénom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('email')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: 150 })
    .withMessage('L\'email ne peut pas dépasser 150 caractères'),

  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage('Le téléphone ne peut pas dépasser 20 caractères')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Format de téléphone invalide'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  body('role')
    .optional()
    .custom(validateRole),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Le statut doit être un booléen')
];

const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('L\'ID utilisateur doit être un entier positif'),

  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('first_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le prénom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: 150 })
    .withMessage('L\'email ne peut pas dépasser 150 caractères'),

  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage('Le téléphone ne peut pas dépasser 20 caractères')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Format de téléphone invalide'),

  body('password')
    .optional()
    .isLength({ min: 6, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  body('role')
    .optional()
    .custom(validateRole),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Le statut doit être un booléen')
];

const validateUserQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être un entier entre 1 et 100'),

  query('search')
    .optional()
    .custom((value) => {
      if (!value || value === '') {
        return true; // Permettre les chaînes vides
      }
      if (value.length > 100) {
        throw new Error('Le terme de recherche ne peut pas dépasser 100 caractères');
      }
      if (!/^[a-zA-ZÀ-ÿ0-9\s@\.\-_]+$/.test(value)) {
        throw new Error('Le terme de recherche contient des caractères non autorisés');
      }
      return true;
    }),

  query('role')
    .optional()
    .custom((value) => {
      if (!value || value === '' || value === 'all' || RoleService.isValidRole(value)) {
        return true;
      }
      throw new Error(`Le rôle doit être l'un des suivants: ${RoleService.getAllRoles().join(', ')}, all ou vide`);
    }),

  query('status')
    .optional()
    .custom((value) => {
      if (!value || value === '' || ['active', 'inactive', 'all'].includes(value)) {
        return true;
      }
      throw new Error('Le statut doit être: active, inactive, all ou vide');
    })
];

const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('L\'ID utilisateur doit être un entier positif')
];

const validateUserStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('L\'ID utilisateur doit être un entier positif'),

  body('is_active')
    .isBoolean()
    .withMessage('Le statut doit être un booléen')
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateUserQuery,
  validateUserId,
  validateUserStatus
};
