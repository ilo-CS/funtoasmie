const { query } = require('../config/database');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.color = data.color;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll() {
    try {
      const sql = 'SELECT * FROM medication_categories ORDER BY name ASC';
      const categories = await query(sql);
      return categories.map(category => new Category(category));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM medication_categories WHERE id = ?';
      const categories = await query(sql, [id]);
      if (categories.length === 0) {
        return null;
      }
      return new Category(categories[0]);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la catégorie: ${error.message}`);
    }
  }

  static async create(categoryData) {
    try {
      const { name, description, color } = categoryData;
      
      const sql = `
        INSERT INTO medication_categories (name, description, color, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        name.trim(),
        description ? description.trim() : null,
        color || '#007bff'
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la catégorie: ${error.message}`);
    }
  }

  static async update(id, categoryData) {
    try {
      const { name, description, color } = categoryData;
      
      const sql = `
        UPDATE medication_categories 
        SET name = ?, description = ?, color = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const result = await query(sql, [
        name.trim(),
        description ? description.trim() : null,
        color || '#007bff',
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la catégorie: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM medication_categories WHERE id = ?';
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la catégorie: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Category;