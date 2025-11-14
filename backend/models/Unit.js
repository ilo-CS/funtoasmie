const { query } = require('../config/database');

class Unit {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.abbreviation = data.abbreviation;
    this.type = data.type;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateUnitData(unitData) {
    const errors = [];

    // Validation du nom (obligatoire)
    if (!unitData.name || unitData.name.trim().length < 2) {
      errors.push('Le nom de l\'unité doit contenir au moins 2 caractères');
    }
    if (unitData.name && unitData.name.length > 50) {
      errors.push('Le nom de l\'unité ne peut pas dépasser 50 caractères');
    }

    // Validation de l'abréviation (obligatoire)
    if (!unitData.abbreviation || unitData.abbreviation.trim().length < 1) {
      errors.push('L\'abréviation de l\'unité est obligatoire');
    }
    if (unitData.abbreviation && unitData.abbreviation.length > 10) {
      errors.push('L\'abréviation ne peut pas dépasser 10 caractères');
    }

    // Validation du type (obligatoire)
    const validTypes = ['WEIGHT', 'VOLUME', 'COUNT'];
    if (!unitData.type || !validTypes.includes(unitData.type)) {
      errors.push('Le type d\'unité doit être WEIGHT, VOLUME ou COUNT');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(unitData) {
    try {
      // Valider les données
      const validation = this.validateUnitData(unitData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { name, abbreviation, type } = unitData;
      
      // Vérifier si l'unité existe déjà
      const existingUnit = await this.findByAbbreviation(abbreviation);
      if (existingUnit) {
        throw new Error('Cette unité existe déjà');
      }
      
      const sql = `
        INSERT INTO units (name, abbreviation, type, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        name.trim(),
        abbreviation.trim().toUpperCase(),
        type
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'unité: ${error.message}`);
    }
  }

  static async findByAbbreviation(abbreviation) {
    try {
      const sql = 'SELECT * FROM units WHERE abbreviation = ?';
      const units = await query(sql, [abbreviation.toUpperCase()]);
      return units.length > 0 ? new Unit(units[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'unité: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM units WHERE id = ?';
      const units = await query(sql, [id]);
      return units.length > 0 ? new Unit(units[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'unité: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT * FROM units 
        ORDER BY type, name ASC
        LIMIT ? OFFSET ?
      `;
      const units = await query(sql, [limit, offset]);
      return units.map(unit => new Unit(unit));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des unités: ${error.message}`);
    }
  }

  static async findByType(type) {
    try {
      const sql = 'SELECT * FROM units WHERE type = ? ORDER BY name ASC';
      const units = await query(sql, [type]);
      return units.map(unit => new Unit(unit));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des unités par type: ${error.message}`);
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
      
      if (updateData.abbreviation !== undefined) {
        fields.push('abbreviation = ?');
        values.push(updateData.abbreviation.trim().toUpperCase());
      }
      
      if (updateData.type !== undefined) {
        fields.push('type = ?');
        values.push(updateData.type);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(this.id);
      
      const sql = `UPDATE units SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.name !== undefined) this.name = updateData.name;
      if (updateData.abbreviation !== undefined) this.abbreviation = updateData.abbreviation;
      if (updateData.type !== undefined) this.type = updateData.type;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'unité: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si l'unité est utilisée par des médicaments
      const sql = 'SELECT COUNT(*) as count FROM medications WHERE unit_id = ?';
      const result = await query(sql, [this.id]);
      
      if (result[0].count > 0) {
        throw new Error('Cette unité est utilisée par des médicaments et ne peut pas être supprimée');
      }
      
      const deleteSql = 'DELETE FROM units WHERE id = ?';
      await query(deleteSql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'unité: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      abbreviation: this.abbreviation,
      type: this.type,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Unit;
