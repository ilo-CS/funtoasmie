import api from './api';

class StockService {
  // Obtenir le résumé des stocks
  static async getStockSummary() {
    try {
      const response = await api.get('/stocks/summary');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé des stocks:', error);
      throw error;
    }
  }

  // Obtenir les stocks par site
  static async getSiteStocks(siteId) {
    try {
      const response = await api.get(`/stocks/sites/${siteId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des stocks du site:', error);
      throw error;
    }
  }

  // Obtenir tous les stocks
  static async getAllStocks(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/stocks/sites?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les stocks:', error);
      throw error;
    }
  }

  // Créer ou mettre à jour un stock de site
  static async createOrUpdateSiteStock(siteId, medicationId, stockData) {
    try {
      const response = await api.put(`/stocks/sites/${siteId}/medications/${medicationId}`, stockData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      throw error;
    }
  }

  // Synchroniser les stocks d'un site
  static async synchronizeSiteStock(siteId) {
    try {
      const response = await api.post(`/stocks/sites/${siteId}/synchronize`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des stocks:', error);
      throw error;
    }
  }

  // Obtenir les mouvements de stock
  static async getStockMovements(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/stocks/movements?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      throw error;
    }
  }

  // Obtenir les alertes de stock
  static async getStockAlerts(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/stocks/alerts?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  }

  // Annuler un transfert de stock
  static async cancelStockTransfer(transferData) {
    try {
      const response = await api.post('/stocks/cancel-transfer', transferData);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du transfert:', error);
      throw error;
    }
  }

  // Obtenir le résumé des mouvements
  static async getMovementSummary(medicationId = null, siteId = null, dateFrom = null, dateTo = null) {
    try {
      const params = new URLSearchParams();
      if (medicationId) params.append('medication_id', medicationId);
      if (siteId) params.append('site_id', siteId);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      
      const response = await api.get(`/stocks/movements/summary?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé des mouvements:', error);
      throw error;
    }
  }
}

export default StockService;
