const Medication = require('../models/Medication');
const { validationResult } = require('express-validator');

class MedicationController {
  static async getAllMedications(req, res) {
    try {
      const { page = 1, limit = 50, search, category_id, supplier_id, status } = req.query;
      const offset = (page - 1) * limit;
      
      const filters = {
        search,
        category_id,
        supplier_id,
        status
      };
      
      const medications = await Medication.findAll(parseInt(limit), parseInt(offset), filters);
      
      res.json({
        success: true,
        data: medications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: medications.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médicaments',
        error: error.message
      });
    }
  }

  static async getMedicationById(req, res) {
    try {
      const { id } = req.params;
      const medication = await Medication.findById(id);
      
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: medication
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du médicament:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du médicament',
        error: error.message
      });
    }
  }

  static async createMedication(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const medicationData = req.body;
      const medicationId = await Medication.create(medicationData);
      
      res.status(201).json({
        success: true,
        message: 'Médicament créé avec succès',
        data: { id: medicationId }
      });
    } catch (error) {
      console.error('Erreur lors de la création du médicament:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du médicament',
        error: error.message
      });
    }
  }

  static async updateMedication(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const medication = await Medication.findById(id);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      await medication.update(updateData);
      
      res.json({
        success: true,
        message: 'Médicament mis à jour avec succès',
        data: medication
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du médicament:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du médicament',
        error: error.message
      });
    }
  }

  static async deleteMedication(req, res) {
    try {
      const { id } = req.params;
      
      const medication = await Medication.findById(id);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      await medication.delete();
      
      res.json({
        success: true,
        message: 'Médicament supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du médicament:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du médicament',
        error: error.message
      });
    }
  }

  static async updateQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantity, reason } = req.body;
      const userId = req.user?.id;
      
      const medication = await Medication.findById(id);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      // Validation supplémentaire
      if (quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'La quantité ne peut pas être négative'
        });
      }
      
      if (quantity > 100000) {
        return res.status(400).json({
          success: false,
          message: 'La quantité ne peut pas dépasser 100,000 unités'
        });
      }
      
      if (!reason || reason.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'La raison doit contenir au moins 5 caractères'
        });
      }
      
      // Contrôles de sécurité pour les changements importants
      const oldQuantity = medication.quantity;
      const difference = Math.abs(quantity - oldQuantity);
      const percentage = oldQuantity > 0 ? (difference / oldQuantity) * 100 : 100;
      
      // Alerte pour changement > 50%
      if (percentage > 50) {
        console.warn(`SECURITY_ALERT: Critical quantity change for medication ${id} by user ${userId} - ${oldQuantity} -> ${quantity} (${percentage.toFixed(1)}%)`);
      }
      
      await medication.updateQuantity(quantity, reason, userId);
      
      res.json({
        success: true,
        message: 'Quantité mise à jour avec succès',
        data: {
          id: medication.id,
          name: medication.name,
          oldQuantity: oldQuantity,
          newQuantity: quantity,
          difference: difference,
          percentage: percentage.toFixed(1)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la quantité',
        error: error.message
      });
    }
  }

  static async getLowStockMedications(req, res) {
    try {
      const medications = await Medication.findLowStock();
      
      res.json({
        success: true,
        data: medications
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments en rupture:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médicaments en rupture',
        error: error.message
      });
    }
  }

  static async getOutOfStockMedications(req, res) {
    try {
      const medications = await Medication.findOutOfStock();
      
      res.json({
        success: true,
        data: medications
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments en rupture:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médicaments en rupture',
        error: error.message
      });
    }
  }

  static async getMedicationsByStatus(req, res) {
    try {
      const { status } = req.params;
      const medications = await Medication.findByStatus(status);
      
      res.json({
        success: true,
        data: medications
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments par statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médicaments par statut',
        error: error.message
      });
    }
  }

  static async getExpiredMedications(req, res) {
    try {
      const medications = await Medication.findExpired();
      
      res.json({
        success: true,
        data: medications
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments expirés:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médicaments expirés',
        error: error.message
      });
    }
  }

  // GET /api/medications/:id/movements - Récupérer les mouvements d'un médicament
  static async getMedicationMovements(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;
      
      // Pour l'instant, retourner un tableau vide
      // TODO: Implémenter StockMovement quand le modèle sera créé
      const movements = [];
      
      res.json({
        success: true,
        data: movements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: movements.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des mouvements',
        error: error.message
      });
    }
  }

  // GET /api/medications/:id/batches - Récupérer les lots d'un médicament
  static async getMedicationBatches(req, res) {
    try {
      const { id } = req.params;
      
      // Pour l'instant, retourner un tableau vide
      // TODO: Implémenter Batch quand le modèle sera créé
      const batches = [];
      
      res.json({
        success: true,
        data: batches
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des lots:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des lots',
        error: error.message
      });
    }
  }

  static async getMedicationStatistics(req, res) {
    try {
      const statistics = await Medication.getStatistics();
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }

  // PATCH /api/medications/:id/deactivate - Désactiver un médicament
  static async deactivateMedication(req, res) {
    try {
      const { id } = req.params;
      
      const medication = await Medication.findById(id);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      await Medication.deactivate(id);
      
      res.json({
        success: true,
        message: 'Médicament désactivé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la désactivation du médicament',
        error: error.message
      });
    }
  }

  // PATCH /api/medications/:id/reactivate - Réactiver un médicament
  static async reactivateMedication(req, res) {
    try {
      const { id } = req.params;
      
      const medication = await Medication.findById(id);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      await Medication.reactivate(id);
      
      res.json({
        success: true,
        message: 'Médicament réactivé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la réactivation du médicament',
        error: error.message
      });
    }
  }

  // PATCH /api/medications/:id/discontinue - Arrêter définitivement un médicament
  static async discontinueMedication(req, res) {
    try {
      const { id } = req.params;
      
      const medication = await Medication.findById(id);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      await Medication.discontinue(id);
      
      res.json({
        success: true,
        message: 'Médicament arrêté définitivement'
      });
    } catch (error) {
      console.error('Erreur lors de l\'arrêt définitif:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'arrêt définitif du médicament',
        error: error.message
      });
    }
  }
}

module.exports = MedicationController;
