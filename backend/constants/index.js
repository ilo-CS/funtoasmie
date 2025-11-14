// ========================================
// CONSTANTES CENTRALISÉES FUNTOA SMIE
// ========================================

// Codes de statut HTTP
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// Messages de succès et d'erreur
const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Connexion réussie',
    REGISTER: 'Utilisateur créé avec succès',
    LOGOUT: 'Déconnexion réussie',
    REFRESH: 'Token rafraîchi avec succès',
    UPDATE: 'Mise à jour réussie',
    DELETE: 'Suppression réussie',
    PROFILE_UPDATED: 'Profil mis à jour avec succès',
    PASSWORD_CHANGED: 'Mot de passe modifié avec succès'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    USER_NOT_FOUND: 'Utilisateur non trouvé',
    USER_EXISTS: 'Un utilisateur avec cet email existe déjà',
    INVALID_TOKEN: 'Token invalide ou manquant',
    EXPIRED_TOKEN: 'Token expiré',
    ACCESS_DENIED: 'Accès non autorisé',
    VALIDATION_ERROR: 'Données invalides',
    SERVER_ERROR: 'Erreur interne du serveur',
    DATABASE_ERROR: 'Erreur de base de données',
    NETWORK_ERROR: 'Erreur de connexion',
    RATE_LIMIT_EXCEEDED: 'Trop de requêtes, veuillez réessayer plus tard',
    ACCOUNT_DISABLED: 'Compte utilisateur désactivé',
    INVALID_EMAIL: 'Format d\'email invalide',
    WEAK_PASSWORD: 'Mot de passe trop faible'
  }
};

// Limites et contraintes
const LIMITS = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 150,
  PHONE_MAX_LENGTH: 20,
  USERS_PER_PAGE: 50
};

// Types de tokens JWT
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh'
};

// Configuration JWT
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ALGORITHM: 'HS256'
};

// Validation et regex
const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Sécurité
const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_HASH_ROUNDS: 12
};

// Export de toutes les constantes
module.exports = {
  HTTP_STATUS,
  MESSAGES,
  LIMITS,
  TOKEN_TYPES,
  JWT_CONFIG,
  VALIDATION,
  SECURITY
};
