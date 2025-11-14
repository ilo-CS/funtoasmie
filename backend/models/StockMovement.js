const { query } = require('../config/database');

class StockMovement {
  constructor(data) {
    this.id = data.id;
    this.medication_id = data.medication_id;
    this.movement_type = data.movement_type;
    this.quantity = data.quantity;
    this.reference_type = data.reference_type;
    this.reference_id = data.reference_id;
    this.site_id = data.site_id;
    this.from_site_id = data.from_site_id;
    this.to_site_id = data.to_site_id;
    this.user_id = data.user_id;
    this.notes = data.notes;
    this.created_at = data.created_at;
    
    // Données jointes (optionnelles)
    this.medication_name = data.medication_name;
    this.site_name = data.site_name;
    this.from_site_name = data.from_site_name;
    this.to_site_name = data.to_site_name;
    this.user_name = data.user_name;
  }

  static validateStockMovementData(movementData) {
    const errors = [];

    // Validation du médicament (obligatoire)
    if (!movementData.medication_id) {
      errors.push('L\'ID du médicament est obligatoire');
    }

    // Validation du type de mouvement
    const validMovementTypes = ['IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'];
    if (!movementData.movement_type || !validMovementTypes.includes(movementData.movement_type)) {
      errors.push('Le type de mouvement doit être IN, OUT, TRANSFER_IN, TRANSFER_OUT ou ADJUSTMENT');
    }

    // Validation de la quantité
    if (!movementData.quantity || movementData.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    // Validation du type de référence
    const validReferenceTypes = ['DISTRIBUTION', 'ORDER', 'ADJUSTMENT', 'TRANSFER', 'PRESCRIPTION'];
    if (!movementData.reference_type || !validReferenceTypes.includes(movementData.reference_type)) {
      errors.push('Le type de référence doit être DISTRIBUTION, ORDER, ADJUSTMENT, TRANSFER ou PRESCRIPTION');
    }

    // Validation de l'utilisateur
    if (!movementData.user_id) {
      errors.push('L\'ID de l\'utilisateur est obligatoire');
    }

    // Validation selon le type de mouvement
    if (movementData.movement_type === 'TRANSFER_IN' || movementData.movement_type === 'TRANSFER_OUT') {
      if (!movementData.from_site_id || !movementData.to_site_id) {
        errors.push('Les transferts nécessitent from_site_id et to_site_id');
      }
    }

    // Validation des notes (optionnelles)
    if (movementData.notes && movementData.notes.length > 500) {
      errors.push('Les notes ne peuvent pas dépasser 500 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(movementData, connection = null) {
    try {
      // Valider les données
      const validation = this.validateStockMovementData(movementData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const {
        medication_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        site_id,
        from_site_id,
        to_site_id,
        user_id,
        notes
      } = movementData;
      
      const sql = `
        INSERT INTO stock_movements (
          medication_id, movement_type, quantity, reference_type, reference_id,
          site_id, from_site_id, to_site_id, user_id, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const params = [
        medication_id,
        movement_type,
        quantity,
        reference_type,
        reference_id || null,
        site_id || null,
        from_site_id || null,
        to_site_id || null,
        user_id || null,
        notes ? notes.trim() : null
      ];
      
      let result;
      if (connection) {
        // Utiliser la connexion fournie (pour les transactions)
        result = await connection.execute(sql, params);
      } else {
        // Utiliser la connexion par défaut
        result = await query(sql, params);
      }
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du mouvement de stock: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT sm.*, 
               m.name as medication_name,
               s.name as site_name,
               fs.name as from_site_name,
               ts.name as to_site_name,
               CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM stock_movements sm
        LEFT JOIN medications m ON sm.medication_id = m.id
        LEFT JOIN sites s ON sm.site_id = s.id
        LEFT JOIN sites fs ON sm.from_site_id = fs.id
        LEFT JOIN sites ts ON sm.to_site_id = ts.id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.id = ?
      `;
      const movements = await query(sql, [id]);
      return movements.length > 0 ? new StockMovement(movements[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du mouvement: ${error.message}`);
    }
  }

  static async findByMedication(medication_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT sm.*, 
               m.name as medication_name,
               s.name as site_name,
               fs.name as from_site_name,
               ts.name as to_site_name,
               CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM stock_movements sm
        LEFT JOIN medications m ON sm.medication_id = m.id
        LEFT JOIN sites s ON sm.site_id = s.id
        LEFT JOIN sites fs ON sm.from_site_id = fs.id
        LEFT JOIN sites ts ON sm.to_site_id = ts.id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.medication_id = ?
        ORDER BY sm.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const movements = await query(sql, [medication_id, limit, offset]);
      return movements.map(movement => new StockMovement(movement));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des mouvements du médicament: ${error.message}`);
    }
  }

  static async findBySite(site_id, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT sm.*, 
               m.name as medication_name,
               s.name as site_name,
               fs.name as from_site_name,
               ts.name as to_site_name,
               CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM stock_movements sm
        LEFT JOIN medications m ON sm.medication_id = m.id
        LEFT JOIN sites s ON sm.site_id = s.id
        LEFT JOIN sites fs ON sm.from_site_id = fs.id
        LEFT JOIN sites ts ON sm.to_site_id = ts.id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.site_id = ? OR sm.from_site_id = ? OR sm.to_site_id = ?
        ORDER BY sm.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const movements = await query(sql, [site_id, site_id, site_id, limit, offset]);
      return movements.map(movement => new StockMovement(movement));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des mouvements du site: ${error.message}`);
    }
  }

  static async findByReference(reference_type, reference_id) {
    try {
      const sql = `
        SELECT sm.*, 
               m.name as medication_name,
               s.name as site_name,
               fs.name as from_site_name,
               ts.name as to_site_name,
               CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM stock_movements sm
        LEFT JOIN medications m ON sm.medication_id = m.id
        LEFT JOIN sites s ON sm.site_id = s.id
        LEFT JOIN sites fs ON sm.from_site_id = fs.id
        LEFT JOIN sites ts ON sm.to_site_id = ts.id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.reference_type = ? AND sm.reference_id = ?
        ORDER BY sm.created_at ASC
      `;
      const movements = await query(sql, [reference_type, reference_id]);
      return movements.map(movement => new StockMovement(movement));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des mouvements par référence: ${error.message}`);
    }
  }

  static async findAll(filters = {}) {
    try {
      let sql = `
        SELECT sm.*, 
               m.name as medication_name,
               s.name as site_name,
               fs.name as from_site_name,
               ts.name as to_site_name,
               CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM stock_movements sm
        LEFT JOIN medications m ON sm.medication_id = m.id
        LEFT JOIN sites s ON sm.site_id = s.id
        LEFT JOIN sites fs ON sm.from_site_id = fs.id
        LEFT JOIN sites ts ON sm.to_site_id = ts.id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.medication_id) {
        sql += ' AND sm.medication_id = ?';
        params.push(filters.medication_id);
      }

      if (filters.site_id) {
        sql += ' AND (sm.site_id = ? OR sm.from_site_id = ? OR sm.to_site_id = ?)';
        params.push(filters.site_id, filters.site_id, filters.site_id);
      }

      if (filters.movement_type) {
        sql += ' AND sm.movement_type = ?';
        params.push(filters.movement_type);
      }

      if (filters.reference_type) {
        sql += ' AND sm.reference_type = ?';
        params.push(filters.reference_type);
      }

      if (filters.user_id) {
        sql += ' AND sm.user_id = ?';
        params.push(filters.user_id);
      }

      if (filters.date_from) {
        sql += ' AND sm.created_at >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += ' AND sm.created_at <= ?';
        params.push(filters.date_to);
      }

      sql += ' ORDER BY sm.created_at DESC';

      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }

      const movements = await query(sql, params);
      return movements.map(movement => new StockMovement(movement));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des mouvements: ${error.message}`);
    }
  }

  static async getRecentMovements(limit = 10) {
    try {
      const sql = `
        SELECT sm.*, 
               m.name as medication_name,
               s.name as site_name,
               fs.name as from_site_name,
               ts.name as to_site_name,
               CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM stock_movements sm
        LEFT JOIN medications m ON sm.medication_id = m.id
        LEFT JOIN sites s ON sm.site_id = s.id
        LEFT JOIN sites fs ON sm.from_site_id = fs.id
        LEFT JOIN sites ts ON sm.to_site_id = ts.id
        LEFT JOIN users u ON sm.user_id = u.id
        ORDER BY sm.created_at DESC
        LIMIT ?
      `;
      const movements = await query(sql, [limit]);
      return movements.map(movement => new StockMovement(movement));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des mouvements récents: ${error.message}`);
    }
  }

  static async getMovementSummary(medication_id = null, site_id = null, date_from = null, date_to = null) {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total_movements,
          SUM(CASE WHEN movement_type IN ('IN', 'TRANSFER_IN') THEN quantity ELSE 0 END) as total_in,
          SUM(CASE WHEN movement_type IN ('OUT', 'TRANSFER_OUT') THEN quantity ELSE 0 END) as total_out,
          COUNT(CASE WHEN movement_type = 'IN' THEN 1 END) as in_count,
          COUNT(CASE WHEN movement_type = 'OUT' THEN 1 END) as out_count,
          COUNT(CASE WHEN movement_type = 'TRANSFER_IN' THEN 1 END) as transfer_in_count,
          COUNT(CASE WHEN movement_type = 'TRANSFER_OUT' THEN 1 END) as transfer_out_count,
          COUNT(CASE WHEN movement_type = 'ADJUSTMENT' THEN 1 END) as adjustment_count
        FROM stock_movements
        WHERE 1=1
      `;
      const params = [];

      if (medication_id) {
        sql += ' AND medication_id = ?';
        params.push(medication_id);
      }

      if (site_id) {
        sql += ' AND (site_id = ? OR from_site_id = ? OR to_site_id = ?)';
        params.push(site_id, site_id, site_id);
      }

      if (date_from) {
        sql += ' AND created_at >= ?';
        params.push(date_from);
      }

      if (date_to) {
        sql += ' AND created_at <= ?';
        params.push(date_to);
      }

      const summary = await query(sql, params);
      return summary[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du résumé: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      medication_id: this.medication_id,
      movement_type: this.movement_type,
      quantity: this.quantity,
      reference_type: this.reference_type,
      reference_id: this.reference_id,
      site_id: this.site_id,
      from_site_id: this.from_site_id,
      to_site_id: this.to_site_id,
      user_id: this.user_id,
      notes: this.notes,
      created_at: this.created_at,
      medication_name: this.medication_name,
      site_name: this.site_name,
      from_site_name: this.from_site_name,
      to_site_name: this.to_site_name,
      user_name: this.user_name
    };
  }
}

module.exports = StockMovement;