/**
 * Middleware de limitation du taux de requêtes
 * Protège contre les attaques par déni de service
 */

const rateLimit = require('express-rate-limit');

// Configuration de base pour la limitation
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Trop de requêtes, veuillez réessayer plus tard',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Limitation générale pour toutes les routes
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requêtes par fenêtre
  'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes'
);

// Limitation stricte pour l'authentification
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 tentatives de connexion par fenêtre
  'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
);

// Limitation pour les tentatives de mot de passe
const passwordLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  3, // 3 tentatives de changement de mot de passe
  'Trop de tentatives de changement de mot de passe, veuillez réessayer dans 15 minutes'
);

// Limitation pour l'inscription
const registerLimiter = createRateLimit(
  60 * 60 * 1000, // 1 heure
  3, // 3 inscriptions par heure
  'Trop d\'inscriptions depuis cette IP, veuillez réessayer dans 1 heure'
);

module.exports = {
  generalLimiter,
  authLimiter,
  passwordLimiter,
  registerLimiter
};
