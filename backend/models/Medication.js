const { query } = require('../config/database');

class Medication {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.quantity = data.quantity;
    this.min_stock = data.min_stock;
    this.unit_name = data.unit_name;
    this.category_id = data.category_id;
    this.category_name = data.category_name;
    this.category_color = data.category_color;
    this.price = data.price;
    this.supplier = data.supplier;
    this.status = data.status || 'ACTIVE';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateMedicationData(medicationData) {
    const errors = [];

    // Validation du nom (obligatoire)
    if (!medicationData.name || medicationData.name.trim().length < 2) {
      errors.push('Le nom du médicament doit contenir au moins 2 caractères');
    }
    if (medicationData.name && medicationData.name.length > 100) {
      errors.push('Le nom du médicament ne peut pas dépasser 100 caractères');
    }

    // Validation de la description (optionnelle)
    if (medicationData.description && medicationData.description.length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }

    // Validation de la catégorie (obligatoire)
    if (!medicationData.category_id) {
      errors.push('La catégorie est obligatoire');
    }

    // Validation de l'unité (obligatoire)
    if (!medicationData.unit_name || medicationData.unit_name.trim().length < 1) {
      errors.push('L\'unité est obligatoire');
    }
    if (medicationData.unit_name && medicationData.unit_name.length > 50) {
      errors.push('L\'unité ne peut pas dépasser 50 caractères');
    }

    // Validation des quantités
    if (medicationData.min_stock !== undefined && medicationData.min_stock < 0) {
      errors.push('Le stock minimum ne peut pas être négatif');
    }
    if (medicationData.min_stock !== undefined && medicationData.min_stock > 10000) {
      errors.push('Le stock minimum ne peut pas dépasser 10000');
    }

    if (medicationData.quantity !== undefined && medicationData.quantity < 0) {
      errors.push('La quantité ne peut pas être négative');
    }
    if (medicationData.quantity !== undefined && medicationData.quantity > 100000) {
      errors.push('La quantité ne peut pas dépasser 100000');
    }

    // Validation du prix
    if (medicationData.price !== undefined && medicationData.price < 0) {
      errors.push('Le prix ne peut pas être négatif');
    }
    if (medicationData.price !== undefined && medicationData.price > 1000000) {
      errors.push('Le prix ne peut pas dépasser 1,000,000 Ar');
    }

    // Validation du fournisseur
    if (medicationData.supplier && medicationData.supplier.length > 100) {
      errors.push('Le nom du fournisseur ne peut pas dépasser 100 caractères');
    }

    // Validation du statut
    if (medicationData.status && !['ACTIVE', 'INACTIVE', 'DISCONTINUED'].includes(medicationData.status)) {
      errors.push('Le statut doit être ACTIVE, INACTIVE ou DISCONTINUED');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(medicationData) {
    try {
      // Valider les données
      const validation = this.validateMedicationData(medicationData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { 
        name, description, quantity, min_stock, unit_name,
        category_id, price, supplier, status 
      } = medicationData;
      
      // Vérifier si le médicament existe déjà
      const existingMedication = await this.findByName(name);
      if (existingMedication) {
        throw new Error('Ce médicament existe déjà');
      }
      
      // Récupérer le nom de la catégorie
      let category_name = null;
      if (category_id) {
        const categoryResult = await query(
          'SELECT name FROM medication_categories WHERE id = ?',
          [category_id]
        );
        if (categoryResult.length > 0) {
          category_name = categoryResult[0].name;
        }
      }
      
      const sql = `
        INSERT INTO medications (
          name, description, quantity, min_stock, unit_name,
          category_id, category_name, price, supplier, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        name.trim(),
        description ? description.trim() : null,
        quantity || 0,
        min_stock || 10,
        unit_name || 'unités',
        category_id,
        category_name,
        price || null,
        supplier ? supplier.trim() : null,
        status || 'ACTIVE'
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du médicament: ${error.message}`);
    }
  }

  static async findByName(name) {
    try {
      const sql = 'SELECT * FROM medications WHERE name = ?';
      const medications = await query(sql, [name]);
      return medications.length > 0 ? new Medication(medications[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du médicament: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM medications WHERE id = ?';
      const medications = await query(sql, [id]);
      return medications.length > 0 ? new Medication(medications[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du médicament: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT m.*, mc.name as category_name, mc.color as category_color
        FROM medications m
        LEFT JOIN medication_categories mc ON m.category_id = mc.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filtres
      if (filters.search) {
        sql += ' AND (m.name LIKE ? OR m.description LIKE ? OR m.supplier LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (filters.category_id) {
        sql += ' AND m.category_id = ?';
        params.push(filters.category_id);
      }
      
      if (filters.supplier) {
        sql += ' AND m.supplier LIKE ?';
        params.push(`%${filters.supplier}%`);
      }
      
      if (filters.status) {
        sql += ' AND m.status = ?';
        params.push(filters.status);
      }
      
      if (filters.low_stock === 'true') {
        sql += ' AND m.quantity <= m.min_stock';
      }
      
      if (filters.out_of_stock === 'true') {
        sql += ' AND m.quantity = 0';
      }
      
      sql += ' ORDER BY m.name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const medications = await query(sql, params);
      return medications;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des médicaments: ${error.message}`);
    }
  }

  static async findLowStock() {
    try {
      const sql = `
        SELECT m.*, mc.name as category_name, mc.color as category_color
        FROM medications m
        LEFT JOIN medication_categories mc ON m.category_id = mc.id
        WHERE m.quantity <= m.min_stock
        ORDER BY (m.quantity - m.min_stock) ASC
      `;
      const medications = await query(sql);
      return medications;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des médicaments en rupture: ${error.message}`);
    }
  }

  static async findExpired() {
    try {
      // Cette fonction n'est plus nécessaire car nous n'avons plus de dates d'expiration
      return [];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des médicaments expirés: ${error.message}`);
    }
  }

  static async findByStatus(status) {
    try {
      const sql = `
        SELECT m.*, mc.name as category_name, mc.color as category_color
        FROM medications m
        LEFT JOIN medication_categories mc ON m.category_id = mc.id
        WHERE m.status = ?
        ORDER BY m.name ASC
      `;
      const medications = await query(sql, [status]);
      return medications;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des médicaments par statut: ${error.message}`);
    }
  }

  static async findOutOfStock() {
    try {
      const sql = `
        SELECT m.*, mc.name as category_name, mc.color as category_color
        FROM medications m
        LEFT JOIN medication_categories mc ON m.category_id = mc.id
        WHERE m.quantity = 0 AND m.status = 'ACTIVE'
        ORDER BY m.name ASC
      `;
      const medications = await query(sql);
      return medications;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des médicaments en rupture: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name.trim());
      }
      
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description ? updateData.description.trim() : null);
      }
      
      if (updateData.category_id !== undefined) {
        fields.push('category_id = ?');
        values.push(updateData.category_id);
        
        // Récupérer le nom de la nouvelle catégorie
        try {
          const categoryResult = await query(
            'SELECT name FROM medication_categories WHERE id = ?',
            [updateData.category_id]
          );
          if (categoryResult.length > 0) {
            fields.push('category_name = ?');
            values.push(categoryResult[0].name);
          }
        } catch (error) {
          console.warn('Impossible de récupérer le nom de la catégorie:', error.message);
        }
      }
      
      if (updateData.unit_name !== undefined) {
        fields.push('unit_name = ?');
        values.push(updateData.unit_name);
      }
      
      if (updateData.min_stock !== undefined) {
        fields.push('min_stock = ?');
        values.push(updateData.min_stock);
      }
      
      if (updateData.quantity !== undefined) {
        fields.push('quantity = ?');
        values.push(updateData.quantity);
      }
      
      if (updateData.price !== undefined) {
        fields.push('price = ?');
        values.push(updateData.price);
      }
      
      if (updateData.supplier !== undefined) {
        fields.push('supplier = ?');
        values.push(updateData.supplier);
      }
      
      
      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      
      if (updateData.supplier_id !== undefined) {
        fields.push('supplier_id = ?');
        values.push(updateData.supplier_id);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(this.id);
      
      const sql = `UPDATE medications SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          this[key] = updateData[key];
        }
      });
      
      // Mettre à jour les timestamps
      this.updated_at = new Date();
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du médicament: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si le médicament est utilisé dans des mouvements ou distributions
      const sql = 'SELECT COUNT(*) as count FROM stock_movements WHERE medication_id = ?';
      const result = await query(sql, [this.id]);
      
      if (result[0].count > 0) {
        throw new Error('Ce médicament a des mouvements de stock et ne peut pas être supprimé');
      }
      
      const deleteSql = 'DELETE FROM medications WHERE id = ?';
      await query(deleteSql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du médicament: ${error.message}`);
    }
  }

  async updateQuantity(newQuantity, reason = 'Ajustement manuel', userId = null) {
    try {
      const oldQuantity = this.quantity;
      
      // Validation de la nouvelle quantité
      if (newQuantity < 0) {
        throw new Error('La quantité ne peut pas être négative');
      }
      
      if (newQuantity > 100000) {
        throw new Error('La quantité ne peut pas dépasser 100,000 unités');
      }
      
      // Validation de la raison
      if (!reason || reason.trim().length < 5) {
        throw new Error('La raison doit contenir au moins 5 caractères');
      }
      
      // Contrôles de sécurité pour les changements importants
      const difference = Math.abs(newQuantity - oldQuantity);
      const percentage = oldQuantity > 0 ? (difference / oldQuantity) * 100 : 100;
      
      // Alerte pour changement > 50%
      if (percentage > 50) {
        console.warn(`SECURITY_ALERT: Critical quantity change for medication ${this.id} - ${oldQuantity} -> ${newQuantity} (${percentage.toFixed(1)}%)`);
      }
      
      // Mettre à jour la quantité
      const sql = 'UPDATE medications SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [newQuantity, this.id]);
      
      // Enregistrer le mouvement (si la table stock_movements existe)
      try {
        const movementSql = `
          INSERT INTO stock_movements (medication_id, movement_type, quantity, previous_quantity, new_quantity, reason, user_id, created_at)
          VALUES (?, 'ADJUSTMENT', ?, ?, ?, ?, ?, NOW())
        `;
        await query(movementSql, [this.id, Math.abs(newQuantity - oldQuantity), oldQuantity, newQuantity, reason, userId]);
      } catch (movementError) {
        // Si la table stock_movements n'existe pas, on continue sans erreur
      }
      
      // Mettre à jour l'instance
      this.quantity = newQuantity;
      this.updated_at = new Date();
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la quantité: ${error.message}`);
    }
  }

  static async deactivate(id) {
    try {
      const sql = 'UPDATE medications SET status = ?, updated_at = NOW() WHERE id = ?';
      const result = await query(sql, ['INACTIVE', id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Médicament non trouvé');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la désactivation: ${error.message}`);
    }
  }

  static async reactivate(id) {
    try {
      const sql = 'UPDATE medications SET status = ?, updated_at = NOW() WHERE id = ?';
      const result = await query(sql, ['ACTIVE', id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Médicament non trouvé');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la réactivation: ${error.message}`);
    }
  }

  static async discontinue(id) {
    try {
      const sql = 'UPDATE medications SET status = ?, updated_at = NOW() WHERE id = ?';
      const result = await query(sql, ['DISCONTINUED', id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Médicament non trouvé');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de l\'arrêt définitif: ${error.message}`);
    }
  }

  static async getStatistics() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_medications,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_medications,
          SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive_medications,
          SUM(CASE WHEN status = 'DISCONTINUED' THEN 1 ELSE 0 END) as discontinued_medications,
          SUM(CASE WHEN quantity = 0 AND status = 'ACTIVE' THEN 1 ELSE 0 END) as out_of_stock,
          SUM(CASE WHEN quantity <= min_stock AND status = 'ACTIVE' THEN 1 ELSE 0 END) as low_stock,
          SUM(CASE WHEN price IS NOT NULL THEN price * quantity ELSE 0 END) as total_value
        FROM medications
      `;
      const result = await query(sql);
      return result[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      quantity: this.quantity,
      min_stock: this.min_stock,
      unit_name: this.unit_name,
      category_id: this.category_id,
      category_name: this.category_name,
      category_color: this.category_color,
      price: this.price,
      supplier: this.supplier,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Medication;
