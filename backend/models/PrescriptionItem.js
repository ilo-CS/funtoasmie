const { query } = require('../config/database');

class PrescriptionItem {
  constructor(data) {
    this.id = data.id;
    this.prescription_id = data.prescription_id;
    this.medication_id = data.medication_id;
    this.medication_name = data.medication_name;
    this.quantity = data.quantity;
    this.dosage = data.dosage;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validatePrescriptionItemData(itemData) {
    const errors = [];

    // Validation du médicament (obligatoire)
    if (!itemData.medication_id) {
      errors.push('Le médicament est obligatoire');
    }

    // Validation de la quantité (obligatoire)
    if (!itemData.quantity || itemData.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }
    if (itemData.quantity && itemData.quantity > 1000) {
      errors.push('La quantité ne peut pas dépasser 1000 unités');
    }

    // Validation du dosage (optionnel)
    if (itemData.dosage && itemData.dosage.length > 500) {
      errors.push('Le dosage ne peut pas dépasser 500 caractères');
    }

    // Validation des notes (optionnel)
    if (itemData.notes && itemData.notes.length > 1000) {
      errors.push('Les notes ne peuvent pas dépasser 1000 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(prescriptionItemData, connection = null) {
    try {
      // Valider les données
      const validation = this.validatePrescriptionItemData(prescriptionItemData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { 
        prescription_id,
        medication_id, 
        quantity, 
        dosage, 
        notes
      } = prescriptionItemData;
      
      const sql = `
        INSERT INTO prescription_items (
          prescription_id, medication_id, quantity, 
          dosage, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      // Utiliser la connexion fournie ou créer une nouvelle requête
      const result = connection 
        ? await connection.execute(sql, [
            prescription_id,
            medication_id,
            quantity,
            dosage ? dosage.trim() : null,
            notes ? notes.trim() : null
          ])
        : await query(sql, [
            prescription_id,
            medication_id,
            quantity,
            dosage ? dosage.trim() : null,
            notes ? notes.trim() : null
          ]);
      
      return connection ? result[0].insertId : result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'élément de prescription: ${error.message}`);
    }
  }

  static async findByPrescription(prescription_id) {
    try {
      const sql = `
        SELECT pi.*, 
               m.name as medication_name,
               m.unit_name as medication_unit
        FROM prescription_items pi
        LEFT JOIN medications m ON pi.medication_id = m.id
        WHERE pi.prescription_id = ?
        ORDER BY pi.created_at ASC
      `;
      const items = await query(sql, [prescription_id]);
      return items.map(item => new PrescriptionItem(item));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des éléments de prescription: ${error.message}`);
    }
  }

  static async findByPrescriptionAndMedication(prescription_id, medication_id) {
    try {
      const sql = `
        SELECT pi.*, 
               m.name as medication_name,
               m.unit_name as medication_unit
        FROM prescription_items pi
        LEFT JOIN medications m ON pi.medication_id = m.id
        WHERE pi.prescription_id = ? AND pi.medication_id = ?
      `;
      const items = await query(sql, [prescription_id, medication_id]);
      return items.length > 0 ? new PrescriptionItem(items[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'élément de prescription: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.medication_id !== undefined) {
        fields.push('medication_id = ?');
        values.push(updateData.medication_id);
      }
      
      if (updateData.quantity !== undefined) {
        fields.push('quantity = ?');
        values.push(updateData.quantity);
      }
      
      if (updateData.dosage !== undefined) {
        fields.push('dosage = ?');
        values.push(updateData.dosage ? updateData.dosage.trim() : null);
      }
      
      if (updateData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(updateData.notes ? updateData.notes.trim() : null);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const sql = `UPDATE prescription_items SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'élément de prescription: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM prescription_items WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'élément de prescription: ${error.message}`);
    }
  }

  static async deleteByPrescription(prescription_id) {
    try {
      const sql = 'DELETE FROM prescription_items WHERE prescription_id = ?';
      await query(sql, [prescription_id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression des éléments de prescription: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      prescription_id: this.prescription_id,
      medication_id: this.medication_id,
      medication_name: this.medication_name,
      medication_unit: this.medication_unit,
      quantity: this.quantity,
      dosage: this.dosage,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PrescriptionItem;
