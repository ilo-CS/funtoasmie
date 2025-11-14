const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { loginValidation, registerValidation, refreshTokenValidation } = require('../validators/authValidator');

// Routes d'authentification

// POST /api/auth/login - Connexion (protégé par rate limiter)
router.post('/login', authLimiter, loginValidation, authController.login);

// POST /api/auth/register - Inscription (protégé par rate limiter)
router.post('/register', registerLimiter, registerValidation, authController.register);

// POST /api/auth/logout - Déconnexion
router.post('/logout', authenticateToken, authController.logout);

// POST /api/auth/refresh - Rafraîchir le token
router.post('/refresh', refreshTokenValidation, authController.refreshToken);

// GET /api/auth/profile - Profil de l'utilisateur connecté
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
