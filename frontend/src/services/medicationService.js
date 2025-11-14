import api from './api';

class MedicationService {
  // Récupérer tous les médicaments
  static async getAllMedications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/medications?${queryString}` : '/medications';
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments:', error);
      throw error;
    }
  }

  // Récupérer un médicament par ID
  static async getMedicationById(id) {
    try {
      const response = await api.get(`/medications/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du médicament:', error);
      throw error;
    }
  }

  // Créer un nouveau médicament
  static async createMedication(medicationData) {
    try {
      const response = await api.post('/medications', medicationData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du médicament:', error);
      throw error;
    }
  }

  // Mettre à jour un médicament
  static async updateMedication(id, medicationData) {
    try {
      const response = await api.put(`/medications/${id}`, medicationData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du médicament:', error);
      throw error;
    }
  }

  // Supprimer un médicament
  static async deleteMedication(id) {
    try {
      const response = await api.delete(`/medications/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression du médicament:', error);
      throw error;
    }
  }

  // Mettre à jour la quantité d'un médicament (route spécifique avec traçabilité)
  static async updateQuantity(id, quantity, reason = 'Ajustement manuel') {
    try {
      const response = await api.put(`/medications/${id}/quantity`, {
        quantity,
        reason
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  }

  // Récupérer les médicaments en rupture de stock
  static async getLowStockMedications() {
    try {
      const response = await api.get('/medications/low-stock');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments en rupture:', error);
      throw error;
    }
  }

  // Récupérer les médicaments en rupture totale
  static async getOutOfStockMedications() {
    try {
      const response = await api.get('/medications/out-of-stock');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments en rupture totale:', error);
      throw error;
    }
  }

  // Récupérer les médicaments par statut
  static async getMedicationsByStatus(status) {
    try {
      const response = await api.get(`/medications/status/${status}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments par statut:', error);
      throw error;
    }
  }

  // Récupérer les médicaments expirés
  static async getExpiredMedications() {
    try {
      const response = await api.get('/medications/expired');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments expirés:', error);
      throw error;
    }
  }

  // Récupérer les mouvements d'un médicament
  static async getMedicationMovements(id, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/medications/${id}/movements?${queryString}` : `/medications/${id}/movements`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      throw error;
    }
  }

  // Récupérer les lots d'un médicament
  static async getMedicationBatches(id) {
    try {
      const response = await api.get(`/medications/${id}/batches`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des lots:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  static async getStatistics() {
    try {
      const response = await api.get('/medications/statistics');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Désactiver un médicament
  static async deactivateMedication(id) {
    try {
      const response = await api.patch(`/medications/${id}/deactivate`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la désactivation du médicament:', error);
      throw error;
    }
  }

  // Réactiver un médicament
  static async reactivateMedication(id) {
    try {
      const response = await api.patch(`/medications/${id}/reactivate`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la réactivation du médicament:', error);
      throw error;
    }
  }

  // Arrêter définitivement un médicament
  static async discontinueMedication(id) {
    try {
      const response = await api.patch(`/medications/${id}/discontinue`);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'arrêt définitif du médicament:', error);
      throw error;
    }
  }

}

export default MedicationService;
