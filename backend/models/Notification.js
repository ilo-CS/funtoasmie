const { query } = require('../config/database');

class Notification {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type;
    this.is_read = data.is_read;
    this.read_at = data.read_at;
    this.related_entity_type = data.related_entity_type;
    this.related_entity_id = data.related_entity_id;
    this.created_at = data.created_at;
  }

  static validateNotificationData(notificationData) {
    const errors = [];

    // Validation de l'utilisateur (obligatoire)
    if (!notificationData.user_id) {
      errors.push('L\'utilisateur est obligatoire');
    }

    // Validation du titre (obligatoire)
    if (!notificationData.title || notificationData.title.trim().length < 1) {
      errors.push('Le titre est obligatoire');
    }
    if (notificationData.title && notificationData.title.length > 100) {
      errors.push('Le titre ne peut pas dépasser 100 caractères');
    }

    // Validation du message (obligatoire)
    if (!notificationData.message || notificationData.message.trim().length < 1) {
      errors.push('Le message est obligatoire');
    }
    if (notificationData.message && notificationData.message.length > 500) {
      errors.push('Le message ne peut pas dépasser 500 caractères');
    }

    // Validation du type
    const validTypes = ['ALERT', 'INFO', 'WARNING', 'SUCCESS'];
    if (!notificationData.type || !validTypes.includes(notificationData.type)) {
      errors.push('Le type doit être ALERT, INFO, WARNING ou SUCCESS');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(notificationData) {
    try {
      // Valider les données
      const validation = this.validateNotificationData(notificationData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { user_id, title, message, type, related_entity_type, related_entity_id } = notificationData;
      
      const sql = `
        INSERT INTO notifications (
          user_id, title, message, type, is_read, 
          related_entity_type, related_entity_id, created_at
        ) VALUES (?, ?, ?, ?, 0, ?, ?, NOW())
      `;
      
      const result = await query(sql, [
        user_id,
        title.trim(),
        message.trim(),
        type,
        related_entity_type || null,
        related_entity_id || null
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la notification: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT n.*, u.first_name, u.last_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.id = ?
      `;
      const notifications = await query(sql, [id]);
      return notifications.length > 0 ? new Notification(notifications[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de la notification: ${error.message}`);
    }
  }

  static async findByUser(user_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT n.*, u.first_name, u.last_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const notifications = await query(sql, [user_id, limit, offset]);
      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des notifications: ${error.message}`);
    }
  }

  static async findUnreadByUser(user_id) {
    try {
      const sql = `
        SELECT n.*, u.first_name, u.last_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.user_id = ? AND n.is_read = 0
        ORDER BY n.created_at DESC
      `;
      const notifications = await query(sql, [user_id]);
      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des notifications non lues: ${error.message}`);
    }
  }

  static async findByType(type, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT n.*, u.first_name, u.last_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.type = ?
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const notifications = await query(sql, [type, limit, offset]);
      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des notifications: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT n.*, u.first_name, u.last_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filtres
      if (filters.user_id) {
        sql += ' AND n.user_id = ?';
        params.push(filters.user_id);
      }
      
      if (filters.type) {
        sql += ' AND n.type = ?';
        params.push(filters.type);
      }
      
      if (filters.is_read !== undefined) {
        sql += ' AND n.is_read = ?';
        params.push(filters.is_read ? 1 : 0);
      }
      
      if (filters.related_entity_type) {
        sql += ' AND n.related_entity_type = ?';
        params.push(filters.related_entity_type);
      }
      
      if (filters.date_from) {
        sql += ' AND n.created_at >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND n.created_at <= ?';
        params.push(filters.date_to);
      }
      
      sql += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const notifications = await query(sql, params);
      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des notifications: ${error.message}`);
    }
  }

  static async getNotificationSummary(user_id = null) {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(CASE WHEN is_read = 0 THEN 1 END) as unread_count,
          COUNT(CASE WHEN is_read = 1 THEN 1 END) as read_count,
          COUNT(CASE WHEN type = 'ALERT' THEN 1 END) as alert_count,
          COUNT(CASE WHEN type = 'INFO' THEN 1 END) as info_count,
          COUNT(CASE WHEN type = 'WARNING' THEN 1 END) as warning_count,
          COUNT(CASE WHEN type = 'SUCCESS' THEN 1 END) as success_count
        FROM notifications
        WHERE 1=1
      `;
      const params = [];
      
      if (user_id) {
        sql += ' AND user_id = ?';
        params.push(user_id);
      }
      
      const summary = await query(sql, params);
      return summary[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du résumé: ${error.message}`);
    }
  }

  static async createStockAlert(user_id, medication_name, current_quantity, min_quantity) {
    try {
      const title = 'Alerte de stock faible';
      const message = `Le médicament "${medication_name}" a un stock faible: ${current_quantity} unités restantes (seuil minimum: ${min_quantity})`;
      
      return await this.create({
        user_id,
        title,
        message,
        type: 'ALERT',
        related_entity_type: 'medication'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'alerte de stock: ${error.message}`);
    }
  }

  static async createExpiryAlert(user_id, medication_name, batch_number, expiry_date) {
    try {
      const title = 'Médicament expiré';
      const message = `Le médicament "${medication_name}" (Lot: ${batch_number}) a expiré le ${expiry_date}`;
      
      return await this.create({
        user_id,
        title,
        message,
        type: 'WARNING',
        related_entity_type: 'medication'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'alerte d'expiration: ${error.message}`);
    }
  }

  static async createOrderNotification(user_id, order_number, status) {
    try {
      const title = 'Mise à jour de commande';
      const message = `La commande ${order_number} a été ${status.toLowerCase()}`;
      
      return await this.create({
        user_id,
        title,
        message,
        type: 'INFO',
        related_entity_type: 'order'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la création de la notification de commande: ${error.message}`);
    }
  }

  static async createDistributionNotification(user_id, medication_name, site_name, quantity) {
    try {
      const title = 'Distribution effectuée';
      const message = `${quantity} unités de "${medication_name}" ont été distribuées vers ${site_name}`;
      
      return await this.create({
        user_id,
        title,
        message,
        type: 'SUCCESS',
        related_entity_type: 'distribution'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la création de la notification de distribution: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.title !== undefined) {
        fields.push('title = ?');
        values.push(updateData.title.trim());
      }
      
      if (updateData.message !== undefined) {
        fields.push('message = ?');
        values.push(updateData.message.trim());
      }
      
      if (updateData.type !== undefined) {
        fields.push('type = ?');
        values.push(updateData.type);
      }
      
      if (updateData.is_read !== undefined) {
        fields.push('is_read = ?');
        values.push(updateData.is_read ? 1 : 0);
        
        if (updateData.is_read) {
          fields.push('read_at = NOW()');
        }
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      values.push(this.id);
      
      const sql = `UPDATE notifications SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.title !== undefined) this.title = updateData.title;
      if (updateData.message !== undefined) this.message = updateData.message;
      if (updateData.type !== undefined) this.type = updateData.type;
      if (updateData.is_read !== undefined) {
        this.is_read = updateData.is_read;
        if (updateData.is_read) {
          this.read_at = new Date();
        }
      }
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la notification: ${error.message}`);
    }
  }

  async markAsRead() {
    try {
      const sql = `
        UPDATE notifications 
        SET is_read = 1, read_at = NOW() 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.is_read = true;
      this.read_at = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la marque comme lue: ${error.message}`);
    }
  }

  async markAsUnread() {
    try {
      const sql = `
        UPDATE notifications 
        SET is_read = 0, read_at = NULL 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.is_read = false;
      this.read_at = null;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la marque comme non lue: ${error.message}`);
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM notifications WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la notification: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      message: this.message,
      type: this.type,
      is_read: this.is_read,
      read_at: this.read_at,
      related_entity_type: this.related_entity_type,
      related_entity_id: this.related_entity_id,
      created_at: this.created_at
    };
  }
}

module.exports = Notification;
