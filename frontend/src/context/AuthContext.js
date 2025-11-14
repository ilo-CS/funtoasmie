import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { RoleValidationService } from '../utils/roleValidation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialiser l'état d'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        // Nettoyer le localStorage en cas d'erreur
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Connexion
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Erreur de connexion';
      
      if (error.message.includes('Session expirée')) {
        errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
      } else if (error.message.includes('Accès refusé')) {
        errorMessage = 'Accès refusé. Vérifiez vos identifiants.';
      } else if (error.message.includes('connexion au serveur')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else if (error.message.includes('Email ou mot de passe incorrect')) {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else {
        errorMessage = error.message || 'Erreur de connexion';
      }
      
      return { success: false, message: errorMessage };
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      setUser(null);
      return { success: true };
    }
  };

  // Rafraîchir le token
  const refreshToken = async () => {
    try {
      const newToken = await authService.refreshToken();
      return { success: true, token: newToken };
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      // Déconnecter l'utilisateur si le refresh échoue
      setUser(null);
      return { success: false, message: error.message };
    }
  };

  // Obtenir l'URL de redirection selon le rôle
  const getRedirectUrl = (userRole) => {
    return RoleValidationService.getRedirectUrl(userRole);
  };

  // Valider l'accès à une route
  const validateRouteAccess = (route) => {
    return RoleValidationService.validateRouteAccess(user, route);
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (requiredRoles) => {
    return RoleValidationService.hasRole(user, requiredRoles);
  };

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = () => {
    return RoleValidationService.isAdmin(user);
  };

  // Vérifier si l'utilisateur peut gérer les utilisateurs
  const canManageUsers = () => {
    return RoleValidationService.canManageUsers(user);
  };

  // Vérifier si l'utilisateur peut accéder aux rapports
  const canAccessReports = () => {
    return RoleValidationService.canAccessReports(user);
  };

  // Vérifier si l'utilisateur peut accéder aux paramètres
  const canAccessSettings = () => {
    return RoleValidationService.canAccessSettings(user);
  };

  // Vérifier si une fonctionnalité est disponible
  const hasFeature = (feature) => {
    return RoleValidationService.hasFeature(user, feature);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    getRedirectUrl,
    validateRouteAccess,
    hasRole,
    isAdmin,
    canManageUsers,
    canAccessReports,
    canAccessSettings,
    hasFeature,
    // isAuthenticated doit refléter l'état courant
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
