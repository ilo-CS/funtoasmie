// Gestionnaire d'erreurs centralisé
export const getErrorMessage = (error) => {
  if (!error) return 'Une erreur inattendue s\'est produite.';

  // Vérifier d'abord les erreurs d'authentification (identifiants incorrects)
  if (error.message?.includes('Email ou mot de passe incorrect') || 
      error.message?.includes('Invalid credentials') ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('Invalid email or password') ||
      error.message?.includes('Wrong credentials')) {
    return 'Email ou mot de passe incorrect.';
  }
  
  // Erreurs d'accès refusé (permissions)
  if (error.message?.includes('Accès refusé') || 
      error.message?.includes('Access denied') ||
      error.message?.includes('Forbidden')) {
    return 'Accès refusé. Vérifiez vos identifiants.';
  }
  
  // Erreurs de session expirée (seulement si l'utilisateur était connecté)
  if (error.message?.includes('Session expirée') || 
      error.message?.includes('Token expired') ||
      error.message?.includes('Session expired')) {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  
  // Erreurs de réseau
  if (error.message?.includes('connexion au serveur') ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Failed to fetch')) {
    return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
  }
  
  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
  }
  
  // Erreurs de validation
  if (error.message?.includes('Données invalides') ||
      error.message?.includes('Validation error')) {
    return 'Les données saisies sont invalides.';
  }
  
  // Erreurs de serveur
  if (error.message?.includes('Erreur du serveur') ||
      error.message?.includes('Internal server error')) {
    return 'Erreur du serveur. Veuillez réessayer plus tard.';
  }
  
  // Erreur par défaut
  return error.message || 'Une erreur inattendue s\'est produite.';
};

// Obtenir le type d'erreur pour le style
export const getErrorType = (error) => {
  // Erreurs d'authentification (identifiants incorrects) - Rouge
  if (error.message?.includes('Email ou mot de passe incorrect') || 
      error.message?.includes('Invalid credentials') ||
      error.message?.includes('Unauthorized') ||
      error.message?.includes('Invalid email or password') ||
      error.message?.includes('Wrong credentials')) {
    return 'error';
  }
  
  // Erreurs d'accès refusé - Orange
  if (error.message?.includes('Accès refusé') || 
      error.message?.includes('Access denied') ||
      error.message?.includes('Forbidden')) {
    return 'warning';
  }
  
  // Erreurs de session expirée - Orange
  if (error.message?.includes('Session expirée') || 
      error.message?.includes('Token expired') ||
      error.message?.includes('Session expired')) {
    return 'warning';
  }
  
  // Erreurs de réseau - Orange
  if (error.message?.includes('connexion au serveur') ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Failed to fetch') ||
      (error.name === 'TypeError' && error.message?.includes('fetch'))) {
    return 'warning';
  }
  
  // Erreurs de validation - Bleu
  if (error.message?.includes('Données invalides') ||
      error.message?.includes('Validation error')) {
    return 'info';
  }
  
  // Erreurs de serveur - Rouge
  if (error.message?.includes('Erreur du serveur') ||
      error.message?.includes('Internal server error')) {
    return 'error';
  }
  
  return 'error';
};

// Règles de validation pour les formulaires
export const validationRules = {
  email: (value) => {
    if (!value) return 'L\'email est requis';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Format d\'email invalide';
    return null;
  },
  
  password: (value) => {
    if (!value) return 'Le mot de passe est requis';
    if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    if (value.length > 128) return 'Le mot de passe ne peut pas dépasser 128 caractères';
    // Validation des critères de sécurité (majuscule, minuscule, chiffre)
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
    }
    return null;
  },
  
  confirmPassword: (value, originalPassword) => {
    if (!value) return 'La confirmation du mot de passe est requise';
    if (value !== originalPassword) return 'Les mots de passe ne correspondent pas';
    return null;
  },
  
  // Validation du nom (obligatoire)
  lastName: (value) => {
    if (!value) return 'Le nom est requis';
    if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
    if (value.length > 100) return 'Le nom ne peut pas dépasser 100 caractères';
    // Validation des caractères autorisés (lettres, espaces, apostrophes, tirets)
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
      return 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets';
    }
    return null;
  },

  // Validation du prénom (optionnel)
  firstName: (value) => {
    if (!value) return null; // Le prénom est optionnel
    if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
    if (value.length > 100) return 'Le prénom ne peut pas dépasser 100 caractères';
    // Validation des caractères autorisés (lettres, espaces, apostrophes, tirets)
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
      return 'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets';
    }
    return null;
  },
  
  // Validation du téléphone
  phone: (value) => {
    if (!value) return null; // Le téléphone est optionnel
    if (value.length > 20) return 'Le téléphone ne peut pas dépasser 20 caractères';
    // Validation du format de téléphone
    if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
      return 'Format de téléphone invalide';
    }
    return null;
  }
};

// Types d'erreurs pour les notifications
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

