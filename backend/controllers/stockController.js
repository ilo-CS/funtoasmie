const { validationResult } = require('express-validator');
const StockService = require('../services/stockService');
const SiteStock = require('../models/SiteStock');
const StockMovement = require('../models/StockMovement');

class StockController {
  // Obtenir le résumé des stocks
  static async getStockSummary(req, res) {
    try {
      const filters = req.query;
      const summary = await StockService.getStockSummary(filters);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du résumé des stocks',
        error: error.message
      });
    }
  }

  // Obtenir le résumé des mouvements de stock
  static async getMovementSummary(req, res) {
    try {
      const { medication_id, site_id, date_from, date_to } = req.query;
      const summary = await StockMovement.getMovementSummary(
        medication_id || null,
        site_id || null,
        date_from || null,
        date_to || null
      );

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé des mouvements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du résumé des mouvements',
        error: error.message
      });
    }
  }

  // Obtenir les stocks par site
  static async getSiteStocks(req, res) {
    try {
      const { site_id } = req.params;
      const filters = { ...req.query, site_id };
      
      const stocks = await SiteStock.findAll(filters);
      
      res.json({
        success: true,
        data: stocks
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des stocks du site:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des stocks du site',
        error: error.message
      });
    }
  }

  // Obtenir les mouvements de stock
  static async getStockMovements(req, res) {
    try {
      const filters = req.query;
      const movements = await StockMovement.findAll(filters);
      
      res.json({
        success: true,
        data: movements
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des mouvements de stock',
        error: error.message
      });
    }
  }

  // Créer ou mettre à jour un stock de site
  static async createOrUpdateSiteStock(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { site_id, medication_id } = req.params;
      const { quantity, min_stock, max_stock } = req.body;

      // Vérifier si le stock existe déjà
      let siteStock = await SiteStock.findBySiteAndMedication(site_id, medication_id);
      
      if (siteStock) {
        // Mettre à jour le stock existant
        await siteStock.update({ quantity, min_stock, max_stock });
        
        // Enregistrer le mouvement d'ajustement
        await StockMovement.create({
          medication_id,
          movement_type: 'ADJUSTMENT',
          quantity: quantity - siteStock.quantity,
          reference_type: 'ADJUSTMENT',
          reference_id: null,
          site_id,
          user_id: req.user.id,
          notes: 'Ajustement manuel du stock'
        });
      } else {
        // Créer un nouveau stock
        const stockId = await SiteStock.create({
          site_id,
          medication_id,
          quantity,
          min_stock,
          max_stock
        });
        
        siteStock = await SiteStock.findBySiteAndMedication(site_id, medication_id);
        
        // Enregistrer le mouvement d'entrée initial
        await StockMovement.create({
          medication_id,
          movement_type: 'TRANSFER_IN',
          quantity,
          reference_type: 'ADJUSTMENT',
          reference_id: null,
          site_id,
          to_site_id: site_id,
          user_id: req.user.id,
          notes: 'Création initiale du stock site'
        });
      }
      
      res.json({
        success: true,
        message: 'Stock de site mis à jour avec succès',
        data: siteStock
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du stock de site',
        error: error.message
      });
    }
  }

  // Synchroniser les stocks d'un site
  static async synchronizeSiteStock(req, res) {
    try {
      const { site_id } = req.params;
      
      // Vérifier que l'utilisateur est bien authentifié
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }
      
      const result = await StockService.synchronizeSiteStock(site_id, req.user.id);
      
      res.json({
        success: true,
        message: `Synchronisation terminée: ${result.total_adjusted} ajustements effectués`,
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la synchronisation des stocks',
        error: error.message
      });
    }
  }

  // Annuler un transfert de stock
  static async cancelStockTransfer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { reference_type, reference_id } = req.body;
      const { notes } = req.body;
      
      const result = await StockService.cancelStockTransfer({
        reference_type,
        reference_id,
        user_id: req.user.id,
        notes
      });
      
      res.json({
        success: true,
        message: 'Transfert de stock annulé avec succès',
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation du transfert:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation du transfert de stock',
        error: error.message
      });
    }
  }

  // Obtenir les alertes de stock
  static async getStockAlerts(req, res) {
    try {
      const { alert_type, site_id, medication_id } = req.query;
      
      let sql = `
        SELECT sa.*, 
               m.name as medication_name,
               s.name as site_name,
               CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM stock_alerts sa
        LEFT JOIN medications m ON sa.medication_id = m.id
        LEFT JOIN sites s ON sa.site_id = s.id
        LEFT JOIN users u ON sa.user_id = u.id
        WHERE sa.status = 'ACTIVE'
      `;
      
      const params = [];
      
      if (alert_type) {
        sql += ' AND sa.alert_type = ?';
        params.push(alert_type);
      }
      
      if (site_id) {
        sql += ' AND sa.site_id = ?';
        params.push(site_id);
      }
      
      if (medication_id) {
        sql += ' AND sa.medication_id = ?';
        params.push(medication_id);
      }
      
      sql += ' ORDER BY sa.created_at DESC';
      
      const alerts = await require('../config/database').query(sql, params);
      
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des alertes de stock',
        error: error.message
      });
    }
  }
}

module.exports = StockController;

