const { query } = require('../config/database');

class Alert {
  constructor(data) {
    this.id = data.id;
    this.medication_id = data.medication_id;
    this.alert_type = data.alert_type;
    this.message = data.message;
    this.is_resolved = data.is_resolved;
    this.created_at = data.created_at;
    this.resolved_at = data.resolved_at;
  }

  static validateAlertData(alertData) {
    const errors = [];

    // Validation du médicament (obligatoire)
    if (!alertData.medication_id) {
      errors.push('Le médicament est obligatoire');
    }

    // Validation du type d'alerte (obligatoire)
    const validTypes = ['LOW_STOCK', 'EXPIRED', 'CRITICAL', 'HIGH_STOCK'];
    if (!alertData.alert_type || !validTypes.includes(alertData.alert_type)) {
      errors.push('Le type d\'alerte doit être LOW_STOCK, EXPIRED, CRITICAL ou HIGH_STOCK');
    }

    // Validation du message (obligatoire)
    if (!alertData.message || alertData.message.trim().length < 1) {
      errors.push('Le message est obligatoire');
    }
    if (alertData.message && alertData.message.length > 500) {
      errors.push('Le message ne peut pas dépasser 500 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(alertData) {
    try {
      // Valider les données
      const validation = this.validateAlertData(alertData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { medication_id, alert_type, message } = alertData;
      
      const sql = `
        INSERT INTO alerts (medication_id, alert_type, message, is_resolved, created_at)
        VALUES (?, ?, ?, 0, NOW())
      `;
      
      const result = await query(sql, [
        medication_id,
        alert_type,
        message.trim()
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'alerte: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT a.*, m.name as medication_name, m.current_quantity, m.min_quantity
        FROM alerts a
        LEFT JOIN medications m ON a.medication_id = m.id
        WHERE a.id = ?
      `;
      const alerts = await query(sql, [id]);
      return alerts.length > 0 ? new Alert(alerts[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'alerte: ${error.message}`);
    }
  }

  static async findByMedication(medication_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT a.*, m.name as medication_name, m.current_quantity, m.min_quantity
        FROM alerts a
        LEFT JOIN medications m ON a.medication_id = m.id
        WHERE a.medication_id = ?
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const alerts = await query(sql, [medication_id, limit, offset]);
      return alerts.map(alert => new Alert(alert));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des alertes: ${error.message}`);
    }
  }

  static async findActive() {
    try {
      const sql = `
        SELECT a.*, m.name as medication_name, m.current_quantity, m.min_quantity
        FROM alerts a
        LEFT JOIN medications m ON a.medication_id = m.id
        WHERE a.is_resolved = 0
        ORDER BY a.created_at DESC
      `;
      const alerts = await query(sql);
      return alerts.map(alert => new Alert(alert));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des alertes actives: ${error.message}`);
    }
  }

  static async findByType(alert_type, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT a.*, m.name as medication_name, m.current_quantity, m.min_quantity
        FROM alerts a
        LEFT JOIN medications m ON a.medication_id = m.id
        WHERE a.alert_type = ?
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const alerts = await query(sql, [alert_type, limit, offset]);
      return alerts.map(alert => new Alert(alert));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des alertes: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT a.*, m.name as medication_name, m.current_quantity, m.min_quantity
        FROM alerts a
        LEFT JOIN medications m ON a.medication_id = m.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filtres
      if (filters.medication_id) {
        sql += ' AND a.medication_id = ?';
        params.push(filters.medication_id);
      }
      
      if (filters.alert_type) {
        sql += ' AND a.alert_type = ?';
        params.push(filters.alert_type);
      }
      
      if (filters.is_resolved !== undefined) {
        sql += ' AND a.is_resolved = ?';
        params.push(filters.is_resolved ? 1 : 0);
      }
      
      if (filters.date_from) {
        sql += ' AND a.created_at >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND a.created_at <= ?';
        params.push(filters.date_to);
      }
      
      sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const alerts = await query(sql, params);
      return alerts.map(alert => new Alert(alert));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des alertes: ${error.message}`);
    }
  }

  static async getAlertSummary() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_alerts,
          COUNT(CASE WHEN is_resolved = 0 THEN 1 END) as active_alerts,
          COUNT(CASE WHEN is_resolved = 1 THEN 1 END) as resolved_alerts,
          COUNT(CASE WHEN alert_type = 'LOW_STOCK' THEN 1 END) as low_stock_alerts,
          COUNT(CASE WHEN alert_type = 'EXPIRED' THEN 1 END) as expired_alerts,
          COUNT(CASE WHEN alert_type = 'CRITICAL' THEN 1 END) as critical_alerts,
          COUNT(CASE WHEN alert_type = 'HIGH_STOCK' THEN 1 END) as high_stock_alerts
        FROM alerts
      `;
      const summary = await query(sql);
      return summary[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du résumé: ${error.message}`);
    }
  }

  static async createLowStockAlert(medication_id, current_quantity, min_quantity) {
    try {
      const message = `Stock faible: ${current_quantity} unités restantes (seuil minimum: ${min_quantity})`;
      
      const sql = `
        INSERT INTO alerts (medication_id, alert_type, message, is_resolved, created_at)
        VALUES (?, 'LOW_STOCK', ?, 0, NOW())
      `;
      
      const result = await query(sql, [medication_id, message]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'alerte de stock faible: ${error.message}`);
    }
  }

  static async createExpiredAlert(medication_id, batch_number, expiry_date) {
    try {
      const message = `Médicament expiré: Lot ${batch_number} (expiré le ${expiry_date})`;
      
      const sql = `
        INSERT INTO alerts (medication_id, alert_type, message, is_resolved, created_at)
        VALUES (?, 'EXPIRED', ?, 0, NOW())
      `;
      
      const result = await query(sql, [medication_id, message]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'alerte d'expiration: ${error.message}`);
    }
  }

  static async createCriticalAlert(medication_id, current_quantity) {
    try {
      const message = `Stock critique: ${current_quantity} unités restantes - Réapprovisionnement urgent nécessaire`;
      
      const sql = `
        INSERT INTO alerts (medication_id, alert_type, message, is_resolved, created_at)
        VALUES (?, 'CRITICAL', ?, 0, NOW())
      `;
      
      const result = await query(sql, [medication_id, message]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'alerte critique: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.message !== undefined) {
        fields.push('message = ?');
        values.push(updateData.message.trim());
      }
      
      if (updateData.is_resolved !== undefined) {
        fields.push('is_resolved = ?');
        values.push(updateData.is_resolved ? 1 : 0);
        
        if (updateData.is_resolved) {
          fields.push('resolved_at = NOW()');
        }
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      values.push(this.id);
      
      const sql = `UPDATE alerts SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.message !== undefined) this.message = updateData.message;
      if (updateData.is_resolved !== undefined) {
        this.is_resolved = updateData.is_resolved;
        if (updateData.is_resolved) {
          this.resolved_at = new Date();
        }
      }
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'alerte: ${error.message}`);
    }
  }

  async resolve() {
    try {
      const sql = `
        UPDATE alerts 
        SET is_resolved = 1, resolved_at = NOW() 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.is_resolved = true;
      this.resolved_at = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la résolution de l'alerte: ${error.message}`);
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM alerts WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'alerte: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      medication_id: this.medication_id,
      alert_type: this.alert_type,
      message: this.message,
      is_resolved: this.is_resolved,
      created_at: this.created_at,
      resolved_at: this.resolved_at
    };
  }
}

module.exports = Alert;
