import apiService from './api';

const medicalPrescriptionService = {
  /**
   * Créer une nouvelle ordonnance médicale
   */
  async createPrescription(prescriptionData) {
    try {
      const response = await apiService.post('/medical-prescriptions', prescriptionData);
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'ordonnance médicale:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les ordonnances médicales
   */
  async getPrescriptions(filters = {}) {
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
      const endpoint = `/medical-prescriptions${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(endpoint);
      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des ordonnances médicales:', error);
      throw error;
    }
  },

  /**
   * Récupérer les ordonnances médicales d'un docteur
   */
  async getDoctorPrescriptions(doctorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.patient_name) queryParams.append('patient_name', filters.patient_name);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const queryString = queryParams.toString();
      const endpoint = `/medical-prescriptions/doctors/${doctorId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(endpoint);
      return {
        success: response.success,
        data: response.data || [],
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des ordonnances médicales du docteur:', error);
      throw error;
    }
  },

  /**
   * Récupérer une ordonnance médicale par ID
   */
  async getPrescriptionById(id) {
    try {
      const response = await apiService.get(`/medical-prescriptions/${id}`);
      return {
        success: response.success,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ordonnance médicale:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une ordonnance médicale
   */
  async updatePrescription(id, prescriptionData) {
    try {
      const response = await apiService.put(`/medical-prescriptions/${id}`, prescriptionData);
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordonnance médicale:', error);
      throw error;
    }
  },

  /**
   * Annuler une ordonnance médicale
   */
  async cancelPrescription(id) {
    try {
      const response = await apiService.patch(`/medical-prescriptions/${id}/cancel`);
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'ordonnance médicale:', error);
      throw error;
    }
  },

  /**
   * Supprimer une ordonnance médicale
   */
  async deletePrescription(id) {
    try {
      const response = await apiService.delete(`/medical-prescriptions/${id}`);
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ordonnance médicale:', error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques des ordonnances médicales
   */
  async getPrescriptionStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.site_id) queryParams.append('site_id', filters.site_id);
      if (filters.doctor_id) queryParams.append('doctor_id', filters.doctor_id);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const queryString = queryParams.toString();
      const endpoint = `/medical-prescriptions/stats${queryString ? `?${queryString}` : ''}`;
      
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

export default medicalPrescriptionService;

