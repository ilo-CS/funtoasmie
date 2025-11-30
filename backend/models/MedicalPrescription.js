const { query, transaction } = require('../config/database');
const MedicalPrescriptionItem = require('./MedicalPrescriptionItem');

class MedicalPrescription {
  constructor(data) {
    this.id = data.id;
    this.consultation_id = data.consultation_id;
    this.patient_name = data.patient_name;
    this.patient_phone = data.patient_phone;
    this.prescribed_date = data.prescribed_date;
    this.doctor_id = data.doctor_id;
    this.doctor_name = data.doctor_name;
    this.site_id = data.site_id;
    this.site_name = data.site_name;
    this.notes = data.notes;
    this.status = data.status || 'ACTIVE';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.items = data.items || [];
  }

  static validatePrescriptionData(prescriptionData) {
    const errors = [];

    // Validation du nom du patient (obligatoire)
    if (!prescriptionData.patient_name || prescriptionData.patient_name.trim().length < 2) {
      errors.push('Le nom du patient est obligatoire (minimum 2 caractères)');
    }
    if (prescriptionData.patient_name && prescriptionData.patient_name.length > 255) {
      errors.push('Le nom du patient ne peut pas dépasser 255 caractères');
    }

    // Validation du médecin (obligatoire)
    if (!prescriptionData.doctor_id) {
      errors.push('Le médecin est obligatoire');
    }

    // Validation des médicaments (obligatoire)
    if (!prescriptionData.items || !Array.isArray(prescriptionData.items) || prescriptionData.items.length === 0) {
      errors.push('Au moins un médicament est obligatoire');
    } else {
      // Valider chaque médicament
      prescriptionData.items.forEach((item, index) => {
        if (!item.medication_id) {
          errors.push(`Le médicament ${index + 1} est obligatoire`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`La quantité du médicament ${index + 1} doit être supérieure à 0`);
        }
        if (item.quantity && item.quantity > 1000) {
          errors.push(`La quantité du médicament ${index + 1} ne peut pas dépasser 1000 unités`);
        }
      });
    }

    // Validation du téléphone (optionnel)
    if (prescriptionData.patient_phone && prescriptionData.patient_phone.length > 20) {
      errors.push('Le numéro de téléphone ne peut pas dépasser 20 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(prescriptionData) {
    try {
      // Valider les données
      const validation = this.validatePrescriptionData(prescriptionData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const {
        consultation_id,
        patient_name,
        patient_phone,
        prescribed_date,
        doctor_id,
        site_id,
        notes,
        status,
        items
      } = prescriptionData;

      // Utiliser la fonction transaction
      return await transaction(async (connection) => {
        // 1. Créer l'ordonnance médicale
        const prescriptionSql = `
          INSERT INTO medical_prescriptions (
            consultation_id, patient_name, patient_phone, prescribed_date,
            doctor_id, site_id, notes, status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const prescriptionResult = await connection.execute(prescriptionSql, [
          consultation_id || null,
          patient_name.trim(),
          patient_phone ? patient_phone.trim() : null,
          prescribed_date || new Date(),
          doctor_id,
          site_id || null,
          notes ? notes.trim() : null,
          status || 'ACTIVE'
        ]);

        const prescriptionId = prescriptionResult[0].insertId;

        // 2. Créer les éléments de l'ordonnance
        for (const item of items) {
          await MedicalPrescriptionItem.create({
            medical_prescription_id: prescriptionId,
            medication_id: item.medication_id,
            quantity: item.quantity,
            dosage: item.dosage,
            duration: item.duration,
            instructions: item.instructions,
            notes: item.notes
          }, connection);
        }

        return prescriptionId;
      });
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'ordonnance médicale: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT mp.*, 
               CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
               s.name as site_name
        FROM medical_prescriptions mp
        LEFT JOIN users u ON mp.doctor_id = u.id
        LEFT JOIN sites s ON mp.site_id = s.id
        WHERE mp.id = ?
      `;
      const prescriptions = await query(sql, [id]);

      if (prescriptions.length === 0) {
        return null;
      }

      const prescription = prescriptions[0];

      // Récupérer les éléments de l'ordonnance
      const items = await MedicalPrescriptionItem.findByPrescription(id);
      prescription.items = items;

      return new MedicalPrescription(prescription);
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'ordonnance médicale: ${error.message}`);
    }
  }

  static async findByDoctor(doctor_id, limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT mp.*, 
               CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
               s.name as site_name
        FROM medical_prescriptions mp
        LEFT JOIN users u ON mp.doctor_id = u.id
        LEFT JOIN sites s ON mp.site_id = s.id
        WHERE mp.doctor_id = ?
      `;
      const params = [doctor_id];

      // Filtres
      if (filters.status) {
        sql += ' AND mp.status = ?';
        params.push(filters.status);
      }

      if (filters.patient_name) {
        sql += ' AND mp.patient_name LIKE ?';
        params.push(`%${filters.patient_name}%`);
      }

      if (filters.date_from) {
        sql += ' AND mp.prescribed_date >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += ' AND mp.prescribed_date <= ?';
        params.push(filters.date_to);
      }

      if (filters.site_id) {
        sql += ' AND mp.site_id = ?';
        params.push(filters.site_id);
      }

      sql += ' ORDER BY mp.prescribed_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const prescriptions = await query(sql, params);

      // Récupérer les éléments pour chaque ordonnance
      const prescriptionsWithItems = await Promise.all(
        prescriptions.map(async (prescription) => {
          const items = await MedicalPrescriptionItem.findByPrescription(prescription.id);
          prescription.items = items;
          return new MedicalPrescription(prescription);
        })
      );

      return prescriptionsWithItems;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des ordonnances médicales: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT mp.*, 
               CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
               s.name as site_name
        FROM medical_prescriptions mp
        LEFT JOIN users u ON mp.doctor_id = u.id
        LEFT JOIN sites s ON mp.site_id = s.id
        WHERE 1=1
      `;
      const params = [];

      // Filtres
      if (filters.doctor_id) {
        sql += ' AND mp.doctor_id = ?';
        params.push(filters.doctor_id);
      }

      if (filters.status) {
        sql += ' AND mp.status = ?';
        params.push(filters.status);
      }

      if (filters.patient_name) {
        sql += ' AND mp.patient_name LIKE ?';
        params.push(`%${filters.patient_name}%`);
      }

      if (filters.date_from) {
        sql += ' AND mp.prescribed_date >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += ' AND mp.prescribed_date <= ?';
        params.push(filters.date_to);
      }

      if (filters.site_id) {
        sql += ' AND mp.site_id = ?';
        params.push(filters.site_id);
      }

      sql += ' ORDER BY mp.prescribed_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const prescriptions = await query(sql, params);

      // Récupérer les éléments pour chaque ordonnance
      const prescriptionsWithItems = await Promise.all(
        prescriptions.map(async (prescription) => {
          const items = await MedicalPrescriptionItem.findByPrescription(prescription.id);
          prescription.items = items;
          return new MedicalPrescription(prescription);
        })
      );

      return prescriptionsWithItems;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des ordonnances médicales: ${error.message}`);
    }
  }

  static async getPrescriptionStats(doctor_id = null, site_id = null, date_from = null, date_to = null) {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total_prescriptions,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_count,
          COUNT(CASE WHEN status = 'FULFILLED' THEN 1 END) as fulfilled_count,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count
        FROM medical_prescriptions
        WHERE 1=1
      `;
      const params = [];

      if (doctor_id) {
        sql += ' AND doctor_id = ?';
        params.push(doctor_id);
      }

      if (site_id) {
        sql += ' AND site_id = ?';
        params.push(site_id);
      }

      if (date_from) {
        sql += ' AND prescribed_date >= ?';
        params.push(date_from);
      }

      if (date_to) {
        sql += ' AND prescribed_date <= ?';
        params.push(date_to);
      }

      const stats = await query(sql, params);
      return stats[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];

      if (updateData.patient_name !== undefined) {
        fields.push('patient_name = ?');
        values.push(updateData.patient_name.trim());
      }

      if (updateData.patient_phone !== undefined) {
        fields.push('patient_phone = ?');
        values.push(updateData.patient_phone ? updateData.patient_phone.trim() : null);
      }

      if (updateData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(updateData.notes ? updateData.notes.trim() : null);
      }

      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
      }

      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }

      fields.push('updated_at = NOW()');
      values.push(this.id);

      const sql = `UPDATE medical_prescriptions SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);

      // Mettre à jour l'instance
      Object.assign(this, updateData);
      if (updateData.patient_name) this.patient_name = updateData.patient_name.trim();

      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'ordonnance médicale: ${error.message}`);
    }
  }

  async cancel() {
    try {
      const sql = `
        UPDATE medical_prescriptions 
        SET status = 'CANCELLED', updated_at = NOW() 
        WHERE id = ?
      `;
      await query(sql, [this.id]);

      this.status = 'CANCELLED';
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation de l'ordonnance médicale: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Supprimer d'abord les éléments de l'ordonnance
      await MedicalPrescriptionItem.deleteByPrescription(this.id);
      
      // Puis supprimer l'ordonnance
      const sql = 'DELETE FROM medical_prescriptions WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'ordonnance médicale: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      consultation_id: this.consultation_id,
      patient_name: this.patient_name,
      patient_phone: this.patient_phone,
      prescribed_date: this.prescribed_date,
      doctor_id: this.doctor_id,
      doctor_name: this.doctor_name,
      site_id: this.site_id,
      site_name: this.site_name,
      notes: this.notes,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      items: this.items || []
    };
  }
}

module.exports = MedicalPrescription;

