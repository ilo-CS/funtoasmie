const { query } = require('../config/database');

class Site {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.address = data.address;
    this.contact_person = data.contact_person;
    this.phone = data.phone;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateSiteData(siteData) {
    const errors = [];

    // Validation du nom (obligatoire)
    if (!siteData.name || siteData.name.trim().length < 2) {
      errors.push('Le nom du site doit contenir au moins 2 caractères');
    }
    if (siteData.name && siteData.name.length > 100) {
      errors.push('Le nom du site ne peut pas dépasser 100 caractères');
    }

    // Validation de l'adresse (optionnelle)
    if (siteData.address && siteData.address.length > 255) {
      errors.push('L\'adresse ne peut pas dépasser 255 caractères');
    }

    // Validation du contact (optionnel)
    if (siteData.contact_person && siteData.contact_person.length > 100) {
      errors.push('Le nom du contact ne peut pas dépasser 100 caractères');
    }

    // Validation du téléphone (optionnel)
    if (siteData.phone && siteData.phone.length > 20) {
      errors.push('Le téléphone ne peut pas dépasser 20 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(siteData) {
    try {
      // Valider les données
      const validation = this.validateSiteData(siteData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { name, address, contact_person, phone } = siteData;
      
      // Vérifier si le site existe déjà
      const existingSite = await this.findByName(name);
      if (existingSite) {
        throw new Error('Ce site existe déjà');
      }
      
      const sql = `
        INSERT INTO sites (name, address, contact_person, phone, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        name.trim(),
        address ? address.trim() : null,
        contact_person ? contact_person.trim() : null,
        phone ? phone.trim() : null
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du site: ${error.message}`);
    }
  }

  static async findByName(name) {
    try {
      const sql = 'SELECT * FROM sites WHERE name = ?';
      const sites = await query(sql, [name]);
      return sites.length > 0 ? new Site(sites[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du site: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM sites WHERE id = ?';
      const sites = await query(sql, [id]);
      return sites.length > 0 ? new Site(sites[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du site: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, activeOnly = true) {
    try {
      let sql = 'SELECT * FROM sites';
      const params = [];
      
      if (activeOnly) {
        sql += ' WHERE is_active = 1';
      }
      
      sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const sites = await query(sql, params);
      return sites.map(site => new Site(site));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des sites: ${error.message}`);
    }
  }

  static async findActive() {
    try {
      const sql = 'SELECT * FROM sites WHERE is_active = 1 ORDER BY name ASC';
      const sites = await query(sql);
      return sites.map(site => new Site(site));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des sites actifs: ${error.message}`);
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
      
      if (updateData.address !== undefined) {
        fields.push('address = ?');
        values.push(updateData.address ? updateData.address.trim() : null);
      }
      
      if (updateData.contact_person !== undefined) {
        fields.push('contact_person = ?');
        values.push(updateData.contact_person ? updateData.contact_person.trim() : null);
      }
      
      if (updateData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(updateData.phone ? updateData.phone.trim() : null);
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
      
      const sql = `UPDATE sites SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.name !== undefined) this.name = updateData.name;
      if (updateData.address !== undefined) this.address = updateData.address;
      if (updateData.contact_person !== undefined) this.contact_person = updateData.contact_person;
      if (updateData.phone !== undefined) this.phone = updateData.phone;
      if (updateData.is_active !== undefined) this.is_active = updateData.is_active;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du site: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si les tables existent avant de faire les vérifications
      try {
        const distributionSql = 'SELECT COUNT(*) as count FROM distributions WHERE site_id = ?';
        const distributionResult = await query(distributionSql, [this.id]);
        
        if (distributionResult[0].count > 0) {
          throw new Error('Ce site a des distributions et ne peut pas être supprimé');
        }
      } catch (tableError) {
        // Table distributions n'existe pas encore, on ignore cette vérification
      }
      
      try {
        const requestSql = 'SELECT COUNT(*) as count FROM site_requests WHERE site_id = ?';
        const requestResult = await query(requestSql, [this.id]);
        
        if (requestResult[0].count > 0) {
          throw new Error('Ce site a des demandes et ne peut pas être supprimé');
        }
      } catch (tableError) {
        // Table site_requests n'existe pas encore, on ignore cette vérification
      }
      
      const deleteSql = 'DELETE FROM sites WHERE id = ?';
      await query(deleteSql, [this.id]);
      return true;
    } catch (error) {
      console.error('❌ Erreur dans la méthode delete du modèle Site:', error);
      throw new Error(`Erreur lors de la suppression du site: ${error.message}`);
    }
  }

  async deactivate() {
    try {
      const sql = 'UPDATE sites SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [this.id]);
      this.is_active = false;
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la désactivation du site: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      contact_person: this.contact_person,
      phone: this.phone,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Site;
