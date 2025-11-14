import React from 'react';
import { useRole } from '../../hooks/useRole';

/**
 * Composant pour le rendu conditionnel basé sur les rôles
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants à afficher
 * @param {string|Array} props.requiredRoles - Rôle(s) requis pour afficher le contenu
 * @param {boolean} props.requireAll - Si true, l'utilisateur doit avoir tous les rôles (AND), sinon un seul suffit (OR)
 * @param {React.ReactNode} props.fallback - Composant à afficher si l'utilisateur n'a pas les permissions
 * @param {string} props.feature - Fonctionnalité requise pour afficher le contenu
 * @param {number} props.minPermissionLevel - Niveau de permission minimum requis
 * @returns {React.ReactNode} - Composant rendu ou null
 */
const ConditionalRender = ({ 
  children, 
  requiredRoles, 
  requireAll = false,
  fallback = null,
  feature,
  minPermissionLevel
}) => {
  const { hasRole, hasFeature, hasPermissionLevel } = useRole();

  // Vérifier les permissions
  let hasAccess = true;

  // Vérification des rôles
  if (requiredRoles) {
    if (requireAll) {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      hasAccess = hasAccess && rolesArray.every(role => hasRole(role));
    } else {
      hasAccess = hasAccess && hasRole(requiredRoles);
    }
  }

  // Vérification des fonctionnalités
  if (feature) {
    hasAccess = hasAccess && hasFeature(feature);
  }

  // Vérification du niveau de permission
  if (minPermissionLevel !== undefined) {
    hasAccess = hasAccess && hasPermissionLevel(minPermissionLevel);
  }

  // Si l'accès est autorisé, afficher le contenu
  if (hasAccess) {
    return children;
  }

  // Sinon, afficher le fallback ou rien
  return fallback;
};

/**
 * Composant pour afficher du contenu uniquement pour les administrateurs
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou null
 */
export const AdminOnly = ({ children, fallback = null }) => {
  return (
    <ConditionalRender 
      requiredRoles="admin" 
      fallback={fallback}
    >
      {children}
    </ConditionalRender>
  );
};

/**
 * Composant pour afficher du contenu uniquement pour les employés (non admin)
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou null
 */
export const EmployeeOnly = ({ children, fallback = null }) => {
  return (
    <ConditionalRender 
      requiredRoles={['user', 'doctor', 'pharmacist', 'receptionist', 'nurse']} 
      fallback={fallback}
    >
      {children}
    </ConditionalRender>
  );
};

/**
 * Composant pour afficher du contenu basé sur une fonctionnalité
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou null
 */
export const FeatureBased = ({ children, feature, fallback = null }) => {
  return (
    <ConditionalRender 
      feature={feature} 
      fallback={fallback}
    >
      {children}
    </ConditionalRender>
  );
};

/**
 * Composant pour afficher du contenu basé sur le niveau de permission
 * @param {Object} props - Propriétés du composant
 * @returns {React.ReactNode} - Composant rendu ou null
 */
export const PermissionBased = ({ children, minLevel, fallback = null }) => {
  return (
    <ConditionalRender 
      minPermissionLevel={minLevel} 
      fallback={fallback}
    >
      {children}
    </ConditionalRender>
  );
};

export default ConditionalRender;
