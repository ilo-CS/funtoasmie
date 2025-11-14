const Supplier = require('../models/Supplier');
const { validationResult } = require('express-validator');

class SupplierController {
  // GET /api/suppliers - Récupérer tous les fournisseurs
  static async getAllSuppliers(req, res) {
    try {
      const { page = 1, limit = 50, search, active_only } = req.query;
      const offset = (page - 1) * limit;
      
      const filters = {
        search,
        active_only: active_only === 'true'
      };
      
      const suppliers = await Supplier.findAll(parseInt(limit), parseInt(offset), filters);
      
      // Ajouter le nombre de médicaments pour chaque fournisseur
      const suppliersWithCounts = await Promise.all(
        suppliers.map(async (supplier) => {
          try {
            const { query } = require('../config/database');
            const result = await query(
              'SELECT COUNT(*) as medication_count FROM medications WHERE supplier = ?',
              [supplier.name]
            );
            return {
              ...supplier,
              medication_count: result[0].medication_count
            };
          } catch (error) {
            console.error(`Erreur lors du comptage des médicaments pour le fournisseur ${supplier.id}:`, error);
            return {
              ...supplier,
              medication_count: 0
            };
          }
        })
      );
      
      // Éliminer les doublons basés sur l'ID
      const uniqueSuppliers = suppliersWithCounts.filter((supplier, index, self) => 
        index === self.findIndex(s => s.id === supplier.id)
      );
      
      res.json({
        success: true,
        data: uniqueSuppliers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: uniqueSuppliers.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des fournisseurs',
        error: error.message
      });
    }
  }

  // GET /api/suppliers/:id - Récupérer un fournisseur par ID
  static async getSupplierById(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findById(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du fournisseur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du fournisseur',
        error: error.message
      });
    }
  }

  // POST /api/suppliers - Créer un nouveau fournisseur
  static async createSupplier(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const supplierData = req.body;
      const supplierId = await Supplier.create(supplierData);
      
      res.status(201).json({
        success: true,
        message: 'Fournisseur créé avec succès',
        data: { id: supplierId }
      });
    } catch (error) {
      console.error('Erreur lors de la création du fournisseur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du fournisseur',
        error: error.message
      });
    }
  }

  // PUT /api/suppliers/:id - Mettre à jour un fournisseur
  static async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const supplier = await Supplier.findById(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }

      await supplier.update(updateData);
      
      res.json({
        success: true,
        message: 'Fournisseur mis à jour avec succès',
        data: supplier
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du fournisseur',
        error: error.message
      });
    }
  }

  // DELETE /api/suppliers/:id - Supprimer un fournisseur
  static async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      
      const supplier = await Supplier.findById(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }

      await supplier.delete();
      
      res.json({
        success: true,
        message: 'Fournisseur supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      
      // Gérer les erreurs spécifiques
      if (error.message.includes('utilisé par des médicaments')) {
        return res.status(400).json({
          success: false,
          message: 'Ce fournisseur est utilisé par des médicaments et ne peut pas être supprimé',
          error: error.message
        });
      }
      
      if (error.message.includes('des commandes')) {
        return res.status(400).json({
          success: false,
          message: 'Ce fournisseur a des commandes et ne peut pas être supprimé',
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du fournisseur',
        error: error.message
      });
    }
  }

  // PATCH /api/suppliers/:id/toggle-status - Activer/Désactiver un fournisseur
  static async toggleSupplierStatus(req, res) {
    try {
      const { id } = req.params;
      
      const supplier = await Supplier.findById(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }

      await supplier.toggleStatus();
      
      res.json({
        success: true,
        message: `Fournisseur ${supplier.is_active ? 'activé' : 'désactivé'} avec succès`,
        data: supplier
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du changement de statut',
        error: error.message
      });
    }
  }

  // GET /api/suppliers/active - Récupérer les fournisseurs actifs
  static async getActiveSuppliers(req, res) {
    try {
      const suppliers = await Supplier.findActive();
      
      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs actifs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des fournisseurs actifs',
        error: error.message
      });
    }
  }
}

module.exports = SupplierController;
