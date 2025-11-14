const express = require('express');
const router = express.Router();
const {authenticateToken, authorize} = require('../middleware/auth');
const {ROLES} = require('../services/roleService');
const {body} = require('express-validator');
const CompanyController = require('../controllers/companyController');

const companyValidation = [
    body('name')
        .notEmpty().withMessage('Le nom de la société est obligatoire')
        .isLength({min: 2, max: 100}).withMessage('Le nom de la société doit contenir entre 2 et 100 caractères'),
    body('address')
        .optional()
        .isLength({max: 255}).withMessage('L\'adresse ne peut pas dépasser 255 caractères'),
    body('city')
        .optional()
        .isLength({max: 100}).withMessage('La ville ne peut pas dépasser 100 caractères'),
    body('phone')
        .optional()
        .isLength({max: 20}).withMessage('Le téléphone ne peut pas dépasser 20 caractères'),
    body('mail')
        .optional()
        .isEmail().withMessage('L\'email doit être valide'),
];

router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PERSONNEL));

router.get('/active', CompanyController.getActiveCompanies);
router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);

// Créer un nouveau company
router.post('/', companyValidation, CompanyController.createCompany);

router.put('/:id', companyValidation, CompanyController.updateCompany);
router.patch('/:id/deactivate', CompanyController.deactivateCompany);
router.delete('/:id', CompanyController.deleteCompany);

module.exports = router;