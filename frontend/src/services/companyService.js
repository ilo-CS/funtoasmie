import api from './api';

class CompanyService {
  // Récupérer toutes les entreprises
  static async getAllCompanies() {
    try {
      const response = await api.get('/companies');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      throw error;
    }
  }

  // Récupérer les entreprises actives
  static async getActiveCompanies() {
    try {
      const response = await api.get('/companies/active');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises actives:', error);
      throw error;
    }
  }

  // Récupérer une entreprise par ID
  static async getCompanyById(id) {
    try {
      const response = await api.get(`/companies/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);
      throw error;
    }
  }

  // Créer une nouvelle entreprise
  static async createCompany(companyData) {
    try {
      const response = await api.post('/companies', companyData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
      throw error;
    }
  }

  // Mettre à jour une entreprise
  static async updateCompany(id, companyData) {
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
      throw error;
    }
  }

  // Désactiver une entreprise
  static async deactivateCompany(id) {
    try {
      const response = await api.patch(`/companies/${id}/deactivate`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'entreprise:', error);
      throw error;
    }
  }

  // Supprimer une entreprise
  static async deleteCompany(id) {
    try {
      const response = await api.delete(`/companies/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entreprise:', error);
      throw error;
    }
  }
}

export default CompanyService;
