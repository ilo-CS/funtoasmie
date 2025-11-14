import api from './api';

class OrderItemService {
  // Récupérer tous les articles d'une commande
  static async getOrderItems(orderId) {
    try {
      const response = await api.get(`/order-items/order/${orderId}`);
      return response;
    } catch (error) {
      console.error('❌ Erreur dans OrderItemService.getOrderItems:', error);
      
      if (error.message.includes('fetch')) {
        throw new Error('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (error.message.includes('403')) {
        throw new Error('Accès refusé. Permissions insuffisantes pour accéder aux articles.');
      }
      
      if (error.message.includes('500')) {
        throw new Error('Erreur du serveur. Contactez l\'administrateur.');
      }
      
      throw new Error(`Erreur lors de la récupération des articles: ${error.message}`);
    }
  }

  // Récupérer un article par ID
  static async getOrderItemById(id) {
    try {
      const response = await api.get(`/order-items/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error);
      throw error;
    }
  }

  // Ajouter un article à une commande
  static async addOrderItem(orderId, itemData) {
    try {
      const response = await api.post(`/order-items/order/${orderId}`, itemData);
      return response;
    } catch (error) {
      console.error('❌ Erreur dans OrderItemService.addOrderItem:', error);
      
      if (error.message.includes('fetch')) {
        throw new Error('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (error.message.includes('403')) {
        throw new Error('Accès refusé. Permissions insuffisantes pour ajouter des articles.');
      }
      
      if (error.message.includes('400')) {
        throw new Error('Données invalides. Vérifiez les informations saisies.');
      }
      
      if (error.message.includes('500')) {
        throw new Error('Erreur du serveur. Contactez l\'administrateur.');
      }
      
      throw new Error(`Erreur lors de l'ajout de l'article: ${error.message}`);
    }
  }

  // Mettre à jour un article
  static async updateOrderItem(id, updateData) {
    try {
      const response = await api.put(`/order-items/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('❌ Erreur dans OrderItemService.updateOrderItem:', error);
      
      if (error.message.includes('fetch')) {
        throw new Error('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (error.message.includes('403')) {
        throw new Error('Accès refusé. Permissions insuffisantes pour modifier des articles.');
      }
      
      if (error.message.includes('400')) {
        throw new Error('Données invalides. Vérifiez les informations saisies.');
      }
      
      if (error.message.includes('404')) {
        throw new Error('Article non trouvé.');
      }
      
      if (error.message.includes('500')) {
        throw new Error('Erreur du serveur. Contactez l\'administrateur.');
      }
      
      throw new Error(`Erreur lors de la mise à jour de l'article: ${error.message}`);
    }
  }

  // Supprimer un article
  static async deleteOrderItem(id) {
    try {
      const response = await api.delete(`/order-items/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Erreur dans OrderItemService.deleteOrderItem:', error);
      
      if (error.message.includes('fetch')) {
        throw new Error('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (error.message.includes('403')) {
        throw new Error('Accès refusé. Permissions insuffisantes pour supprimer des articles.');
      }
      
      if (error.message.includes('404')) {
        throw new Error('Article non trouvé.');
      }
      
      if (error.message.includes('500')) {
        throw new Error('Erreur du serveur. Contactez l\'administrateur.');
      }
      
      throw new Error(`Erreur lors de la suppression de l'article: ${error.message}`);
    }
  }

  // Récupérer le total d'une commande
  static async getOrderTotal(orderId) {
    try {
      const response = await api.get(`/order-items/order/${orderId}/total`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du total:', error);
      throw error;
    }
  }

  // Recalculer le total d'une commande
  static async recalculateOrderTotal(orderId) {
    try {
      const response = await api.patch(`/order-items/order/${orderId}/recalculate`);
      return response;
    } catch (error) {
      console.error('Erreur lors du recalcul du total:', error);
      throw error;
    }
  }
}

export default OrderItemService;
