import { useAuth } from '../context/AuthContext';
import { RoleValidationService } from '../utils/roleValidation';

/**
 * Hook personnalisé pour la gestion des rôles
 * @returns {Object} - Fonctions et données liées aux rôles
 */
export const useRole = () => {
  const { user, isAuthenticated } = useAuth();

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param {string|Array} requiredRoles - Rôle(s) requis
   * @returns {boolean} - True si l'utilisateur a le(s) rôle(s) requis
   */
  const hasRole = (requiredRoles) => {
    return RoleValidationService.hasRole(user, requiredRoles);
  };

  /**
   * Vérifie si l'utilisateur est administrateur
   * @returns {boolean} - True si l'utilisateur est admin
   */
  const isAdmin = () => {
    return RoleValidationService.isAdmin(user);
  };

  /**
   * Vérifie si l'utilisateur est un employé
   * @returns {boolean} - True si l'utilisateur est un employé
   */
  const isEmployee = () => {
    return RoleValidationService.isEmployee(user);
  };

  /**
   * Vérifie si l'utilisateur peut accéder aux fonctionnalités patients
   * @returns {boolean} - True si l'utilisateur peut accéder aux fonctionnalités patients
   */
  const canAccessPatientFeatures = () => {
    return RoleValidationService.canAccessPatientFeatures(user);
  };

  /**
   * Vérifie si l'utilisateur peut gérer les utilisateurs
   * @returns {boolean} - True si l'utilisateur peut gérer les utilisateurs
   */
  const canManageUsers = () => {
    return RoleValidationService.canManageUsers(user);
  };

  /**
   * Vérifie si l'utilisateur peut accéder aux rapports
   * @returns {boolean} - True si l'utilisateur peut accéder aux rapports
   */
  const canAccessReports = () => {
    return RoleValidationService.canAccessReports(user);
  };

  /**
   * Vérifie si l'utilisateur peut accéder aux paramètres
   * @returns {boolean} - True si l'utilisateur peut accéder aux paramètres
   */
  const canAccessSettings = () => {
    return RoleValidationService.canAccessSettings(user);
  };

  /**
   * Vérifie si l'utilisateur peut gérer les entreprises
   * @returns {boolean} - True si l'utilisateur peut gérer les entreprises
   */
  const canManageCompany = () => {
    return RoleValidationService.canManageCompany(user);
  };

  /**
   * Vérifie si l'utilisateur a un niveau de permission suffisant
   * @param {number} requiredLevel - Niveau de permission requis
   * @returns {boolean} - True si l'utilisateur a le niveau requis
   */
  const hasPermissionLevel = (requiredLevel) => {
    return RoleValidationService.hasPermissionLevel(user, requiredLevel);
  };

  /**
   * Valide l'accès à une route
   * @param {string} route - La route à valider
   * @returns {Object} - Résultat de la validation
   */
  const validateRouteAccess = (route) => {
    return RoleValidationService.validateRouteAccess(user, route);
  };

  /**
   * Vérifie si une fonctionnalité est disponible
   * @param {string} feature - La fonctionnalité à vérifier
   * @returns {boolean} - True si la fonctionnalité est disponible
   */
  const hasFeature = (feature) => {
    return RoleValidationService.hasFeature(user, feature);
  };

  /**
   * Obtient les fonctionnalités disponibles pour l'utilisateur
   * @returns {Array} - Liste des fonctionnalités disponibles
   */
  const getAvailableFeatures = () => {
    return RoleValidationService.getAvailableFeatures(user?.role);
  };

  /**
   * Obtient le niveau de permission de l'utilisateur
   * @returns {number} - Niveau de permission
   */
  const getPermissionLevel = () => {
    return RoleValidationService.getRolePermissionLevel(user?.role);
  };

  /**
   * Obtient l'URL de redirection pour l'utilisateur
   * @returns {string} - URL de redirection
   */
  const getRedirectUrl = () => {
    return RoleValidationService.getRedirectUrl(user?.role);
  };

  return {
    // Données
    user,
    isAuthenticated,
    userRole: user?.role,
    
    // Fonctions de validation
    hasRole,
    isAdmin,
    isEmployee,
    canAccessPatientFeatures,
    canManageUsers,
    canManageCompany,
    canAccessReports,
    canAccessSettings,
    hasPermissionLevel,
    validateRouteAccess,
    hasFeature,
    getAvailableFeatures,
    getPermissionLevel,
    getRedirectUrl
  };
};

export default useRole;
