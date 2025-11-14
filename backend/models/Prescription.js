const { query, transaction } = require('../config/database');
const PrescriptionItem = require('./PrescriptionItem');

class Prescription {
  constructor(data) {
    this.id = data.id;
    this.patient_name = data.patient_name;
    this.patient_phone = data.patient_phone;
    this.notes = data.notes;
    this.status = data.status;
    this.site_id = data.site_id;
    this.site_name = data.site_name;
    this.pharmacist_id = data.pharmacist_id;
    this.pharmacist_name = data.pharmacist_name;
    this.prescribed_date = data.prescribed_date;
    this.prepared_date = data.prepared_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.items = data.items || []; // Tableau des médicaments
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

    // Validation du site (obligatoire)
    if (!prescriptionData.site_id) {
      errors.push('Le site est obligatoire');
    }

    // Validation du pharmacien (obligatoire)
    if (!prescriptionData.pharmacist_id) {
      errors.push('Le pharmacien est obligatoire');
    }

    // Validation du statut
    const validStatuses = ['PENDING', 'PREPARING', 'PREPARED', 'CANCELLED'];
    if (prescriptionData.status && !validStatuses.includes(prescriptionData.status)) {
      errors.push('Le statut doit être PENDING, PREPARING, PREPARED ou CANCELLED');
    }

    // Validation du téléphone (optionnel)
    if (prescriptionData.patient_phone && prescriptionData.patient_phone.length > 20) {
      errors.push('Le numéro de téléphone ne peut pas dépasser 20 caractères');
    }

    // Validation des notes (optionnel)
    if (prescriptionData.notes && prescriptionData.notes.length > 1000) {
      errors.push('Les notes ne peuvent pas dépasser 1000 caractères');
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
        patient_name, 
        patient_phone, 
        notes, 
        site_id, 
        pharmacist_id,
        items
      } = prescriptionData;
      
      // Utiliser la fonction transaction
      return await transaction(async (connection) => {
        // 1. Créer la prescription
        const prescriptionSql = `
          INSERT INTO prescriptions (
            patient_name, patient_phone, notes, status, site_id, pharmacist_id, 
            prescribed_date, created_at, updated_at
          ) VALUES (?, ?, ?, 'PENDING', ?, ?, NOW(), NOW(), NOW())
        `;
        
        const prescriptionResult = await connection.execute(prescriptionSql, [
          patient_name.trim(),
          patient_phone ? patient_phone.trim() : null,
          notes ? notes.trim() : null,
          site_id,
          pharmacist_id
        ]);
        
        const prescriptionId = prescriptionResult[0].insertId;
        
        // 2. Créer les éléments de prescription
        for (const item of items) {
          await PrescriptionItem.create({
            prescription_id: prescriptionId,
            medication_id: item.medication_id,
            quantity: item.quantity,
            dosage: item.dosage,
            notes: item.notes
          }, connection);
        }
        
        return prescriptionId;
      });
    } catch (error) {
      throw new Error(`Erreur lors de la création de la prescription: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT p.*, 
               s.name as site_name,
               u.first_name, u.last_name,
               CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name
        FROM prescriptions p
        LEFT JOIN sites s ON p.site_id = s.id
        LEFT JOIN users u ON p.pharmacist_id = u.id
        WHERE p.id = ?
      `;
      const prescriptions = await query(sql, [id]);
      
      if (prescriptions.length === 0) {
        return null;
      }
      
      const prescription = prescriptions[0];
      
      // Récupérer les éléments de la prescription
      const items = await PrescriptionItem.findByPrescription(id);
      prescription.items = items;
      
      return new Prescription(prescription);
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de la prescription: ${error.message}`);
    }
  }

  static async findBySite(site_id, limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT p.*, 
               s.name as site_name,
               u.first_name, u.last_name,
               CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name
        FROM prescriptions p
        LEFT JOIN sites s ON p.site_id = s.id
        LEFT JOIN users u ON p.pharmacist_id = u.id
        WHERE p.site_id = ?
      `;
      const params = [site_id];
      
      // Filtres
      if (filters.status) {
        sql += ' AND p.status = ?';
        params.push(filters.status);
      }
      
      if (filters.patient_name) {
        sql += ' AND p.patient_name LIKE ?';
        params.push(`%${filters.patient_name}%`);
      }
      
      if (filters.medication_id) {
        // Rechercher dans les éléments de prescription
        sql += ` AND p.id IN (
          SELECT prescription_id 
          FROM prescription_items 
          WHERE medication_id = ?
        )`;
        params.push(filters.medication_id);
      }
      
      if (filters.date_from) {
        sql += ' AND p.prescribed_date >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND p.prescribed_date <= ?';
        params.push(filters.date_to);
      }
      
      sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const prescriptions = await query(sql, params);
      
      // Récupérer les éléments pour chaque prescription
      const prescriptionsWithItems = await Promise.all(
        prescriptions.map(async (prescription) => {
          const items = await PrescriptionItem.findByPrescription(prescription.id);
          prescription.items = items;
          return new Prescription(prescription);
        })
      );
      
      return prescriptionsWithItems;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des prescriptions: ${error.message}`);
    }
  }

  static async findByPharmacist(pharmacist_id, limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT p.*, 
               m.name as medication_name,
               s.name as site_name,
               u.first_name, u.last_name,
               CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name
        FROM prescriptions p
        LEFT JOIN medications m ON p.medication_id = m.id
        LEFT JOIN sites s ON p.site_id = s.id
        LEFT JOIN users u ON p.pharmacist_id = u.id
        WHERE p.pharmacist_id = ?
      `;
      const params = [pharmacist_id];
      
      // Filtres
      if (filters.status) {
        sql += ' AND p.status = ?';
        params.push(filters.status);
      }
      
      if (filters.site_id) {
        sql += ' AND p.site_id = ?';
        params.push(filters.site_id);
      }
      
      sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const prescriptions = await query(sql, params);
      return prescriptions.map(prescription => new Prescription(prescription));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des prescriptions: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT p.*, 
               m.name as medication_name,
               s.name as site_name,
               u.first_name, u.last_name,
               CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name
        FROM prescriptions p
        LEFT JOIN medications m ON p.medication_id = m.id
        LEFT JOIN sites s ON p.site_id = s.id
        LEFT JOIN users u ON p.pharmacist_id = u.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filtres
      if (filters.status) {
        sql += ' AND p.status = ?';
        params.push(filters.status);
      }
      
      if (filters.site_id) {
        sql += ' AND p.site_id = ?';
        params.push(filters.site_id);
      }
      
      if (filters.pharmacist_id) {
        sql += ' AND p.pharmacist_id = ?';
        params.push(filters.pharmacist_id);
      }
      
      if (filters.patient_name) {
        sql += ' AND p.patient_name LIKE ?';
        params.push(`%${filters.patient_name}%`);
      }
      
      if (filters.date_from) {
        sql += ' AND p.prescribed_date >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND p.prescribed_date <= ?';
        params.push(filters.date_to);
      }
      
      sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const prescriptions = await query(sql, params);
      return prescriptions.map(prescription => new Prescription(prescription));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des prescriptions: ${error.message}`);
    }
  }

  static async getPrescriptionStats(site_id = null, date_from = null, date_to = null) {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total_prescriptions,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'PREPARING' THEN 1 END) as preparing_count,
          COUNT(CASE WHEN status = 'PREPARED' THEN 1 END) as prepared_count,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count
        FROM prescriptions
        WHERE 1=1
      `;
      const params = [];
      
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
      
      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      
      if (fields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      fields.push('updated_at = NOW()');
      values.push(this.id);
      
      const sql = `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.patient_name !== undefined) this.patient_name = updateData.patient_name.trim();
      if (updateData.patient_phone !== undefined) this.patient_phone = updateData.patient_phone;
      if (updateData.medication_id !== undefined) this.medication_id = updateData.medication_id;
      if (updateData.quantity !== undefined) this.quantity = updateData.quantity;
      if (updateData.dosage !== undefined) this.dosage = updateData.dosage;
      if (updateData.notes !== undefined) this.notes = updateData.notes;
      if (updateData.status !== undefined) this.status = updateData.status;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la prescription: ${error.message}`);
    }
  }

  async markAsPreparing() {
    try {
      const sql = `
        UPDATE prescriptions 
        SET status = 'PREPARING', updated_at = NOW() 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'PREPARING';
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }

  async markAsPrepared() {
    try {
      const sql = `
        UPDATE prescriptions 
        SET status = 'PREPARED', prepared_date = NOW(), updated_at = NOW() 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'PREPARED';
      this.prepared_date = new Date();
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la finalisation de la prescription: ${error.message}`);
    }
  }

  async cancel() {
    try {
      const sql = `
        UPDATE prescriptions 
        SET status = 'CANCELLED', updated_at = NOW() 
        WHERE id = ?
      `;
      await query(sql, [this.id]);
      
      this.status = 'CANCELLED';
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation de la prescription: ${error.message}`);
    }
  }

  async delete() {
    try {
      // Vérifier si la prescription peut être supprimée
      if (this.status === 'PREPARED') {
        throw new Error('Les prescriptions préparées ne peuvent pas être supprimées');
      }
      
      const sql = 'DELETE FROM prescriptions WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la prescription: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      patient_name: this.patient_name,
      patient_phone: this.patient_phone,
      notes: this.notes,
      status: this.status,
      site_id: this.site_id,
      site_name: this.site_name,
      pharmacist_id: this.pharmacist_id,
      pharmacist_name: this.pharmacist_name,
      prescribed_date: this.prescribed_date,
      prepared_date: this.prepared_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
      items: this.items || [] // Tableau des médicaments
    };
  }
}

module.exports = Prescription;
