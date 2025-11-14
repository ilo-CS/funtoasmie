import api from './api';

class SiteService {
  // Récupérer tous les sites
  static async getAllSites(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.active_only !== undefined) queryParams.append('active_only', params.active_only);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/sites?${queryString}` : '/sites';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des sites:', error);
      throw error;
    }
  }

  // Récupérer les sites actifs
  static async getActiveSites() {
    try {
      const response = await api.get('/sites/active');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des sites actifs:', error);
      throw error;
    }
  }

  // Récupérer un site par ID
  static async getSiteById(id) {
    try {
      const response = await api.get(`/sites/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du site:', error);
      throw error;
    }
  }

  // Créer un nouveau site
  static async createSite(siteData) {
    try {
      const response = await api.post('/sites', siteData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du site:', error);
      throw error;
    }
  }

  // Mettre à jour un site
  static async updateSite(id, updateData) {
    try {
      const response = await api.put(`/sites/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du site:', error);
      throw error;
    }
  }

  // Désactiver un site
  static async deactivateSite(id) {
    try {
      const response = await api.patch(`/sites/${id}/deactivate`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la désactivation du site:', error);
      throw error;
    }
  }

  // Supprimer un site
  static async deleteSite(id) {
    try {
      const response = await api.delete(`/sites/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression du site:', error);
      throw error;
    }
  }
}

export default SiteService;
