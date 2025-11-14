const { query } = require('../config/database');

class OrderItem {
  constructor(data) {
    this.id = data.id;
    this.order_id = data.order_id;
    this.medication_id = data.medication_id;
    this.quantity = data.quantity;
    this.created_at = data.created_at;
    
    // Champs additionnels pour les jointures
    this.medication_name = data.medication_name;
    this.description = data.description;
    this.unit_name = data.unit_name;
  }

  static validateOrderItemData(itemData) {
    const errors = [];

    // Validation de la commande (obligatoire)
    if (!itemData.order_id) {
      errors.push('L\'ID de la commande est obligatoire');
    }

    // Validation du médicament (obligatoire)
    if (!itemData.medication_id) {
      errors.push('L\'ID du médicament est obligatoire');
    }

    // Validation de la quantité
    if (!itemData.quantity || itemData.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }
    if (itemData.quantity && itemData.quantity > 10000) {
      errors.push('La quantité ne peut pas dépasser 10,000 unités');
    }


    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(itemData) {
    try {
      // Valider les données
      const validation = this.validateOrderItemData(itemData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { order_id, medication_id, quantity } = itemData;
      
      const sql = `
        INSERT INTO order_items (
          order_id, medication_id, quantity, 
          created_at
        ) VALUES (?, ?, ?, NOW())
      `;
      
      const result = await query(sql, [
        order_id,
        medication_id,
        quantity
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'article: ${error.message}`);
    }
  }

  static async findByOrderId(order_id) {
    try {
      const sql = `
        SELECT oi.*, m.name as medication_name, m.description, m.unit_name
        FROM order_items oi
        LEFT JOIN medications m ON oi.medication_id = m.id
        WHERE oi.order_id = ?
        ORDER BY oi.created_at ASC
      `;
      const items = await query(sql, [order_id]);
      return items.map(item => new OrderItem(item));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des articles: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT oi.*, m.name as medication_name, m.description, m.unit_name
        FROM order_items oi
        LEFT JOIN medications m ON oi.medication_id = m.id
        WHERE oi.id = ?
      `;
      const items = await query(sql, [id]);
      return items.length > 0 ? new OrderItem(items[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'article: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.quantity !== undefined) {
        fields.push('quantity = ?');
        values.push(updateData.quantity);
      }
      
      // Ignorer unit_price/total_price si colonnes non présentes dans le schéma actuel
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      // Ne pas maintenir de total_price si la colonne n'existe pas
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = `UPDATE order_items SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'article: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM order_items WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'article: ${error.message}`);
    }
  }

  static async getOrderItemsCount(order_id) {
    try {
      const sql = `
        SELECT COUNT(*) as items_count
        FROM order_items 
        WHERE order_id = ?
      `;
      const result = await query(sql, [order_id]);
      return result[0] || { items_count: 0 };
    } catch (error) {
      throw new Error(`Erreur lors du calcul du nombre d'articles: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      order_id: this.order_id,
      medication_id: this.medication_id,
      quantity: this.quantity,
      // Prix supprimés du modèle courant car colonnes absentes
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = OrderItem;