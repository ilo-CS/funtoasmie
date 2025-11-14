const Site = require('../models/Site');
const { validationResult } = require('express-validator');

class SiteController {
  // Récupérer tous les sites
  static async getAllSites(req, res) {
    try {
      const { limit = 50, offset = 0, active_only = true } = req.query;
      
      const sites = await Site.findAll(
        parseInt(limit), 
        parseInt(offset), 
        active_only === 'true'
      );
      
      res.json({
        success: true,
        data: sites,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: sites.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des sites:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des sites',
        error: error.message
      });
    }
  }

  // Récupérer un site par ID
  static async getSiteById(req, res) {
    try {
      const { id } = req.params;
      const site = await Site.findById(id);
      
      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'Site non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: site
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du site:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du site',
        error: error.message
      });
    }
  }

  // Récupérer les sites actifs
  static async getActiveSites(req, res) {
    try {
      const sites = await Site.findActive();
      
      res.json({
        success: true,
        data: sites
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des sites actifs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des sites actifs',
        error: error.message
      });
    }
  }

  // Créer un nouveau site
  static async createSite(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const siteData = req.body;
      const siteId = await Site.create(siteData);
      
      // Récupérer le site créé
      const newSite = await Site.findById(siteId);
      
      res.status(201).json({
        success: true,
        message: 'Site créé avec succès',
        data: newSite
      });
    } catch (error) {
      console.error('Erreur lors de la création du site:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du site',
        error: error.message
      });
    }
  }

  // Mettre à jour un site
  static async updateSite(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const site = await Site.findById(id);
      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'Site non trouvé'
        });
      }
      
      await site.update(updateData);
      
      // Récupérer le site mis à jour
      const updatedSite = await Site.findById(id);
      
      res.json({
        success: true,
        message: 'Site mis à jour avec succès',
        data: updatedSite
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du site:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du site',
        error: error.message
      });
    }
  }

  // Désactiver un site
  static async deactivateSite(req, res) {
    try {
      const { id } = req.params;
      
      const site = await Site.findById(id);
      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'Site non trouvé'
        });
      }
      
      await site.deactivate();
      
      res.json({
        success: true,
        message: 'Site désactivé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation du site:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la désactivation du site',
        error: error.message
      });
    }
  }

  // Supprimer un site
  static async deleteSite(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Tentative de suppression du site ID:', id);
      
      const site = await Site.findById(id);
      if (!site) {
        console.log('❌ Site non trouvé avec ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Site non trouvé'
        });
      }
      
      await site.delete();
      res.json({
        success: true,
        message: 'Site supprimé avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du site:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du site',
        error: error.message
      });
    }
  }
}

module.exports = SiteController;
