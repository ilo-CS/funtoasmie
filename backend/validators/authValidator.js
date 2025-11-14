const { body } = require('express-validator');
const { LIMITS } = require('../constants');
const { RoleService } = require('../services/roleService');

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: LIMITS.EMAIL_MAX_LENGTH })
    .withMessage(`L'email ne peut pas dépasser ${LIMITS.EMAIL_MAX_LENGTH} caractères`)
    .notEmpty()
    .withMessage('Email requis'),
  
  body('password')
    .isLength({ min: LIMITS.PASSWORD_MIN_LENGTH })
    .withMessage(`Le mot de passe doit contenir au moins ${LIMITS.PASSWORD_MIN_LENGTH} caractères`)
    .isLength({ max: LIMITS.PASSWORD_MAX_LENGTH })
    .withMessage(`Le mot de passe ne peut pas dépasser ${LIMITS.PASSWORD_MAX_LENGTH} caractères`)
    .notEmpty()
    .withMessage('Mot de passe requis')
];

const registerValidation = [
  body('last_name')
    .trim()
    .isLength({ min: LIMITS.NAME_MIN_LENGTH, max: LIMITS.NAME_MAX_LENGTH })
    .withMessage(`Le nom doit contenir entre ${LIMITS.NAME_MIN_LENGTH} et ${LIMITS.NAME_MAX_LENGTH} caractères`)
    .notEmpty()
    .withMessage('Nom requis'),
  body('first_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: LIMITS.NAME_MIN_LENGTH, max: LIMITS.NAME_MAX_LENGTH })
    .withMessage(`Le prénom doit contenir entre ${LIMITS.NAME_MIN_LENGTH} et ${LIMITS.NAME_MAX_LENGTH} caractères`),
  
  body('email')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: LIMITS.EMAIL_MAX_LENGTH })
    .withMessage(`L'email ne peut pas dépasser ${LIMITS.EMAIL_MAX_LENGTH} caractères`)
    .notEmpty()
    .withMessage('Email requis'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ max: LIMITS.PHONE_MAX_LENGTH })
    .withMessage(`Le téléphone ne peut pas dépasser ${LIMITS.PHONE_MAX_LENGTH} caractères`)
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Format de téléphone invalide'),
  
  body('password')
    .isLength({ min: LIMITS.PASSWORD_MIN_LENGTH })
    .withMessage(`Le mot de passe doit contenir au moins ${LIMITS.PASSWORD_MIN_LENGTH} caractères`)
    .isLength({ max: LIMITS.PASSWORD_MAX_LENGTH })
    .withMessage(`Le mot de passe ne peut pas dépasser ${LIMITS.PASSWORD_MAX_LENGTH} caractères`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  
  body('role')
    .optional()
    .custom((value) => {
      if (!RoleService.isValidRole(value)) {
        throw new Error(`Rôle invalide. Valeurs autorisées: ${RoleService.getAllRoles().join(', ')}`);
      }
      return true;
    })
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token requis')
    .isJWT()
    .withMessage('Format de refresh token invalide')
];

const updateProfileValidation = [
  body('first_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: LIMITS.NAME_MIN_LENGTH, max: LIMITS.NAME_MAX_LENGTH })
    .withMessage(`Le prénom doit contenir entre ${LIMITS.NAME_MIN_LENGTH} et ${LIMITS.NAME_MAX_LENGTH} caractères`),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: LIMITS.NAME_MIN_LENGTH, max: LIMITS.NAME_MAX_LENGTH })
    .withMessage(`Le nom doit contenir entre ${LIMITS.NAME_MIN_LENGTH} et ${LIMITS.NAME_MAX_LENGTH} caractères`),
  
  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ max: LIMITS.PHONE_MAX_LENGTH })
    .withMessage(`Le téléphone ne peut pas dépasser ${LIMITS.PHONE_MAX_LENGTH} caractères`)
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Format de téléphone invalide')
];

module.exports = {
  loginValidation,
  registerValidation,
  refreshTokenValidation,
  updateProfileValidation
};
