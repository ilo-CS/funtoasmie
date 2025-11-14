const { query } = require('../config/database');

class SiteRequest {
  constructor(data) {
    this.id = data.id;
    this.site_id = data.site_id;
    this.medication_id = data.medication_id;
    this.requested_quantity = data.requested_quantity;
    this.status = data.status;
    this.user_id = data.user_id;
    this.request_date = data.request_date;
    this.response_date = data.response_date;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateRequestData(requestData) {
    const errors = [];

    // Validation du site (obligatoire)
    if (!requestData.site_id) {
      errors.push('Le site est obligatoire');
    }

    // Validation du médicament (obligatoire)
    if (!requestData.medication_id) {
      errors.push('Le médicament est obligatoire');
    }

    // Validation de la quantité demandée (obligatoire)
    if (!requestData.requested_quantity || requestData.requested_quantity <= 0) {
      errors.push('La quantité demandée doit être supérieure à 0');
    }

    // Validation du statut
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (requestData.status && !validStatuses.includes(requestData.status)) {
      errors.push('Le statut doit être PENDING, APPROVED ou REJECTED');
    }

    // Validation des notes (optionnelles)
    if (requestData.notes && requestData.notes.length > 500) {
      errors.push('Les notes ne peuvent pas dépasser 500 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(requestData) {
    try {
      // Valider les données
      const validation = this.validateRequestData(requestData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { site_id, medication_id, requested_quantity, user_id, notes } = requestData;
      
      const sql = `
        INSERT INTO site_requests (
          site_id, medication_id, requested_quantity, status, user_id, 
          request_date, notes, created_at, updated_at
        ) VALUES (?, ?, ?, 'PENDING', ?, NOW(), ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        site_id,
        medication_id,
        requested_quantity,
        user_id,
        notes ? notes.trim() : null
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la demande: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT sr.*, s.name as site_name, m.name as medication_name, 
               u.first_name, u.last_name
        FROM site_requests sr
        LEFT JOIN sites s ON sr.site_id = s.id
        LEFT JOIN medications m ON sr.medication_id = m.id
        LEFT JOIN users u ON sr.user_id = u.id
        WHERE sr.id = ?
      `;
      const requests = await query(sql, [id]);
      return requests.length > 0 ? new SiteRequest(requests[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de la demande: ${error.message}`);
    }
  }

  static async findBySite(site_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT sr.*, s.name as site_name, m.name as medication_name, 
               u.first_name, u.last_name
        FROM site_requests sr
        LEFT JOIN sites s ON sr.site_id = s.id
        LEFT JOIN medications m ON sr.medication_id = m.id
        LEFT JOIN users u ON sr.user_id = u.id
        WHERE sr.site_id = ?
        ORDER BY sr.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const requests = await query(sql, [site_id, limit, offset]);
      return requests.map(request => new SiteRequest(request));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des demandes: ${error.message}`);
    }
  }

  static async findPending() {
    try {
      const sql = `
        SELECT sr.*, s.name as site_name, m.name as medication_name, 
               u.first_name, u.last_name
        FROM site_requests sr
        LEFT JOIN sites s ON sr.site_id = s.id
        LEFT JOIN medications m ON sr.medication_id = m.id
        LEFT JOIN users u ON sr.user_id = u.id
        WHERE sr.status = 'PENDING'
        ORDER BY sr.created_at ASC
      `;
      const requests = await query(sql);
      return requests.map(request => new SiteRequest(request));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des demandes en attente: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT sr.*, s.name as site_name, m.name as medication_name, 
               u.first_name, u.last_name
        FROM site_requests sr
        LEFT JOIN sites s ON sr.site_id = s.id
        LEFT JOIN medications m ON sr.medication_id = m.id
        LEFT JOIN users u ON sr.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filtres
      if (filters.site_id) {
        sql += ' AND sr.site_id = ?';
        params.push(filters.site_id);
      }
      
      if (filters.medication_id) {
        sql += ' AND sr.medication_id = ?';
        params.push(filters.medication_id);
      }
      
      if (filters.status) {
        sql += ' AND sr.status = ?';
        params.push(filters.status);
      }
      
      if (filters.user_id) {
        sql += ' AND sr.user_id = ?';
        params.push(filters.user_id);
      }
      
      if (filters.date_from) {
        sql += ' AND sr.request_date >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND sr.request_date <= ?';
        params.push(filters.date_to);
      }
      
      sql += ' ORDER BY sr.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const requests = await query(sql, params);
      return requests.map(request => new SiteRequest(request));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des demandes: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.requested_quantity !== undefined) {
        fields.push('requested_quantity = ?');
        values.push(updateData.requested_quantity);
      }
      
      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
        
        // Mettre à jour la date de réponse si le statut change
        if (updateData.status !== 'PENDING') {
          fields.push('response_date = NOW()');
        }
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
      
      const sql = `UPDATE site_requests SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.requested_quantity !== undefined) this.requested_quantity = updateData.requested_quantity;
      if (updateData.status !== undefined) this.status = updateData.status;
      if (updateData.notes !== undefined) this.notes = updateData.notes;
      if (updateData.status !== undefined && updateData.status !== 'PENDING') {
        this.response_date = new Date();
      }
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la demande: ${error.message}`);
    }
  }

  async approve(approvedBy) {
    try {
      const sql = `
        UPDATE site_requests 
        SET status = 'APPROVED', response_date = NOW(), updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'APPROVED';
      this.response_date = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de l'approbation de la demande: ${error.message}`);
    }
  }

  async reject(notes = null) {
    try {
      const sql = `
        UPDATE site_requests 
        SET status = 'REJECTED', response_date = NOW(), 
            notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      await query(sql, [notes, this.id]);
      
      this.status = 'REJECTED';
      this.response_date = new Date();
      if (notes) this.notes = notes;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors du rejet de la demande: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si la demande peut être supprimée
      if (this.status !== 'PENDING') {
        throw new Error('Seules les demandes en attente peuvent être supprimées');
      }
      
      const sql = 'DELETE FROM site_requests WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la demande: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      site_id: this.site_id,
      medication_id: this.medication_id,
      requested_quantity: this.requested_quantity,
      status: this.status,
      user_id: this.user_id,
      request_date: this.request_date,
      response_date: this.response_date,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = SiteRequest;
