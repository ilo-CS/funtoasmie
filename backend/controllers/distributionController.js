const Distribution = require('../models/Distribution');
const Site = require('../models/Site');
const Medication = require('../models/Medication');
const { validationResult } = require('express-validator');

class DistributionController {
  // Récupérer toutes les distributions
  static async getAllDistributions(req, res) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        site_id, 
        status, 
        created_by,
        date_from,
        date_to
      } = req.query;

      const filters = {};
      if (site_id) filters.site_id = site_id;
      if (status) filters.status = status;
      if (created_by) filters.created_by = created_by;
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      const distributions = await Distribution.findAll(
        parseInt(limit), 
        parseInt(offset), 
        filters
      );

      res.json({
        success: true,
        data: distributions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: distributions.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des distributions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des distributions',
        error: error.message
      });
    }
  }

  // Récupérer une distribution par ID
  static async getDistributionById(req, res) {
    try {
      const { id } = req.params;
      const distribution = await Distribution.findById(id);
      
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: 'Distribution non trouvée'
        });
      }
      
      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la distribution',
        error: error.message
      });
    }
  }

  // Créer une nouvelle distribution
  static async createDistribution(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const distributionData = {
        ...req.body,
        created_by: req.user.id
      };
      
      // Utiliser la nouvelle méthode avec transfert de stock automatique
      const result = await Distribution.createWithStockTransfer(distributionData);
      
      // Récupérer la distribution créée avec les informations jointes
      const newDistribution = await Distribution.findById(result.distributionId);
      
      res.status(201).json({
        success: true,
        message: 'Distribution créée et stock transféré avec succès',
        data: newDistribution,
        stock_transfer: result.transferResult,
        warnings: result.warnings
      });
    } catch (error) {
      console.error('Erreur lors de la création de la distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la distribution',
        error: error.message
      });
    }
  }

  // Mettre à jour une distribution
  static async updateDistribution(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const distribution = await Distribution.findById(id);
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: 'Distribution non trouvée'
        });
      }
      
      await distribution.update(updateData);
      
      // Récupérer la distribution mise à jour avec les informations jointes
      const updatedDistribution = await Distribution.findById(id);
      
      res.json({
        success: true,
        message: 'Distribution mise à jour avec succès',
        data: updatedDistribution
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la distribution',
        error: error.message
      });
    }
  }

  // Marquer comme distribuée
  static async markAsDistributed(req, res) {
    try {
      const { id } = req.params;
      
      const distribution = await Distribution.findById(id);
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: 'Distribution non trouvée'
        });
      }
      
      if (distribution.status === 'distributed') {
        return res.status(400).json({
          success: false,
          message: 'Cette distribution est déjà marquée comme distribuée'
        });
      }
      
      await distribution.markAsDistributed();
      
      // Récupérer la distribution mise à jour
      const updatedDistribution = await Distribution.findById(id);
      
      res.json({
        success: true,
        message: 'Distribution marquée comme distribuée',
        data: updatedDistribution
      });
    } catch (error) {
      console.error('Erreur lors de la finalisation de la distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la finalisation de la distribution',
        error: error.message
      });
    }
  }

  // Annuler une distribution
  static async cancelDistribution(req, res) {
    try {
      const { id } = req.params;
      
      const distribution = await Distribution.findById(id);
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: 'Distribution non trouvée'
        });
      }
      
      if (distribution.status === 'distributed') {
        return res.status(400).json({
          success: false,
          message: 'Les distributions finalisées ne peuvent pas être annulées'
        });
      }
      
      await distribution.cancel();
      
      // Récupérer la distribution mise à jour
      const updatedDistribution = await Distribution.findById(id);
      
      res.json({
        success: true,
        message: 'Distribution annulée avec succès',
        data: updatedDistribution
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation de la distribution',
        error: error.message
      });
    }
  }

  // Supprimer une distribution
  static async deleteDistribution(req, res) {
    try {
      const { id } = req.params;
      
      const distribution = await Distribution.findById(id);
      if (!distribution) {
        return res.status(404).json({
          success: false,
          message: 'Distribution non trouvée'
        });
      }
      
      await distribution.delete();
      
      res.json({
        success: true,
        message: 'Distribution supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la distribution',
        error: error.message
      });
    }
  }

  // Récupérer les distributions par site
  static async getDistributionsBySite(req, res) {
    try {
      const { siteId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const filters = { site_id: siteId };
      const distributions = await Distribution.findAll(
        parseInt(limit), 
        parseInt(offset), 
        filters
      );
      
      res.json({
        success: true,
        data: distributions
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des distributions par site:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des distributions par site',
        error: error.message
      });
    }
  }

  // Récupérer les distributions en attente
  static async getPendingDistributions(req, res) {
    try {
      const filters = { status: 'pending' };
      const distributions = await Distribution.findAll(50, 0, filters);
      
      res.json({
        success: true,
        data: distributions
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des distributions en attente:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des distributions en attente',
        error: error.message
      });
    }
  }

  // Récupérer les statistiques des distributions
  static async getDistributionStatistics(req, res) {
    try {
      const { site_id, date_from, date_to } = req.query;
      
      const summary = await Distribution.getDistributionSummary(
        site_id, 
        date_from, 
        date_to
      );
      
      res.json({
        success: true,
        data: summary
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
}

module.exports = DistributionController;
