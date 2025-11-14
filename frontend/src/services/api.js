// Service API pour communiquer avec le backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Méthode générique pour les requêtes
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Vérifier si la réponse est JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Gestion spécifique des erreurs HTTP
        switch (response.status) {
          case 401:
            // Pour la connexion, c'est probablement des identifiants incorrects
            if (endpoint.includes('/auth/login')) {
              throw new Error('Email ou mot de passe incorrect.');
            } else {
              throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
          case 403:
            throw new Error('Accès refusé. Permissions insuffisantes.');
          case 404:
            throw new Error('Ressource non trouvée.');
          case 422:
            // Affichage des erreurs de validation
            const validationErrors = data.errors || [];
            const errorMessage = data.message || 'Données invalides.';
            if (validationErrors.length > 0) {
              throw new Error(`${errorMessage}: ${validationErrors.join(', ')}`);
            }
            throw new Error(errorMessage);
          case 500:
            throw new Error('Erreur du serveur. Veuillez réessayer plus tard.');
          default:
            throw new Error(data.message || `Erreur HTTP: ${response.status}`);
        }
      }

      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      
      // Gestion des erreurs de réseau
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }

  // Méthodes GET
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // Méthodes POST
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Méthodes PUT
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Méthodes PATCH
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Méthodes DELETE
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Service d'authentification
export const authService = {
  // Connexion
  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      
      if (response.success) {
        // Stocker les tokens
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        return {
          success: false,
          message: response.message || 'Erreur de connexion'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur de connexion'
      };
    }
  },

  // Déconnexion
  async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Rafraîchir le token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await apiService.post('/auth/refresh', { refreshToken });
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        return response.data.token;
      } else {
        throw new Error(response.message || 'Erreur lors du rafraîchissement du token');
      }
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      this.logout();
      throw error;
    }
  },

  // Obtenir le profil utilisateur
  async getProfile() {
    try {
      const response = await apiService.get('/auth/profile');
      // Retourner user et sites si présents
      return {
        user: response?.data?.user || null,
        sites: response?.data?.sites || []
      };
    } catch (error) {
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obtenir le token
  getToken() {
    return localStorage.getItem('token');
  }
};

// Instance du service API
const apiService = new ApiService();

export default apiService;
