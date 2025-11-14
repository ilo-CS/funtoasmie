// Constantes pour la page de login

export const LOGIN_CONSTANTS = {
  // Messages d'erreur
  MESSAGES: {
    EMAIL_REQUIRED: 'L\'email est requis',
    EMAIL_INVALID: 'Format d\'email invalide',
    PASSWORD_REQUIRED: 'Le mot de passe est requis',
    PASSWORD_MIN_LENGTH: 'Le mot de passe doit contenir au moins 6 caractères',
    LOGIN_ERROR: 'Erreur de connexion',
    NETWORK_ERROR: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
  },

  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /\S+@\S+\.\S+/
  },

  // Placeholders
  PLACEHOLDERS: {
    EMAIL: 'Entrez votre e-mail',
    PASSWORD: 'Entrez votre mot de passe'
  },

  // Animation
  ANIMATION: {
    DELAY: 100,
    DURATION: 600
  },

  // Styles
  STYLES: {
    LOGO_SIZE: 80,
    CARD_PADDING: 5,
    BORDER_RADIUS: 20
  }
};

// Types d'erreurs
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTH: 'auth',
  SERVER: 'server'
};

// États du formulaire
export const FORM_STATES = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error'
};
