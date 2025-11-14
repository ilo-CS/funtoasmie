const StockMovement = require('../models/StockMovement');
const Medication = require('../models/Medication');
const { validationResult } = require('express-validator');

class StockMovementController {
  static async getAllMovements(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        medication_id, 
        batch_id, 
        movement_type, 
        user_id, 
        date_from, 
        date_to 
      } = req.query;
      const offset = (page - 1) * limit;
      
      const filters = {
        medication_id,
        batch_id,
        movement_type,
        user_id,
        date_from,
        date_to
      };
      
      const movements = await StockMovement.findAll(parseInt(limit), parseInt(offset), filters);
      
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

  // GET /api/stock-movements/:id - Récupérer un mouvement par ID
  static async getMovementById(req, res) {
    try {
      const { id } = req.params;
      const movement = await StockMovement.findById(id);
      
      if (!movement) {
        return res.status(404).json({
          success: false,
          message: 'Mouvement non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: movement
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du mouvement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du mouvement',
        error: error.message
      });
    }
  }

  static async createMovement(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const movementData = {
        ...req.body,
        user_id: req.user.id // Récupérer l'ID de l'utilisateur connecté
      };
      
      const movementId = await StockMovement.create(movementData);
      
      res.status(201).json({
        success: true,
        message: 'Mouvement créé avec succès',
        data: { id: movementId }
      });
    } catch (error) {
      console.error('Erreur lors de la création du mouvement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du mouvement',
        error: error.message
      });
    }
  }

  // GET /api/stock-movements/medication/:medication_id - Récupérer les mouvements d'un médicament
  static async getMovementsByMedication(req, res) {
    try {
      const { medication_id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;
      
      const movements = await StockMovement.findByMedication(medication_id, parseInt(limit), parseInt(offset));
      
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

  // GET /api/stock-movements/batch/:batch_id - Récupérer les mouvements d'un lot
  static async getMovementsByBatch(req, res) {
    try {
      const { batch_id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;
      
      const movements = await StockMovement.findByBatch(batch_id, parseInt(limit), parseInt(offset));
      
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

  // GET /api/stock-movements/recent - Récupérer les mouvements récents
  static async getRecentMovements(req, res) {
    try {
      const { limit = 10 } = req.query;
      const movements = await StockMovement.getRecentMovements(parseInt(limit));
      
      res.json({
        success: true,
        data: movements
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements récents:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des mouvements récents',
        error: error.message
      });
    }
  }

  // GET /api/stock-movements/summary/:medication_id - Récupérer le résumé des mouvements
  static async getMovementSummary(req, res) {
    try {
      const { medication_id } = req.params;
      const { date_from, date_to } = req.query;
      
      const summary = await StockMovement.getMovementSummary(medication_id, date_from, date_to);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du résumé',
        error: error.message
      });
    }
  }

  static async createAdjustment(req, res) {
    try {
      const { medication_id, quantity, reason } = req.body;
      
      const medication = await Medication.findById(medication_id);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }
      
      // Créer l'ajustement
      const adjustmentData = {
        medication_id,
        movement_type: 'ADJUSTMENT',
        quantity: quantity - medication.current_quantity,
        previous_quantity: medication.current_quantity,
        new_quantity: quantity,
        reason: reason || 'Ajustement manuel',
        user_id: req.user.id
      };
      
      const movementId = await StockMovement.create(adjustmentData);
      
      // Mettre à jour la quantité du médicament
      await medication.updateQuantity(quantity, reason);
      
      res.status(201).json({
        success: true,
        message: 'Ajustement créé avec succès',
        data: { id: movementId }
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'ajustement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'ajustement',
        error: error.message
      });
    }
  }
}

module.exports = StockMovementController;
