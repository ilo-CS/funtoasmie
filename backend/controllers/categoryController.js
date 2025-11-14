const Category = require('../models/Category');
const { validationResult } = require('express-validator');

class CategoryController {
  // GET /api/categories - Récupérer toutes les catégories
  static async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des catégories',
        error: error.message
      });
    }
  }

  // GET /api/categories/:id - Récupérer une catégorie par ID
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la catégorie',
        error: error.message
      });
    }
  }

  // POST /api/categories - Créer une nouvelle catégorie
  static async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const categoryData = req.body;
      const categoryId = await Category.create(categoryData);
      
      res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès',
        data: { id: categoryId }
      });
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la catégorie',
        error: error.message
      });
    }
  }

  // PUT /api/categories/:id - Mettre à jour une catégorie
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
      
      const updated = await Category.update(id, updateData);
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la mise à jour de la catégorie'
        });
      }
      
      res.json({
        success: true,
        message: 'Catégorie mise à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la catégorie',
        error: error.message
      });
    }
  }

  // DELETE /api/categories/:id - Supprimer une catégorie
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
      
      const deleted = await Category.delete(id);
      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la suppression de la catégorie'
        });
      }
      
      res.json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la catégorie',
        error: error.message
      });
    }
  }
}

module.exports = CategoryController;
