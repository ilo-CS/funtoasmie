const OrderItem = require('../models/OrderItem');
const { validationResult } = require('express-validator');

class OrderItemController {
  // Récupérer tous les articles d'une commande
  static async getOrderItems(req, res) {
    try {
      const { orderId } = req.params;
      const items = await OrderItem.findByOrderId(orderId);
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des articles',
        error: error.message
      });
    }
  }

  // Récupérer un article par ID
  static async getOrderItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await OrderItem.findById(id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'article:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'article',
        error: error.message
      });
    }
  }

  // Ajouter un article à une commande
  static async addOrderItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { orderId } = req.params;
      const itemData = {
        ...req.body,
        order_id: orderId
      };
      
      const itemId = await OrderItem.create(itemData);
      
      res.status(201).json({
        success: true,
        message: 'Article ajouté avec succès',
        data: { 
          id: itemId
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'article:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout de l\'article',
        error: error.message
      });
    }
  }

  // Mettre à jour un article
  static async updateOrderItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = req.body;
      
      const updatedItem = await OrderItem.update(id, updateData);
      
      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Article mis à jour avec succès',
        data: updatedItem
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'article:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'article',
        error: error.message
      });
    }
  }

  // Supprimer un article
  static async deleteOrderItem(req, res) {
    try {
      const { id } = req.params;
      
      // Récupérer l'article avant suppression pour avoir l'order_id
      const item = await OrderItem.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé'
        });
      }
      
      await OrderItem.delete(id);
      
      res.json({
        success: true,
        message: 'Article supprimé avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'article:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'article',
        error: error.message
      });
    }
  }

  // Récupérer le total d'une commande
  static async getOrderTotal(req, res) {
    try {
      const { orderId } = req.params;
      
      const totalInfo = await OrderItem.getOrderTotal(orderId);
      
      res.json({
        success: true,
        data: totalInfo
      });
    } catch (error) {
      console.error('❌ Erreur lors du calcul du total:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul du total',
        error: error.message
      });
    }
  }

  // Recalculer le total d'une commande
  static async recalculateOrderTotal(req, res) {
    try {
      const { orderId } = req.params;
      
      const totalInfo = await OrderItem.updateOrderTotal(orderId);
      
      res.json({
        success: true,
        message: 'Total recalculé avec succès',
        data: totalInfo
      });
    } catch (error) {
      console.error('❌ Erreur lors du recalcul du total:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du recalcul du total',
        error: error.message
      });
    }
  }
}

module.exports = OrderItemController;
