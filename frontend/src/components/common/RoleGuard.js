import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { ROLES } from '../../constants/roles';

/**
 * Composant de protection basé sur les rôles
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants à afficher
 * @param {string|Array} props.requiredRoles - Rôle(s) requis pour accéder au contenu
 * @param {string} props.fallbackPath - Chemin de redirection si l'accès est refusé
 * @param {React.ReactNode} props.fallbackComponent - Composant à afficher si l'accès est refusé
 * @param {boolean} props.requireAll - Si true, l'utilisateur doit avoir tous les rôles (AND), sinon un seul suffit (OR)
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
const RoleGuard = ({ 
  children, 
  requiredRoles, 
  fallbackPath = '/unauthorized',
  fallbackComponent = null,
  requireAll = false 
}) => {
  const { hasRole, isAuthenticated } = useRole();

  // Si l'utilisateur n'est pas connecté, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si aucun rôle requis n'est spécifié, autoriser l'accès
  if (!requiredRoles) {
    return children;
  }

  // Vérifier les permissions
  let hasAccess = false;

  if (requireAll) {
    // L'utilisateur doit avoir tous les rôles requis
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    hasAccess = rolesArray.every(role => hasRole(role));
  } else {
    // L'utilisateur doit avoir au moins un des rôles requis
    hasAccess = hasRole(requiredRoles);
  }

  // Si l'accès est autorisé, afficher le contenu
  if (hasAccess) {
    return children;
  }

  // Si un composant de fallback est fourni, l'afficher
  if (fallbackComponent) {
    return fallbackComponent;
  }

  // Sinon, rediriger vers le chemin de fallback
  return <Navigate to={fallbackPath} replace />;
};

/**
 * Composant de protection pour les administrateurs uniquement
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
export const AdminGuard = ({ children, fallbackPath = '/unauthorized' }) => {
  return (
    <RoleGuard 
      requiredRoles={ROLES.ADMIN} 
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Composant de protection pour les employés (non admin)
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
export const EmployeeGuard = ({ children, fallbackPath = '/unauthorized' }) => {
  return (
    <RoleGuard 
      requiredRoles={[ROLES.USER, ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.RECEPTIONIST, ROLES.NURSE]} 
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Composant de protection pour les fonctionnalités patients
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
export const PatientFeatureGuard = ({ children, fallbackPath = '/unauthorized' }) => {
  return (
    <RoleGuard 
      requiredRoles={[ROLES.USER, ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.RECEPTIONIST, ROLES.NURSE, ROLES.ADMIN]} 
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Composant de protection pour la gestion des utilisateurs
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
export const UserManagementGuard = ({ children, fallbackPath = '/unauthorized' }) => {
  return (
    <RoleGuard 
      requiredRoles={ROLES.ADMIN} 
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Composant de protection pour les rapports
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
export const ReportsGuard = ({ children, fallbackPath = '/unauthorized' }) => {
  return (
    <RoleGuard 
      requiredRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.PHARMACIST]} 
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Composant de protection pour les paramètres
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
export const SettingsGuard = ({ children, fallbackPath = '/unauthorized' }) => {
  return (
    <RoleGuard 
      requiredRoles={ROLES.ADMIN} 
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Composant de protection pour la gestion des entreprises
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou redirection
 */
export const CompanyManagementGuard = ({ children, fallbackPath = '/unauthorized' }) => {
  return (
    <RoleGuard 
      requiredRoles={[ROLES.ADMIN, ROLES.ADMIN_PERSONNEL]} 
      fallbackPath={fallbackPath}
    >
      {children}
    </RoleGuard>
  );
};

export default RoleGuard;
