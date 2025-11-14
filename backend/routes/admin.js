const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus 
} = require('../controllers/adminController');
const { 
  validateCreateUser, 
  validateUpdateUser, 
  validateUserQuery 
} = require('../validators/adminValidator');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification et le rôle administrateur
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route GET /api/admin/users
 * @desc Récupérer la liste des utilisateurs avec pagination et filtres
 * @access Private (Admin only)
 */
router.get('/users', validateUserQuery, getAllUsers);

/**
 * @route GET /api/admin/users/:id
 * @desc Récupérer un utilisateur par son ID
 * @access Private (Admin only)
 */
router.get('/users/:id', getUserById);

/**
 * @route POST /api/admin/users
 * @desc Créer un nouvel utilisateur
 * @access Private (Admin only)
 */
router.post('/users', validateCreateUser, createUser);

/**
 * @route PUT /api/admin/users/:id
 * @desc Mettre à jour un utilisateur
 * @access Private (Admin only)
 */
router.put('/users/:id', validateUpdateUser, updateUser);

/**
 * @route DELETE /api/admin/users/:id
 * @desc Supprimer un utilisateur (soft delete)
 * @access Private (Admin only)
 */
router.delete('/users/:id', deleteUser);

/**
 * @route PUT /api/admin/users/:id/status
 * @desc Activer/Désactiver un utilisateur
 * @access Private (Admin only)
 */
router.put('/users/:id/status', toggleUserStatus);

module.exports = router;
