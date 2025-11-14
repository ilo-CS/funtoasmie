const { query } = require('../config/database');

class SiteStock {
  constructor(data) {
    this.id = data.id;
    this.site_id = data.site_id;
    this.medication_id = data.medication_id;
    this.quantity = data.quantity;
    this.min_stock = data.min_stock;
    this.max_stock = data.max_stock;
    this.last_updated = data.last_updated;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Données jointes (optionnelles)
    this.site_name = data.site_name;
    this.medication_name = data.medication_name;
    this.medication_unit = data.medication_unit;
  }

  static validateSiteStockData(stockData) {
    const errors = [];

    // Validation du site (obligatoire)
    if (!stockData.site_id) {
      errors.push('L\'ID du site est obligatoire');
    }

    // Validation du médicament (obligatoire)
    if (!stockData.medication_id) {
      errors.push('L\'ID du médicament est obligatoire');
    }

    // Validation de la quantité
    if (stockData.quantity !== undefined && stockData.quantity < 0) {
      errors.push('La quantité ne peut pas être négative');
    }

    // Validation des seuils
    if (stockData.min_stock !== undefined && stockData.min_stock < 0) {
      errors.push('Le stock minimum ne peut pas être négatif');
    }

    if (stockData.max_stock !== undefined && stockData.max_stock < 0) {
      errors.push('Le stock maximum ne peut pas être négatif');
    }

    if (stockData.min_stock !== undefined && stockData.max_stock !== undefined && 
        stockData.min_stock > stockData.max_stock) {
      errors.push('Le stock minimum ne peut pas être supérieur au stock maximum');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(stockData) {
    try {
      // Valider les données
      const validation = this.validateSiteStockData(stockData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { site_id, medication_id, quantity = 0, min_stock = 0, max_stock = null } = stockData;
      
      // Vérifier si ce stock existe déjà
      const existingStock = await this.findBySiteAndMedication(site_id, medication_id);
      if (existingStock) {
        throw new Error('Ce stock existe déjà pour ce site et ce médicament');
      }
      
      const sql = `
        INSERT INTO site_stocks (
          site_id, medication_id, quantity, min_stock, max_stock,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        site_id,
        medication_id,
        quantity,
        min_stock,
        max_stock
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création du stock site: ${error.message}`);
    }
  }

  static async findBySiteAndMedication(site_id, medication_id) {
    try {
      const sql = `
        SELECT ss.*, s.name as site_name, m.name as medication_name, m.unit_name as medication_unit
        FROM site_stocks ss
        LEFT JOIN sites s ON ss.site_id = s.id
        LEFT JOIN medications m ON ss.medication_id = m.id
        WHERE ss.site_id = ? AND ss.medication_id = ?
      `;
      const stocks = await query(sql, [site_id, medication_id]);
      return stocks.length > 0 ? new SiteStock(stocks[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du stock site: ${error.message}`);
    }
  }

  static async findBySite(site_id) {
    try {
      const sql = `
        SELECT ss.*, s.name as site_name, m.name as medication_name, m.unit_name as medication_unit
        FROM site_stocks ss
        LEFT JOIN sites s ON ss.site_id = s.id
        LEFT JOIN medications m ON ss.medication_id = m.id
        WHERE ss.site_id = ?
        ORDER BY m.name ASC
      `;
      const stocks = await query(sql, [site_id]);
      return stocks.map(stock => new SiteStock(stock));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des stocks du site: ${error.message}`);
    }
  }

  static async findByMedication(medication_id) {
    try {
      const sql = `
        SELECT ss.*, s.name as site_name, m.name as medication_name, m.unit_name as medication_unit
        FROM site_stocks ss
        LEFT JOIN sites s ON ss.site_id = s.id
        LEFT JOIN medications m ON ss.medication_id = m.id
        WHERE ss.medication_id = ?
        ORDER BY s.name ASC
      `;
      const stocks = await query(sql, [medication_id]);
      return stocks.map(stock => new SiteStock(stock));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des stocks du médicament: ${error.message}`);
    }
  }

  static async findAll(filters = {}) {
    try {
      let sql = `
        SELECT ss.*, s.name as site_name, m.name as medication_name, m.unit_name as medication_unit
        FROM site_stocks ss
        LEFT JOIN sites s ON ss.site_id = s.id
        LEFT JOIN medications m ON ss.medication_id = m.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.site_id) {
        sql += ' AND ss.site_id = ?';
        params.push(filters.site_id);
      }

      if (filters.medication_id) {
        sql += ' AND ss.medication_id = ?';
        params.push(filters.medication_id);
      }

      if (filters.low_stock) {
        sql += ' AND ss.quantity <= ss.min_stock';
      }

      sql += ' ORDER BY s.name ASC, m.name ASC';

      const stocks = await query(sql, params);
      return stocks.map(stock => new SiteStock(stock));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des stocks: ${error.message}`);
    }
  }

  /**
   * Mettre à jour la quantité d'un stock de site (méthode statique)
   * @param {number} site_id - ID du site
   * @param {number} medication_id - ID du médicament
   * @param {number} newQuantity - Nouvelle quantité
   * @param {string} operation - Type d'opération: 'SET', 'ADD', 'SUBTRACT'
   */
  static async updateQuantity(site_id, medication_id, newQuantity, operation = 'SET') {
    try {
      let sql, params;

      if (operation === 'ADD') {
        sql = 'UPDATE site_stocks SET quantity = quantity + ?, updated_at = NOW() WHERE site_id = ? AND medication_id = ?';
        params = [newQuantity, site_id, medication_id];
      } else if (operation === 'SUBTRACT') {
        sql = 'UPDATE site_stocks SET quantity = GREATEST(0, quantity - ?), updated_at = NOW() WHERE site_id = ? AND medication_id = ?';
        params = [newQuantity, site_id, medication_id];
      } else {
        sql = 'UPDATE site_stocks SET quantity = ?, updated_at = NOW() WHERE site_id = ? AND medication_id = ?';
        params = [newQuantity, site_id, medication_id];
      }

      const result = await query(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Aucun stock trouvé pour ce site et ce médicament');
      }

      return result.affectedRows;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la quantité: ${error.message}`);
    }
  }

  async updateQuantity(newQuantity, operation = 'SET') {
    try {
      let sql, params;

      if (operation === 'ADD') {
        sql = 'UPDATE site_stocks SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?';
        params = [newQuantity, this.id];
      } else if (operation === 'SUBTRACT') {
        sql = 'UPDATE site_stocks SET quantity = GREATEST(0, quantity - ?), updated_at = NOW() WHERE id = ?';
        params = [newQuantity, this.id];
      } else {
        sql = 'UPDATE site_stocks SET quantity = ?, updated_at = NOW() WHERE id = ?';
        params = [newQuantity, this.id];
      }

      await query(sql, params);
      
      // Mettre à jour l'instance
      if (operation === 'ADD') {
        this.quantity += newQuantity;
      } else if (operation === 'SUBTRACT') {
        this.quantity = Math.max(0, this.quantity - newQuantity);
      } else {
        this.quantity = newQuantity;
      }

      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la quantité: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];

      if (updateData.quantity !== undefined) {
        fields.push('quantity = ?');
        values.push(updateData.quantity);
      }

      if (updateData.min_stock !== undefined) {
        fields.push('min_stock = ?');
        values.push(updateData.min_stock);
      }

      if (updateData.max_stock !== undefined) {
        fields.push('max_stock = ?');
        values.push(updateData.max_stock);
      }

      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }

      fields.push('updated_at = NOW()');
      values.push(this.id);

      const sql = `UPDATE site_stocks SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);

      // Mettre à jour l'instance
      if (updateData.quantity !== undefined) this.quantity = updateData.quantity;
      if (updateData.min_stock !== undefined) this.min_stock = updateData.min_stock;
      if (updateData.max_stock !== undefined) this.max_stock = updateData.max_stock;

      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du stock site: ${error.message}`);
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM site_stocks WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du stock site: ${error.message}`);
    }
  }

  // Méthodes utilitaires
  isLowStock() {
    return this.quantity <= this.min_stock;
  }

  isOutOfStock() {
    return this.quantity === 0;
  }

  getStockStatus() {
    if (this.quantity === 0) return 'OUT_OF_STOCK';
    if (this.quantity <= this.min_stock) return 'LOW_STOCK';
    if (this.max_stock && this.quantity >= this.max_stock) return 'HIGH_STOCK';
    return 'NORMAL';
  }

  toJSON() {
    return {
      id: this.id,
      site_id: this.site_id,
      medication_id: this.medication_id,
      quantity: this.quantity,
      min_stock: this.min_stock,
      max_stock: this.max_stock,
      last_updated: this.last_updated,
      created_at: this.created_at,
      updated_at: this.updated_at,
      site_name: this.site_name,
      medication_name: this.medication_name,
      medication_unit: this.medication_unit,
      stock_status: this.getStockStatus(),
      is_low_stock: this.isLowStock(),
      is_out_of_stock: this.isOutOfStock()
    };
  }
}

module.exports = SiteStock;
