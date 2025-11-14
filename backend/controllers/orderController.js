const Order = require('../models/Order');
const { validationResult } = require('express-validator');

class OrderController {
  // Récupérer toutes les commandes
  static async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 50, status, supplier_id, date_from, date_to } = req.query;
      const offset = (page - 1) * limit;
      
      // Validation des paramètres
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      if (pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Le numéro de page doit être supérieur à 0',
          error: 'INVALID_PAGE_NUMBER'
        });
      }
      
      if (limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'La limite doit être entre 1 et 100',
          error: 'INVALID_LIMIT'
        });
      }
      
      const filters = {
        status,
        supplier_id,
        date_from,
        date_to
      };
      
      const orders = await Order.findAll(limitNum, offset, filters);
      
      res.json({
        success: true,
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: orders.length
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      
      // Gestion spécifique des erreurs
      if (error.message.includes("doesn't exist")) {
        return res.status(500).json({
          success: false,
          message: 'Table des commandes non initialisée. Contactez l\'administrateur.',
          error: 'DATABASE_TABLE_MISSING',
          details: error.message
        });
      }
      
      if (error.message.includes("Unknown column")) {
        return res.status(500).json({
          success: false,
          message: 'Structure de la base de données incorrecte. Contactez l\'administrateur.',
          error: 'DATABASE_SCHEMA_ERROR',
          details: error.message
        });
      }
      
      if (error.message.includes("Connection")) {
        return res.status(500).json({
          success: false,
          message: 'Erreur de connexion à la base de données. Réessayez plus tard.',
          error: 'DATABASE_CONNECTION_ERROR',
          details: error.message
        });
      }
      
      // Erreur générique
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des commandes',
        error: 'UNKNOWN_ERROR',
        details: error.message
      });
    }
  }

  // Récupérer une commande par ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la commande',
        error: error.message
      });
    }
  }

  // Créer une nouvelle commande
  static async createOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const orderData = {
        ...req.body,
        user_id: req.user.id
      };
      
      const orderId = await Order.create(orderData);
      
      res.status(201).json({
        success: true,
        message: 'Commande créée avec succès',
        data: { id: orderId }
      });
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la commande',
        error: error.message
      });
    }
  }

  // Mettre à jour une commande
  static async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      await order.update(updateData);
      
      res.json({
        success: true,
        message: 'Commande mise à jour avec succès',
        data: order
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la commande',
        error: error.message
      });
    }
  }

  // Approuver une commande
  static async approveOrder(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      if (order.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Seules les commandes en attente peuvent être approuvées'
        });
      }
      
      await order.approve();
      
      res.json({
        success: true,
        message: 'Commande approuvée avec succès',
        data: order
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la commande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'approbation de la commande',
        error: error.message
      });
    }
  }

  // Marquer comme en transit
  static async markAsInTransit(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      if (order.status !== 'APPROVED') {
        return res.status(400).json({
          success: false,
          message: 'Seules les commandes approuvées peuvent être mises en transit'
        });
      }
      
      await order.markAsInTransit();
      
      res.json({
        success: true,
        message: 'Commande mise en transit avec succès',
        data: order
      });
    } catch (error) {
      console.error('Erreur lors de la mise en transit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise en transit',
        error: error.message
      });
    }
  }

  // Marquer comme livrée
  static async markAsDelivered(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      if (order.status !== 'IN_TRANSIT') {
        return res.status(400).json({
          success: false,
          message: 'Seules les commandes en transit peuvent être marquées comme livrées'
        });
      }
      
      // Traiter la livraison (augmentation des stocks + changement de statut)
      const deliveryResult = await order.markAsDelivered();
      
      res.json({
        success: true,
        message: 'Commande marquée comme livrée avec succès',
        data: {
          order: order,
          deliveryDetails: {
            itemsProcessed: deliveryResult?.itemsProcessed || 0,
            movementsCreated: deliveryResult?.movementsCreated || 0,
            stockUpdated: true
          }
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la finalisation:', error);
      
      // Gestion d'erreurs spécifiques
      let errorMessage = 'Erreur lors de la finalisation de la commande';
      let statusCode = 500;
      
      if (error.message.includes('Aucun article trouvé')) {
        errorMessage = 'Aucun article trouvé pour cette commande';
        statusCode = 400;
      } else if (error.message.includes('non trouvé')) {
        errorMessage = 'Médicament non trouvé dans la commande';
        statusCode = 400;
      } else if (error.message.includes('transaction')) {
        errorMessage = 'Erreur de transaction lors de la mise à jour des stocks';
        statusCode = 500;
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message
      });
    }
  }

  // Annuler une commande
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      if (order.status === 'DELIVERED') {
        return res.status(400).json({
          success: false,
          message: 'Les commandes livrées ne peuvent pas être annulées'
        });
      }
      
      await order.cancel();
      
      res.json({
        success: true,
        message: 'Commande annulée avec succès',
        data: order
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation de la commande',
        error: error.message
      });
    }
  }

  // Supprimer une commande
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Commande non trouvée'
        });
      }
      
      await order.delete();
      
      res.json({
        success: true,
        message: 'Commande supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la commande',
        error: error.message
      });
    }
  }

  // Récupérer les statistiques des commandes
  static async getOrderStatistics(req, res) {
    try {
      const { supplier_id, date_from, date_to } = req.query;
      
      const statistics = await Order.getOrderSummary(supplier_id, date_from, date_to);
      
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

  // Récupérer les commandes en attente
  static async getPendingOrders(req, res) {
    try {
      const orders = await Order.findPending();
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes en attente:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des commandes en attente',
        error: error.message
      });
    }
  }
}

module.exports = OrderController;