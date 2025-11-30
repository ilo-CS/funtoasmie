const { query } = require('../config/database');

class MedicalPrescriptionItem {
  constructor(data) {
    this.id = data.id;
    this.medical_prescription_id = data.medical_prescription_id;
    this.medication_id = data.medication_id;
    this.medication_name = data.medication_name;
    this.quantity = data.quantity;
    this.dosage = data.dosage;
    this.duration = data.duration;
    this.instructions = data.instructions;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validatePrescriptionItemData(itemData) {
    const errors = [];

    if (!itemData.medical_prescription_id) {
      errors.push('L\'ID de l\'ordonnance médicale est obligatoire');
    }

    if (!itemData.medication_id) {
      errors.push('Le médicament est obligatoire');
    }

    if (!itemData.quantity || itemData.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    if (itemData.quantity && itemData.quantity > 1000) {
      errors.push('La quantité ne peut pas dépasser 1000 unités');
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
        medical_prescription_id,
        medication_id,
        quantity,
        dosage,
        duration,
        instructions,
        notes
      } = prescriptionItemData;

      const sql = `
        INSERT INTO medical_prescription_items (
          medical_prescription_id, medication_id, quantity,
          dosage, duration, instructions, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const params = [
        medical_prescription_id,
        medication_id,
        quantity,
        dosage ? dosage.trim() : null,
        duration ? duration.trim() : null,
        instructions ? instructions.trim() : null,
        notes ? notes.trim() : null
      ];

      let result;
      if (connection) {
        result = await connection.execute(sql, params);
      } else {
        result = await query(sql, params);
      }

      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'élément d'ordonnance: ${error.message}`);
    }
  }

  static async findByPrescription(medical_prescription_id) {
    try {
      const sql = `
        SELECT mpi.*, m.name as medication_name
        FROM medical_prescription_items mpi
        LEFT JOIN medications m ON mpi.medication_id = m.id
        WHERE mpi.medical_prescription_id = ?
        ORDER BY mpi.created_at ASC
      `;
      const items = await query(sql, [medical_prescription_id]);
      return items.map(item => new MedicalPrescriptionItem(item));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des éléments d'ordonnance: ${error.message}`);
    }
  }

  static async deleteByPrescription(medical_prescription_id, connection = null) {
    try {
      const sql = 'DELETE FROM medical_prescription_items WHERE medical_prescription_id = ?';
      
      if (connection) {
        await connection.execute(sql, [medical_prescription_id]);
      } else {
        await query(sql, [medical_prescription_id]);
      }
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression des éléments d'ordonnance: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      medical_prescription_id: this.medical_prescription_id,
      medication_id: this.medication_id,
      medication_name: this.medication_name,
      quantity: this.quantity,
      dosage: this.dosage,
      duration: this.duration,
      instructions: this.instructions,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = MedicalPrescriptionItem;

