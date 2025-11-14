const { query } = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.supplier_id = data.supplier_id;
    this.supplier_name = data.supplier_name;
    this.order_number = data.order_number;
    this.status = data.status;
    this.order_date = data.order_date;
    this.delivery_date = data.delivery_date;
    this.user_id = data.user_id;
    this.user_name = data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : null;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateOrderData(orderData) {
    const errors = [];

    // Validation du fournisseur (obligatoire)
    if (!orderData.supplier_id) {
      errors.push('Le fournisseur est obligatoire');
    }

    // Validation du numéro de commande (obligatoire)
    if (!orderData.order_number || orderData.order_number.trim().length < 1) {
      errors.push('Le numéro de commande est obligatoire');
    }
    if (orderData.order_number && orderData.order_number.length > 50) {
      errors.push('Le numéro de commande ne peut pas dépasser 50 caractères');
    }

    // Validation du statut
    const validStatuses = ['PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (orderData.status && !validStatuses.includes(orderData.status)) {
      errors.push('Le statut doit être PENDING, APPROVED, IN_TRANSIT, DELIVERED ou CANCELLED');
    }


    // Validation des notes (optionnelles)
    if (orderData.notes && orderData.notes.length > 500) {
      errors.push('Les notes ne peuvent pas dépasser 500 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(orderData) {
    try {
      // Valider les données
      const validation = this.validateOrderData(orderData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { supplier_id, order_number, user_id, notes } = orderData;
      
      // Vérifier si le numéro de commande existe déjà
      const existingOrder = await this.findByOrderNumber(order_number);
      if (existingOrder) {
        throw new Error('Ce numéro de commande existe déjà');
      }
      
      const sql = `
        INSERT INTO orders (
          supplier_id, order_number, status, order_date, 
          user_id, notes, created_at, updated_at
        ) VALUES (?, ?, 'PENDING', NOW(), ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        supplier_id,
        order_number.trim(),
        user_id,
        notes ? notes.trim() : null
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
    }
  }

  static async findByOrderNumber(order_number) {
    try {
      const sql = 'SELECT * FROM orders WHERE order_number = ?';
      const orders = await query(sql, [order_number]);
      return orders.length > 0 ? new Order(orders[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de la commande: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT o.*, s.name as supplier_name, u.first_name, u.last_name
        FROM orders o
        LEFT JOIN suppliers s ON o.supplier_id = s.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `;
      const orders = await query(sql, [id]);
      return orders.length > 0 ? new Order(orders[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de la commande: ${error.message}`);
    }
  }

  static async findBySupplier(supplier_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT o.*, s.name as supplier_name, u.first_name, u.last_name
        FROM orders o
        LEFT JOIN suppliers s ON o.supplier_id = s.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.supplier_id = ?
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const orders = await query(sql, [supplier_id, limit, offset]);
      return orders.map(order => new Order(order));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des commandes: ${error.message}`);
    }
  }

  static async findPending() {
    try {
      const sql = `
        SELECT o.*, s.name as supplier_name, u.first_name, u.last_name
        FROM orders o
        LEFT JOIN suppliers s ON o.supplier_id = s.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.status = 'PENDING'
        ORDER BY o.created_at ASC
      `;
      const orders = await query(sql);
      return orders.map(order => new Order(order));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des commandes en attente: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT o.*, s.name as supplier_name, u.first_name, u.last_name
        FROM orders o
        LEFT JOIN suppliers s ON o.supplier_id = s.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filtres
      if (filters.supplier_id) {
        sql += ' AND o.supplier_id = ?';
        params.push(filters.supplier_id);
      }
      
      if (filters.status) {
        sql += ' AND o.status = ?';
        params.push(filters.status);
      }
      
      if (filters.user_id) {
        sql += ' AND o.user_id = ?';
        params.push(filters.user_id);
      }
      
      if (filters.date_from) {
        sql += ' AND o.order_date >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND o.order_date <= ?';
        params.push(filters.date_to);
      }
      
      sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const orders = await query(sql, params);
      
      return orders.map(order => new Order(order));
    } catch (error) {
      console.error('❌ Erreur dans Order.findAll:', error);
      
      // Gestion spécifique des erreurs SQL
      if (error.code === 'ER_NO_SUCH_TABLE') {
        throw new Error(`Table 'orders' n'existe pas dans la base de données`);
      }
      
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        throw new Error(`Colonne inexistante dans la table 'orders': ${error.message}`);
      }
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error(`Référence invalide: ${error.message}`);
      }
      
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error(`Accès refusé à la base de données: ${error.message}`);
      }
      
      // Erreur générique avec plus de détails
      throw new Error(`Erreur lors de la récupération des commandes: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
    }
  }

  static async getOrderSummary(supplier_id = null, date_from = null, date_to = null) {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'IN_TRANSIT' THEN 1 END) as in_transit_count,
          COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_count,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count
        FROM orders
        WHERE 1=1
      `;
      const params = [];
      
      if (supplier_id) {
        sql += ' AND supplier_id = ?';
        params.push(supplier_id);
      }
      
      if (date_from) {
        sql += ' AND order_date >= ?';
        params.push(date_from);
      }
      
      if (date_to) {
        sql += ' AND order_date <= ?';
        params.push(date_to);
      }
      
      const summary = await query(sql, params);
      return summary[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du résumé: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.order_number !== undefined) {
        fields.push('order_number = ?');
        values.push(updateData.order_number.trim());
      }
      
      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      
      
      if (updateData.delivery_date !== undefined) {
        fields.push('delivery_date = ?');
        values.push(updateData.delivery_date);
      }
      
      if (updateData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(updateData.notes ? updateData.notes.trim() : null);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(this.id);
      
      const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.order_number !== undefined) this.order_number = updateData.order_number;
      if (updateData.status !== undefined) this.status = updateData.status;
      if (updateData.delivery_date !== undefined) this.delivery_date = updateData.delivery_date;
      if (updateData.notes !== undefined) this.notes = updateData.notes;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la commande: ${error.message}`);
    }
  }

  async approve() {
    try {
      const sql = `
        UPDATE orders 
        SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'APPROVED';
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de l'approbation de la commande: ${error.message}`);
    }
  }

  async markAsInTransit() {
    try {
      const sql = `
        UPDATE orders 
        SET status = 'IN_TRANSIT', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'IN_TRANSIT';
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }

  async markAsDelivered() {
    try {
      // 1. D'abord traiter l'augmentation des stocks
      await this.processOrderDelivery();
      
      // 2. Ensuite marquer comme livrée
      const sql = `
        UPDATE orders 
        SET status = 'DELIVERED', delivery_date = NOW(), updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'DELIVERED';
      this.delivery_date = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la finalisation de la commande: ${error.message}`);
    }
  }

  /**
   * Traiter la livraison d'une commande : augmenter les stocks des médicaments
   */
  async processOrderDelivery() {
    const { pool } = require('../config/database');
    const OrderItem = require('./OrderItem');
    const Medication = require('./Medication');
    const StockMovement = require('./StockMovement');
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Récupérer tous les items de la commande
      const orderItems = await OrderItem.findByOrderId(this.id);
      
      if (!orderItems || orderItems.length === 0) {
        throw new Error('Aucun article trouvé pour cette commande');
      }
      
      const movements = [];
      const errors = [];
      
      // 2. Pour chaque item, augmenter le stock du médicament
      for (const item of orderItems) {
        try {
          // Récupérer le médicament actuel
          const medication = await Medication.findById(item.medication_id);
          if (!medication) {
            throw new Error(`Médicament ID ${item.medication_id} non trouvé`);
          }
          
          const oldQuantity = medication.quantity;
          const newQuantity = oldQuantity + item.quantity;
          
          // Mettre à jour le stock global
          await connection.execute(
            'UPDATE medications SET quantity = ?, updated_at = NOW() WHERE id = ?',
            [newQuantity, medication.id]
          );
          
          // Créer un mouvement de stock de type IN
          const movementData = {
            medication_id: item.medication_id,
            movement_type: 'IN',
            quantity: item.quantity,
            reference_type: 'ORDER',
            reference_id: this.id,
            site_id: null, // Pas de site pour les commandes (stock global)
            from_site_id: null,
            to_site_id: null,
            user_id: this.user_id,
            notes: `Livraison commande ${this.order_number} - ${item.medication_name || 'Médicament ' + item.medication_id}`
          };
          
          const movementId = await StockMovement.create(movementData, connection);
          movements.push(movementId);
          
        } catch (itemError) {
          errors.push(`Article ${item.medication_name}: ${itemError.message}`);
        }
      }
      
      // Vérifier s'il y a eu des erreurs
      if (errors.length > 0) {
        throw new Error(`Erreurs lors du traitement des articles: ${errors.join(', ')}`);
      }
      
      await connection.commit();
      
      return {
        success: true,
        movementsCreated: movements.length,
        itemsProcessed: orderItems.length
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async cancel() {
    try {
      const sql = `
        UPDATE orders 
        SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'CANCELLED';
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation de la commande: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si la commande peut être supprimée
      if (this.status === 'DELIVERED') {
        throw new Error('Les commandes livrées ne peuvent pas être supprimées');
      }
      
      const sql = 'DELETE FROM orders WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la commande: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      supplier_id: this.supplier_id,
      supplier_name: this.supplier_name,
      order_number: this.order_number,
      status: this.status,
      order_date: this.order_date,
      delivery_date: this.delivery_date,
      user_id: this.user_id,
      user_name: this.user_name,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Order;
