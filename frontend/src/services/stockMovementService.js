import api from './api';

class StockMovementService {
  // Récupérer tous les mouvements
  static async getAllMovements(params = {}) {
    try {
      const response = await api.get('/stock-movements', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      throw error;
    }
  }

  // Récupérer un mouvement par ID
  static async getMovementById(id) {
    try {
      const response = await api.get(`/stock-movements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du mouvement:', error);
      throw error;
    }
  }

  // Créer un nouveau mouvement
  static async createMovement(movementData) {
    try {
      const response = await api.post('/stock-movements', movementData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du mouvement:', error);
      throw error;
    }
  }

  // Créer un ajustement de stock
  static async createAdjustment(medicationId, quantity, reason) {
    try {
      const response = await api.post('/stock-movements/adjustment', {
        medication_id: medicationId,
        quantity,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'ajustement:', error);
      throw error;
    }
  }

  // Récupérer les mouvements d'un médicament
  static async getMovementsByMedication(medicationId, params = {}) {
    try {
      const response = await api.get(`/stock-movements/medication/${medicationId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      throw error;
    }
  }

  // Récupérer les mouvements d'un lot
  static async getMovementsByBatch(batchId, params = {}) {
    try {
      const response = await api.get(`/stock-movements/batch/${batchId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      throw error;
    }
  }

  // Récupérer les mouvements récents
  static async getRecentMovements(limit = 10) {
    try {
      const response = await api.get('/stock-movements/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements récents:', error);
      throw error;
    }
  }

  // Récupérer le résumé des mouvements
  static async getMovementSummary(medicationId, dateFrom = null, dateTo = null) {
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const response = await api.get(`/stock-movements/summary/${medicationId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      throw error;
    }
  }
}

export default StockMovementService;
