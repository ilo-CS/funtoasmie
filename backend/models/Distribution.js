const { query } = require('../config/database');
const DistributionItem = require('./DistributionItem');

class Distribution {
  constructor(data) {
    this.id = data.id;
    this.site_id = data.site_id;
    this.status = data.status;
    this.notes = data.notes;
    this.created_by = data.user_id || data.created_by; // Support both user_id and created_by
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.items = data.items || []; // Array of DistributionItem objects
  }

  static validateDistributionData(distributionData) {
    const errors = [];

    // Validation du site (obligatoire)
    if (!distributionData.site_id) {
      errors.push('Le site est obligatoire');
    }

    // Validation des items (obligatoire)
    if (!distributionData.items || !Array.isArray(distributionData.items) || distributionData.items.length === 0) {
      errors.push('Au moins un médicament doit être ajouté à la distribution');
    } else {
      // Validation de chaque item
      distributionData.items.forEach((item, index) => {
        if (!item.medication_id) {
          errors.push(`Le médicament est obligatoire pour l'item ${index + 1}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`La quantité doit être supérieure à 0 pour l'item ${index + 1}`);
        }
      });
    }

    // Validation du statut
    const validStatuses = ['pending', 'distributed', 'cancelled'];
    if (distributionData.status && !validStatuses.includes(distributionData.status)) {
      errors.push('Le statut doit être pending, distributed ou cancelled');
    }

    // Validation des notes (optionnelles)
    if (distributionData.notes && distributionData.notes.length > 500) {
      errors.push('Les notes ne peuvent pas dépasser 500 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(distributionData) {
    try {
      // Valider les données
      const validation = this.validateDistributionData(distributionData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { site_id, items, notes, created_by } = distributionData;
      
      // Créer la distribution principale
      const sql = `
        INSERT INTO distributions (
          site_id, status, notes, user_id, created_at, updated_at
        ) VALUES (?, 'pending', ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        site_id,
        notes ? notes.trim() : null,
        created_by
      ]);
      
      const distributionId = result.insertId;

      // Créer les items de distribution
      for (const item of items) {
        await DistributionItem.create({
          distribution_id: distributionId,
          medication_id: item.medication_id,
          quantity: item.quantity
        });
      }
      
      return distributionId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la distribution: ${error.message}`);
    }
  }

  static async createWithStockTransfer(distributionData) {
    try {
      // Valider les données
      const validation = this.validateDistributionData(distributionData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { site_id, items, notes, created_by } = distributionData;
      
      // Vérifier le stock global avant de créer la distribution
      const StockService = require('../services/stockService');
      const stockValidation = await StockService.validateGlobalStock(items);
      
      if (!stockValidation.isValid) {
        throw new Error(`Stock insuffisant: ${stockValidation.errors.join(', ')}`);
      }

      // Créer la distribution
      const distributionId = await this.create(distributionData);
      
      // Effectuer le transfert de stock
      const transferResult = await StockService.performStockTransfer({
        site_id,
        items,
        user_id: created_by,
        reference_type: 'DISTRIBUTION',
        reference_id: distributionId,
        notes
      });

      if (!transferResult.success) {
        // Annuler la distribution si le transfert échoue
        await this.deleteById(distributionId);
        throw new Error(`Erreur lors du transfert de stock: ${transferResult.errors.map(e => e.error).join(', ')}`);
      }

      // Marquer la distribution comme distribuée
      await query(
        'UPDATE distributions SET status = ?, distribution_date = NOW(), updated_at = NOW() WHERE id = ?',
        ['DISTRIBUTED', distributionId]
      );
      
      return {
        distributionId,
        transferResult,
        warnings: stockValidation.warnings
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de la distribution avec transfert: ${error.message}`);
    }
  }

  static async deleteById(id) {
    try {
      // Supprimer d'abord les items de distribution
      await query('DELETE FROM distribution_items WHERE distribution_id = ?', [id]);
      
      // Puis supprimer la distribution
      await query('DELETE FROM distributions WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la distribution: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT d.*, s.name as site_name, s.address as location
        FROM distributions d
        LEFT JOIN sites s ON d.site_id = s.id
        WHERE d.id = ?
      `;
      const distributions = await query(sql, [id]);
      if (distributions.length === 0) return null;
      
      const distribution = new Distribution(distributions[0]);
      
      // Récupérer les items de la distribution
      const items = await DistributionItem.getByDistributionId(id);
      distribution.items = items;
      
      return distribution;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de la distribution: ${error.message}`);
    }
  }

  static async findBySite(site_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT d.*, s.name as site_name, u.first_name, u.last_name
        FROM distributions d
        LEFT JOIN sites s ON d.site_id = s.id
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.site_id = ?
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const distributions = await query(sql, [site_id, limit, offset]);
      
      // Charger les items pour chaque distribution
      for (let distribution of distributions) {
        distribution.items = await DistributionItem.findByDistribution(distribution.id);
      }
      
      return distributions.map(distribution => new Distribution(distribution));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des distributions: ${error.message}`);
    }
  }

  static async findByMedication(medication_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT DISTINCT d.*, s.name as site_name, u.first_name, u.last_name
        FROM distributions d
        LEFT JOIN distribution_items di ON d.id = di.distribution_id
        LEFT JOIN sites s ON d.site_id = s.id
        LEFT JOIN users u ON d.user_id = u.id
        WHERE di.medication_id = ?
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const distributions = await query(sql, [medication_id, limit, offset]);
      
      // Charger les items pour chaque distribution
      for (let distribution of distributions) {
        distribution.items = await DistributionItem.findByDistribution(distribution.id);
      }
      
      return distributions.map(distribution => new Distribution(distribution));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des distributions: ${error.message}`);
    }
  }

  static async findPending() {
    try {
      const sql = `
        SELECT d.*, s.name as site_name, u.first_name, u.last_name
        FROM distributions d
        LEFT JOIN sites s ON d.site_id = s.id
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.status = 'PENDING'
        ORDER BY d.created_at ASC
      `;
      const distributions = await query(sql);
      
      // Charger les items pour chaque distribution
      for (let distribution of distributions) {
        distribution.items = await DistributionItem.findByDistribution(distribution.id);
      }
      
      return distributions.map(distribution => new Distribution(distribution));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des distributions en attente: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT d.*, s.name as site_name, s.address as location
        FROM distributions d
        LEFT JOIN sites s ON d.site_id = s.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filtres
      if (filters.site_id) {
        sql += ' AND d.site_id = ?';
        params.push(filters.site_id);
      }
      
      if (filters.status) {
        sql += ' AND d.status = ?';
        params.push(filters.status);
      }
      
      if (filters.created_by) {
        sql += ' AND d.user_id = ?';
        params.push(filters.created_by);
      }
      
      if (filters.date_from) {
        sql += ' AND d.created_at >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND d.created_at <= ?';
        params.push(filters.date_to);
      }
      
      sql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const distributions = await query(sql, params);
      const result = [];
      
      // Pour chaque distribution, récupérer ses items
      for (const distribution of distributions) {
        const dist = new Distribution(distribution);
        const items = await DistributionItem.getByDistributionId(distribution.id);
        dist.items = items;
        result.push(dist);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des distributions: ${error.message}`);
    }
  }

  static async getDistributionSummary(site_id = null, date_from = null, date_to = null) {
    try {
      // Construire la condition WHERE pour la sous-requête et la requête principale
      let subQueryWhere = '';
      let mainQueryWhere = 'WHERE 1=1';
      const params = [];
      
      if (site_id) {
        subQueryWhere = 'WHERE d.site_id = ?';
        mainQueryWhere += ' AND site_id = ?';
        // Ajouter deux fois : une pour la sous-requête, une pour la requête principale
        params.push(site_id);
        params.push(site_id);
      }
      
      if (date_from) {
        subQueryWhere += subQueryWhere ? ' AND d.distribution_date >= ?' : 'WHERE d.distribution_date >= ?';
        mainQueryWhere += ' AND distribution_date >= ?';
        params.push(date_from);
        params.push(date_from);
      }
      
      if (date_to) {
        subQueryWhere += subQueryWhere ? ' AND d.distribution_date <= ?' : 'WHERE d.distribution_date <= ?';
        mainQueryWhere += ' AND distribution_date <= ?';
        params.push(date_to);
        params.push(date_to);
      }
      
      let sql = `
        SELECT 
          COUNT(*) as total_distributions,
          (SELECT COALESCE(SUM(di.quantity), 0) FROM distribution_items di 
           JOIN distributions d ON di.distribution_id = d.id 
           ${subQueryWhere}) as total_quantity,
          COUNT(CASE WHEN status = 'DISTRIBUTED' THEN 1 END) as distributed_count,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count
        FROM distributions
        ${mainQueryWhere}
      `;
      
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
      
      // Note: quantity n'est plus dans la table distributions, 
      // elle est gérée via distribution_items
      
      if (updateData.distribution_date !== undefined) {
        fields.push('distribution_date = ?');
        values.push(updateData.distribution_date);
      }
      
      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
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
      
      const sql = `UPDATE distributions SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.distribution_date !== undefined) this.distribution_date = updateData.distribution_date;
      if (updateData.status !== undefined) this.status = updateData.status;
      if (updateData.notes !== undefined) this.notes = updateData.notes;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la distribution: ${error.message}`);
    }
  }

  async markAsDistributed() {
    try {
      const sql = `
        UPDATE distributions 
        SET status = 'DISTRIBUTED', distribution_date = NOW(), updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'DISTRIBUTED';
      this.distribution_date = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la finalisation de la distribution: ${error.message}`);
    }
  }

  async cancel() {
    try {
      const sql = `
        UPDATE distributions 
        SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'CANCELLED';
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation de la distribution: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si la distribution peut être supprimée
      if (this.status === 'distributed') {
        throw new Error('Les distributions finalisées ne peuvent pas être supprimées');
      }
      
      // Supprimer d'abord les items de distribution
      await DistributionItem.deleteByDistributionId(this.id);
      
      // Puis supprimer la distribution
      const sql = 'DELETE FROM distributions WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la distribution: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      site_id: this.site_id,
      status: this.status,
      notes: this.notes,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
      items: this.items || []
    };
  }
}

module.exports = Distribution;
