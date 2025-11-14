import api from './api';

const SupplierService = {
  // Récupérer tous les fournisseurs
  async getAllSuppliers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/suppliers?${queryString}` : '/suppliers';
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
      throw error;
    }
  },

  // Récupérer un fournisseur par ID
  async getSupplierById(id) {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du fournisseur:', error);
      throw error;
    }
  },

  // Créer un nouveau fournisseur
  async createSupplier(supplierData) {
    try {
      const response = await api.post('/suppliers', supplierData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du fournisseur:', error);
      throw error;
    }
  },

  // Mettre à jour un fournisseur
  async updateSupplier(id, supplierData) {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      throw error;
    }
  },

  // Supprimer un fournisseur
  async deleteSupplier(id) {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      throw error;
    }
  },

  // Activer/Désactiver un fournisseur
  async toggleSupplierStatus(id) {
    try {
      const response = await api.patch(`/suppliers/${id}/toggle-status`);
      return response;
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  },

  // Récupérer les fournisseurs actifs
  async getActiveSuppliers() {
    try {
      const response = await api.get('/suppliers/active');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs actifs:', error);
      throw error;
    }
  }
};

export default SupplierService;
