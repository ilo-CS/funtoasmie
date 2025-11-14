import api from './api';

class DistributionService {
  // Récupérer toutes les distributions
  static async getAllDistributions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.site_id) queryParams.append('site_id', params.site_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.created_by) queryParams.append('created_by', params.created_by);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/distributions?${queryString}` : '/distributions';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des distributions:', error);
      throw error;
    }
  }

  // Récupérer une distribution par ID
  static async getDistributionById(id) {
    try {
      const response = await api.get(`/distributions/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la distribution:', error);
      throw error;
    }
  }

  // Créer une nouvelle distribution
  static async createDistribution(distributionData) {
    try {
      const response = await api.post('/distributions', distributionData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la distribution:', error);
      throw error;
    }
  }

  // Mettre à jour une distribution
  static async updateDistribution(id, updateData) {
    try {
      const response = await api.put(`/distributions/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la distribution:', error);
      throw error;
    }
  }

  // Marquer comme distribuée
  static async markAsDistributed(id) {
    try {
      const response = await api.patch(`/distributions/${id}/distributed`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la finalisation de la distribution:', error);
      throw error;
    }
  }

  // Annuler une distribution
  static async cancelDistribution(id) {
    try {
      const response = await api.patch(`/distributions/${id}/cancel`);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la distribution:', error);
      throw error;
    }
  }

  // Supprimer une distribution
  static async deleteDistribution(id) {
    try {
      const response = await api.delete(`/distributions/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression de la distribution:', error);
      throw error;
    }
  }

  // Récupérer les distributions par site
  static async getDistributionsBySite(siteId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/distributions/site/${siteId}?${queryString}` : `/distributions/site/${siteId}`;
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des distributions par site:', error);
      throw error;
    }
  }

  // Récupérer les distributions en attente
  static async getPendingDistributions() {
    try {
      const response = await api.get('/distributions/pending/all');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des distributions en attente:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des distributions
  static async getDistributionStatistics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.site_id) queryParams.append('site_id', params.site_id);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/distributions/statistics/summary?${queryString}` : '/distributions/statistics/summary';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export default DistributionService;
