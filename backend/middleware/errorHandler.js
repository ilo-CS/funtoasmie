/**
 * Middleware de gestion d'erreurs global
 * Centralise la gestion des erreurs de l'application
 */

const { HTTP_STATUS, MESSAGES } = require('../constants');

/**
 * Middleware de gestion d'erreurs
 * @param {Error} err - Erreur à traiter
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  console.error('Erreur:', err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message: MESSAGES.ERROR.VALIDATION_ERROR,
      details: message,
      statusCode: HTTP_STATUS.BAD_REQUEST
    };
  }

  // Erreur de clé dupliquée MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Données dupliquées';
    error = {
      message: MESSAGES.ERROR.USER_EXISTS,
      details: message,
      statusCode: HTTP_STATUS.CONFLICT
    };
  }

  // Erreur de connexion à la base de données
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    error = {
      message: MESSAGES.ERROR.DATABASE_ERROR,
      details: 'Impossible de se connecter à la base de données',
      statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE
    };
  }

  // Erreur de timeout
  if (err.code === 'ETIMEDOUT') {
    error = {
      message: MESSAGES.ERROR.NETWORK_ERROR,
      details: 'Timeout de connexion',
      statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE
    };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: MESSAGES.ERROR.INVALID_TOKEN,
      statusCode: HTTP_STATUS.UNAUTHORIZED
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: MESSAGES.ERROR.EXPIRED_TOKEN,
      statusCode: HTTP_STATUS.UNAUTHORIZED
    };
  }

  // Erreur de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = {
      message: MESSAGES.ERROR.VALIDATION_ERROR,
      details: 'Format JSON invalide',
      statusCode: HTTP_STATUS.BAD_REQUEST
    };
  }

  // Erreur par défaut
  if (!error.statusCode) {
    error = {
      message: MESSAGES.ERROR.SERVER_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }

  // Réponse d'erreur standardisée
  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: error.details 
    })
  };

  res.status(error.statusCode).json(response);
};

/**
 * Middleware pour les routes non trouvées
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};

/**
 * Middleware de validation des erreurs express-validator
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
const validationErrorHandler = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    const error = new Error(MESSAGES.ERROR.VALIDATION_ERROR);
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.details = errors.map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    return next(error);
  }
  next();
};

module.exports = {
  errorHandler,
  notFound,
  validationErrorHandler
};
