const { query } = require('../config/database');

class Supplier {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.contact_person = data.contact_person;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.rating = data.rating;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateSupplierData(supplierData) {
    const errors = [];

    // Validation du nom (obligatoire)
    if (!supplierData.name || supplierData.name.trim().length < 2) {
      errors.push('Le nom du fournisseur doit contenir au moins 2 caractères');
    }
    if (supplierData.name && supplierData.name.length > 100) {
      errors.push('Le nom du fournisseur ne peut pas dépasser 100 caractères');
    }

    // Validation de l'email (optionnel)
    if (supplierData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supplierData.email)) {
        errors.push('Format d\'email invalide');
      }
      if (supplierData.email.length > 100) {
        errors.push('L\'email ne peut pas dépasser 100 caractères');
      }
    }

    // Validation du téléphone (optionnel)
    if (supplierData.phone && supplierData.phone.length > 20) {
      errors.push('Le téléphone ne peut pas dépasser 20 caractères');
    }

    // Validation de l'adresse (optionnelle)
    if (supplierData.address && supplierData.address.length > 255) {
      errors.push('L\'adresse ne peut pas dépasser 255 caractères');
    }

    // Validation du rating (optionnel)
    if (supplierData.rating !== undefined && supplierData.rating !== null) {
      if (supplierData.rating < 0 || supplierData.rating > 5) {
        errors.push('Le rating doit être entre 0 et 5');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(supplierData) {
    try {
      // Valider les données
      const validation = this.validateSupplierData(supplierData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { name, contact_person, email, phone, address, rating } = supplierData;
      
      // Vérifier si le fournisseur existe déjà
      const existingSupplier = await this.findByName(name);
      if (existingSupplier) {
        throw new Error('Ce fournisseur existe déjà');
      }
      
      const sql = `
        INSERT INTO suppliers (name, contact_person, email, phone, address, rating, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        name.trim(),
        contact_person ? contact_person.trim() : null,
        email ? email.toLowerCase().trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        rating || null
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du fournisseur: ${error.message}`);
    }
  }

  static async findByName(name) {
    try {
      const sql = 'SELECT * FROM suppliers WHERE name = ?';
      const suppliers = await query(sql, [name]);
      return suppliers.length > 0 ? new Supplier(suppliers[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du fournisseur: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM suppliers WHERE id = ?';
      const suppliers = await query(sql, [id]);
      return suppliers.length > 0 ? new Supplier(suppliers[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du fournisseur: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, activeOnly = true) {
    try {
      let sql = 'SELECT * FROM suppliers';
      const params = [];
      
      if (activeOnly) {
        sql += ' WHERE is_active = 1';
      }
      
      sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const suppliers = await query(sql, params);
      return suppliers.map(supplier => new Supplier(supplier));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des fournisseurs: ${error.message}`);
    }
  }

  static async findActive() {
    try {
      const sql = 'SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name ASC';
      const suppliers = await query(sql);
      return suppliers.map(supplier => new Supplier(supplier));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des fournisseurs actifs: ${error.message}`);
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
      
      if (updateData.contact_person !== undefined) {
        fields.push('contact_person = ?');
        values.push(updateData.contact_person ? updateData.contact_person.trim() : null);
      }
      
      if (updateData.email !== undefined) {
        fields.push('email = ?');
        values.push(updateData.email ? updateData.email.toLowerCase().trim() : null);
      }
      
      if (updateData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(updateData.phone ? updateData.phone.trim() : null);
      }
      
      if (updateData.address !== undefined) {
        fields.push('address = ?');
        values.push(updateData.address ? updateData.address.trim() : null);
      }
      
      if (updateData.rating !== undefined) {
        fields.push('rating = ?');
        values.push(updateData.rating);
      }
      
      if (updateData.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(updateData.is_active ? 1 : 0);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(this.id);
      
      const sql = `UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.name !== undefined) this.name = updateData.name;
      if (updateData.contact_person !== undefined) this.contact_person = updateData.contact_person;
      if (updateData.email !== undefined) this.email = updateData.email;
      if (updateData.phone !== undefined) this.phone = updateData.phone;
      if (updateData.address !== undefined) this.address = updateData.address;
      if (updateData.rating !== undefined) this.rating = updateData.rating;
      if (updateData.is_active !== undefined) this.is_active = updateData.is_active;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du fournisseur: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si le fournisseur est utilisé par des médicaments
      const medicationSql = 'SELECT COUNT(*) as count FROM medications WHERE supplier_id = ?';
      const medicationResult = await query(medicationSql, [this.id]);
      
      if (medicationResult[0].count > 0) {
        throw new Error('Ce fournisseur est utilisé par des médicaments et ne peut pas être supprimé');
      }
      
      // Vérifier les commandes (si la table orders existe)
      try {
        const orderSql = 'SELECT COUNT(*) as count FROM orders WHERE supplier_id = ?';
        const orderResult = await query(orderSql, [this.id]);
        
        if (orderResult[0].count > 0) {
          throw new Error('Ce fournisseur a des commandes et ne peut pas être supprimé');
        }
      } catch (orderError) {
        // Si la table orders n'existe pas encore, on ignore cette vérification
      }
      
      // Supprimer le fournisseur
      const deleteSql = 'DELETE FROM suppliers WHERE id = ?';
      await query(deleteSql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du fournisseur: ${error.message}`);
    }
  }

  async toggleStatus() {
    try {
      const newStatus = !this.is_active;
      const sql = 'UPDATE suppliers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [newStatus ? 1 : 0, this.id]);
      this.is_active = newStatus;
      return true;
    } catch (error) {
      throw new Error(`Erreur lors du changement de statut du fournisseur: ${error.message}`);
    }
  }

  async deactivate() {
    try {
      const sql = 'UPDATE suppliers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [this.id]);
      this.is_active = false;
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la désactivation du fournisseur: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      contact_person: this.contact_person,
      email: this.email,
      phone: this.phone,
      address: this.address,
      rating: this.rating,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Supplier;
