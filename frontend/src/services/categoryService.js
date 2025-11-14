import api from './api';

class CategoryService {
  // Récupérer toutes les catégories
  static async getAllCategories() {
    try {
      const response = await api.get('/categories');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  // Récupérer une catégorie par ID
  static async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie:', error);
      throw error;
    }
  }

  // Créer une nouvelle catégorie
  static async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      throw error;
    }
  }

  // Mettre à jour une catégorie
  static async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      throw error;
    }
  }

  // Supprimer une catégorie
  static async deleteCategory(id) {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      throw error;
    }
  }
}

export default CategoryService;