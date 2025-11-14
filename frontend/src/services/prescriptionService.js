import api from './api';

class PrescriptionService {
  
  /**
   * Créer une nouvelle prescription
   */
  static async createPrescription(prescriptionData) {
    try {
      // Ajouter le site_id dans les headers si disponible
      const currentSiteId = localStorage.getItem('currentSiteId');
      const headers = {};
      if (currentSiteId) {
        headers['x-site-id'] = currentSiteId;
      }

      const response = await api.post('/prescriptions', prescriptionData, { headers });
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la prescription:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les prescriptions (avec filtres)
   */
  static async getAllPrescriptions(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres aux paramètres
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/prescriptions?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions:', error);
      throw error;
    }
  }

  /**
   * Récupérer les prescriptions d'un site
   */
  static async getSitePrescriptions(siteId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres aux paramètres
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      // Ajouter le site_id dans les headers pour la vérification d'accès
      const headers = {
        'x-site-id': siteId
      };

      const response = await api.get(`/prescriptions/sites/${siteId}?${params.toString()}`, { headers });
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions du site:', error);
      throw error;
    }
  }

  /**
   * Récupérer les prescriptions d'un pharmacien
   */
  static async getPharmacistPrescriptions(pharmacistId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres aux paramètres
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/prescriptions/pharmacists/${pharmacistId}?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions du pharmacien:', error);
      throw error;
    }
  }

  /**
   * Récupérer une prescription par ID
   */
  static async getPrescriptionById(id) {
    try {
      const response = await api.get(`/prescriptions/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la prescription:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une prescription
   */
  static async updatePrescription(id, updateData) {
    try {
      const response = await api.put(`/prescriptions/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la prescription:', error);
      throw error;
    }
  }

  /**
   * Marquer une prescription comme "en préparation"
   */
  static async markAsPreparing(id) {
    try {
      const response = await api.patch(`/prescriptions/${id}/prepare`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Marquer une prescription comme "préparée" et créer le mouvement de stock
   */
  static async markAsPrepared(id) {
    try {
      const response = await api.patch(`/prescriptions/${id}/prepared`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la finalisation de la prescription:', error);
      throw error;
    }
  }

  /**
   * Annuler une prescription
   */
  static async cancelPrescription(id) {
    try {
      const response = await api.patch(`/prescriptions/${id}/cancel`);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la prescription:', error);
      throw error;
    }
  }

  /**
   * Supprimer une prescription
   */
  static async deletePrescription(id) {
    try {
      const response = await api.delete(`/prescriptions/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression de la prescription:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des prescriptions
   */
  static async getPrescriptionStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres aux paramètres
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/prescriptions/stats?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Récupérer les prescriptions du site courant (pour le pharmacien connecté)
   */
  static async getCurrentSitePrescriptions(filters = {}) {
    try {
      const currentSiteId = localStorage.getItem('currentSiteId');
      if (!currentSiteId) {
        throw new Error('Aucun site sélectionné');
      }

      return await this.getSitePrescriptions(currentSiteId, filters);
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions du site courant:', error);
      throw error;
    }
  }

  /**
   * Créer une prescription pour le site courant
   */
  static async createPrescriptionForCurrentSite(prescriptionData) {
    try {
      const currentSiteId = localStorage.getItem('currentSiteId');
      if (!currentSiteId) {
        throw new Error('Aucun site sélectionné');
      }

      const dataWithSite = {
        ...prescriptionData,
        site_id: parseInt(currentSiteId)
      };

      return await this.createPrescription(dataWithSite);
    } catch (error) {
      console.error('Erreur lors de la création de la prescription:', error);
      throw error;
    }
  }
}

export default PrescriptionService;
