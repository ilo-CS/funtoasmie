import api from './api';

class OrderService {
  // Récupérer toutes les commandes
  static async getAllOrders(params = {}) {
    try {
      console.log('🔍 OrderService.getAllOrders - Paramètres:', params);
      
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.supplier_id) queryParams.append('supplier_id', params.supplier_id);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/orders?${queryString}` : '/orders';
      
      console.log('🔍 URL de la requête:', url);
      
      const response = await api.get(url);
      
      console.log('🔍 Réponse API reçue:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Erreur dans OrderService.getAllOrders:', error);
      
      // Gestion spécifique des erreurs
      if (error.message.includes('fetch')) {
        throw new Error('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (error.message.includes('403')) {
        throw new Error('Accès refusé. Permissions insuffisantes pour accéder aux commandes.');
      }
      
      if (error.message.includes('500')) {
        throw new Error('Erreur du serveur. Contactez l\'administrateur.');
      }
      
      // Propager l'erreur avec plus de contexte
      throw new Error(`Erreur lors de la récupération des commandes: ${error.message}`);
    }
  }

  // Récupérer une commande par ID
  static async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      throw error;
    }
  }

  // Créer une nouvelle commande
  static async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response; // ✅ Retourner la réponse complète, pas seulement response.data
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  }

  // Mettre à jour une commande
  static async updateOrder(id, updateData) {
    try {
      const response = await api.put(`/orders/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      throw error;
    }
  }

  // Approuver une commande
  static async approveOrder(id) {
    try {
      const response = await api.patch(`/orders/${id}/approve`);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la commande:', error);
      throw error;
    }
  }

  // Marquer comme en transit
  static async markAsInTransit(id) {
    try {
      const response = await api.patch(`/orders/${id}/in-transit`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise en transit:', error);
      throw error;
    }
  }

  // Marquer comme livrée
  static async markAsDelivered(id) {
    try {
      const response = await api.patch(`/orders/${id}/delivered`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      throw error;
    }
  }

  // Annuler une commande
  static async cancelOrder(id) {
    try {
      const response = await api.patch(`/orders/${id}/cancel`);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      throw error;
    }
  }

  // Supprimer une commande
  static async deleteOrder(id) {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des commandes
  static async getOrderStatistics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.supplier_id) queryParams.append('supplier_id', params.supplier_id);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/orders/statistics?${queryString}` : '/orders/statistics';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Récupérer les commandes en attente
  static async getPendingOrders() {
    try {
      const response = await api.get('/orders/pending');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes en attente:', error);
      throw error;
    }
  }
}

export default OrderService;
