import apiService from './api';

const consultationService = {
  /**
   * Créer une nouvelle consultation
   */
  async createConsultation(consultationData) {
    try {
      const response = await apiService.post('/consultations', consultationData);
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les consultations
   */
  async getConsultations(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.doctor_id) queryParams.append('doctor_id', filters.doctor_id);
      if (filters.site_id) queryParams.append('site_id', filters.site_id);
      if (filters.patient_name) queryParams.append('patient_name', filters.patient_name);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const queryString = queryParams.toString();
      const endpoint = `/consultations${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(endpoint);
      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
      throw error;
    }
  },

  /**
   * Récupérer les consultations d'un docteur
   */
  async getDoctorConsultations(doctorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.patient_name) queryParams.append('patient_name', filters.patient_name);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const queryString = queryParams.toString();
      const endpoint = `/consultations/doctors/${doctorId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(endpoint);
      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations du docteur:', error);
      throw error;
    }
  },

  /**
   * Récupérer une consultation par ID
   */
  async getConsultationById(id) {
    try {
      const response = await apiService.get(`/consultations/${id}`);
      return {
        success: response.success,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la consultation:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une consultation
   */
  async updateConsultation(id, consultationData) {
    try {
      const response = await apiService.put(`/consultations/${id}`, consultationData);
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la consultation:', error);
      throw error;
    }
  },

  /**
   * Annuler une consultation
   */
  async cancelConsultation(id) {
    try {
      const response = await apiService.patch(`/consultations/${id}/cancel`);
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la consultation:', error);
      throw error;
    }
  },

  /**
   * Supprimer une consultation
   */
  async deleteConsultation(id) {
    try {
      const response = await apiService.delete(`/consultations/${id}`);
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la consultation:', error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques des consultations
   */
  async getConsultationStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.site_id) queryParams.append('site_id', filters.site_id);
      if (filters.doctor_id) queryParams.append('doctor_id', filters.doctor_id);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const queryString = queryParams.toString();
      const endpoint = `/consultations/stats${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(endpoint);
      return {
        success: response.success,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
};

export default consultationService;

