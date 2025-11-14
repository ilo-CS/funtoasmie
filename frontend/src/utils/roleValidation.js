// ========================================
// VALIDATION DES RÔLES CÔTÉ FRONTEND
// ========================================

import { ROLES } from '../constants/roles';

/**
 * Service de validation des rôles côté frontend
 */
export class RoleValidationService {
  /**
   * Vérifie si un rôle est valide
   * @param {string} role - Le rôle à valider
   * @returns {boolean} - True si le rôle est valide
   */
  static isValidRole(role) {
    return role && Object.values(ROLES).includes(role);
  }

  /**
   * Vérifie si un utilisateur a un rôle spécifique
   * @param {Object} user - L'objet utilisateur
   * @param {string|Array} requiredRoles - Rôle(s) requis
   * @returns {boolean} - True si l'utilisateur a le(s) rôle(s) requis
   */
  static hasRole(user, requiredRoles) {
    if (!user || !user.role) return false;
    
    const userRole = user.role;
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    return rolesToCheck.includes(userRole);
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean} - True si l'utilisateur est admin
   */
  static isAdmin(user) {
    return this.hasRole(user, ROLES.ADMIN);
  }

  /**
   * Vérifie si l'utilisateur est un employé (non admin)
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean} - True si l'utilisateur est un employé
   */
  static isEmployee(user) {
    return this.hasRole(user, [
      ROLES.USER, 
      ROLES.DOCTOR, 
      ROLES.HEAD_DOCTOR,
      ROLES.PHARMACIST,
      ROLES.ADMIN_PHARMACIST,
      ROLES.RECEPTIONIST, 
      ROLES.NURSE
    ]);
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux fonctionnalités patients
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean} - True si l'utilisateur peut accéder aux fonctionnalités patients
   */
  static canAccessPatientFeatures(user) {
    return this.hasRole(user, [
      ROLES.USER, 
      ROLES.DOCTOR, 
      ROLES.HEAD_DOCTOR,
      ROLES.PHARMACIST,
      ROLES.ADMIN_PHARMACIST,
      ROLES.RECEPTIONIST, 
      ROLES.NURSE,
      ROLES.ADMIN_PERSONNEL,
      ROLES.ADMIN
    ]);
  }

  /**
   * Vérifie si l'utilisateur peut gérer les utilisateurs
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean} - True si l'utilisateur peut gérer les utilisateurs
   */
  static canManageUsers(user) {
    return this.hasRole(user, [ROLES.ADMIN, ROLES.ADMIN_PERSONNEL]);
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux rapports
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean} - True si l'utilisateur peut accéder aux rapports
   */
  static canAccessReports(user) {
    return this.hasRole(user, [
      ROLES.ADMIN,
      ROLES.ADMIN_PERSONNEL,
      ROLES.DOCTOR,
      ROLES.HEAD_DOCTOR,
      ROLES.PHARMACIST,
      ROLES.ADMIN_PHARMACIST
    ]);
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux paramètres
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean} - True si l'utilisateur peut accéder aux paramètres
   */
  static canAccessSettings(user) {
    return this.hasRole(user, [ROLES.ADMIN, ROLES.ADMIN_PERSONNEL]);
  }

  /**
   * Vérifie si l'utilisateur peut gérer les entreprises
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean} - True si l'utilisateur peut gérer les entreprises
   */
  static canManageCompany(user) {
    return this.hasRole(user, [ROLES.ADMIN, ROLES.ADMIN_PERSONNEL]);
  }

  /**
   * Obtient le niveau de permission d'un rôle
   * @param {string} role - Le rôle
   * @returns {number} - Niveau de permission (plus élevé = plus de permissions)
   */
  static getRolePermissionLevel(role) {
    const permissionLevels = {
      [ROLES.ADMIN]: 100,
      [ROLES.ADMIN_PERSONNEL]: 95,
      [ROLES.ADMIN_PHARMACIST]: 85,
      [ROLES.HEAD_DOCTOR]: 80,
      [ROLES.DOCTOR]: 75,
      [ROLES.PHARMACIST]: 70,
      [ROLES.RECEPTIONIST]: 60,
      [ROLES.NURSE]: 50,
      [ROLES.USER]: 10
    };
    
    return permissionLevels[role] || 0;
  }

  /**
   * Vérifie si un utilisateur a un niveau de permission suffisant
   * @param {Object} user - L'objet utilisateur
   * @param {number} requiredLevel - Niveau de permission requis
   * @returns {boolean} - True si l'utilisateur a le niveau requis
   */
  static hasPermissionLevel(user, requiredLevel) {
    if (!user || !user.role) return false;
    return this.getRolePermissionLevel(user.role) >= requiredLevel;
  }

  /**
   * Valide les permissions d'accès à une route
   * @param {Object} user - L'objet utilisateur
   * @param {string} route - La route à valider
   * @returns {Object} - Résultat de la validation
   */
  static validateRouteAccess(user, route) {
    if (!user) {
      return {
        hasAccess: false,
        reason: 'Utilisateur non connecté',
        redirectTo: '/login'
      };
    }

    if (!this.isValidRole(user.role)) {
      return {
        hasAccess: false,
        reason: 'Rôle utilisateur invalide',
        redirectTo: '/login'
      };
    }

    // Validation des routes spécifiques
    const routePermissions = {
      '/admin': () => this.isAdmin(user) || this.hasRole(user, ROLES.ADMIN_PERSONNEL),
      '/admin/users': () => this.canManageUsers(user),
      '/admin/reports': () => this.canAccessReports(user),
      '/admin/settings': () => this.canAccessSettings(user),
      '/admin-pharmacist': () => this.hasRole(user, ROLES.ADMIN_PHARMACIST),
      '/doctor': () => this.hasRole(user, [ROLES.DOCTOR, ROLES.HEAD_DOCTOR]),
      '/pharmacist': () => this.hasRole(user, [ROLES.PHARMACIST, ROLES.ADMIN_PHARMACIST]),
      '/user': () => this.hasRole(user, ROLES.USER)
    };

    const hasAccess = routePermissions[route] ? routePermissions[route]() : true;

    if (!hasAccess) {
      return {
        hasAccess: false,
        reason: 'Permissions insuffisantes pour accéder à cette page',
        redirectTo: this.getRedirectUrl(user.role)
      };
    }

    return {
      hasAccess: true,
      reason: 'Accès autorisé'
    };
  }

  /**
   * Obtient l'URL de redirection selon le rôle
   * @param {string} role - Le rôle de l'utilisateur
   * @returns {string} - URL de redirection
   */
  static getRedirectUrl(role) {
    const redirectUrls = {
      [ROLES.ADMIN]: '/admin',
      [ROLES.ADMIN_PERSONNEL]: '/admin',
      [ROLES.ADMIN_PHARMACIST]: '/admin-pharmacist',
      [ROLES.HEAD_DOCTOR]: '/doctor',
      [ROLES.DOCTOR]: '/doctor',
      [ROLES.PHARMACIST]: '/pharmacist',
      [ROLES.RECEPTIONIST]: '/receptionist',
      [ROLES.NURSE]: '/nurse',
      [ROLES.USER]: '/user'
    };
    
    return redirectUrls[role] || '/login';
  }

  /**
   * Obtient les fonctionnalités disponibles pour un rôle
   * @param {string} role - Le rôle de l'utilisateur
   * @returns {Array} - Liste des fonctionnalités disponibles
   */
  static getAvailableFeatures(role) {
    const features = {
      [ROLES.ADMIN]: [
        'user_management',
        'reports',
        'settings',
        'patient_management',
        'dashboard'
      ],
      [ROLES.ADMIN_PERSONNEL]: [
        'user_management',
        'reports',
        'settings',
        'patient_management',
        'dashboard'
      ],
      [ROLES.ADMIN_PHARMACIST]: [
        'patient_management',
        'reports',
        'dashboard'
      ],
      [ROLES.HEAD_DOCTOR]: [
        'patient_management',
        'reports',
        'dashboard'
      ],
      [ROLES.DOCTOR]: [
        'patient_management',
        'reports',
        'dashboard'
      ],
      [ROLES.PHARMACIST]: [
        'patient_management',
        'reports',
        'dashboard'
      ],
      [ROLES.RECEPTIONIST]: [
        'patient_management',
        'dashboard'
      ],
      [ROLES.NURSE]: [
        'patient_management',
        'dashboard'
      ],
      [ROLES.USER]: [
        'dashboard'
      ]
    };
    
    return features[role] || [];
  }

  /**
   * Vérifie si une fonctionnalité est disponible pour un rôle
   * @param {Object} user - L'objet utilisateur
   * @param {string} feature - La fonctionnalité à vérifier
   * @returns {boolean} - True si la fonctionnalité est disponible
   */
  static hasFeature(user, feature) {
    if (!user || !user.role) return false;
    const availableFeatures = this.getAvailableFeatures(user.role);
    return availableFeatures.includes(feature);
  }
}

/**
 * Fonction utilitaire pour valider les rôles
 * @param {Object} user - L'objet utilisateur
 * @param {string|Array} requiredRoles - Rôle(s) requis
 * @returns {boolean} - True si l'utilisateur a le(s) rôle(s) requis
 */
export const hasRole = (user, requiredRoles) => {
  return RoleValidationService.hasRole(user, requiredRoles);
};

/**
 * Fonction utilitaire pour vérifier si l'utilisateur est admin
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur est admin
 */
export const isAdmin = (user) => {
  return RoleValidationService.isAdmin(user);
};

/**
 * Fonction utilitaire pour valider l'accès à une route
 * @param {Object} user - L'objet utilisateur
 * @param {string} route - La route à valider
 * @returns {Object} - Résultat de la validation
 */
export const validateRouteAccess = (user, route) => {
  return RoleValidationService.validateRouteAccess(user, route);
};

export default RoleValidationService;
