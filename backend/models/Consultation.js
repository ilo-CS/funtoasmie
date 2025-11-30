const { query, transaction } = require('../config/database');

class Consultation {
  constructor(data) {
    this.id = data.id;
    this.patient_name = data.patient_name;
    this.patient_phone = data.patient_phone;
    this.patient_age = data.patient_age;
    this.patient_gender = data.patient_gender;
    this.consultation_date = data.consultation_date;
    this.symptoms = data.symptoms;
    this.diagnosis = data.diagnosis;
    this.notes = data.notes;
    this.doctor_id = data.doctor_id;
    this.doctor_name = data.doctor_name;
    this.site_id = data.site_id;
    this.site_name = data.site_name;
    this.status = data.status || 'COMPLETED';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateConsultationData(consultationData) {
    const errors = [];

    // Validation du nom du patient (obligatoire)
    if (!consultationData.patient_name || consultationData.patient_name.trim().length < 2) {
      errors.push('Le nom du patient est obligatoire (minimum 2 caractères)');
    }
    if (consultationData.patient_name && consultationData.patient_name.length > 255) {
      errors.push('Le nom du patient ne peut pas dépasser 255 caractères');
    }

    // Validation du médecin (obligatoire)
    if (!consultationData.doctor_id) {
      errors.push('Le médecin est obligatoire');
    }

    // Validation de l'âge (optionnel, mais si présent doit être valide)
    if (consultationData.patient_age !== undefined && consultationData.patient_age !== null) {
      if (consultationData.patient_age < 0 || consultationData.patient_age > 150) {
        errors.push('L\'âge doit être entre 0 et 150 ans');
      }
    }

    // Validation du genre (optionnel)
    if (consultationData.patient_gender && !['M', 'F', 'OTHER'].includes(consultationData.patient_gender)) {
      errors.push('Le genre doit être M, F ou OTHER');
    }

    // Validation du téléphone (optionnel)
    if (consultationData.patient_phone && consultationData.patient_phone.length > 20) {
      errors.push('Le numéro de téléphone ne peut pas dépasser 20 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(consultationData) {
    try {
      // Valider les données
      const validation = this.validateConsultationData(consultationData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const {
        patient_name,
        patient_phone,
        patient_age,
        patient_gender,
        consultation_date,
        symptoms,
        diagnosis,
        notes,
        doctor_id,
        site_id,
        status
      } = consultationData;

      const sql = `
        INSERT INTO consultations (
          patient_name, patient_phone, patient_age, patient_gender,
          consultation_date, symptoms, diagnosis, notes,
          doctor_id, site_id, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const result = await query(sql, [
        patient_name.trim(),
        patient_phone ? patient_phone.trim() : null,
        patient_age || null,
        patient_gender || null,
        consultation_date || new Date(),
        symptoms ? symptoms.trim() : null,
        diagnosis ? diagnosis.trim() : null,
        notes ? notes.trim() : null,
        doctor_id,
        site_id || null,
        status || 'COMPLETED'
      ]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la consultation: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT c.*, 
               CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
               s.name as site_name
        FROM consultations c
        LEFT JOIN users u ON c.doctor_id = u.id
        LEFT JOIN sites s ON c.site_id = s.id
        WHERE c.id = ?
      `;
      const consultations = await query(sql, [id]);

      if (consultations.length === 0) {
        return null;
      }

      return new Consultation(consultations[0]);
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de la consultation: ${error.message}`);
    }
  }

  static async findByDoctor(doctor_id, limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT c.*, 
               CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
               s.name as site_name
        FROM consultations c
        LEFT JOIN users u ON c.doctor_id = u.id
        LEFT JOIN sites s ON c.site_id = s.id
        WHERE c.doctor_id = ?
      `;
      const params = [doctor_id];

      // Filtres
      if (filters.status) {
        sql += ' AND c.status = ?';
        params.push(filters.status);
      }

      if (filters.patient_name) {
        sql += ' AND c.patient_name LIKE ?';
        params.push(`%${filters.patient_name}%`);
      }

      if (filters.date_from) {
        sql += ' AND c.consultation_date >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += ' AND c.consultation_date <= ?';
        params.push(filters.date_to);
      }

      if (filters.site_id) {
        sql += ' AND c.site_id = ?';
        params.push(filters.site_id);
      }

      sql += ' ORDER BY c.consultation_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const consultations = await query(sql, params);
      return consultations.map(consultation => new Consultation(consultation));
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des consultations: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT c.*, 
               CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
               s.name as site_name
        FROM consultations c
        LEFT JOIN users u ON c.doctor_id = u.id
        LEFT JOIN sites s ON c.site_id = s.id
        WHERE 1=1
      `;
      const params = [];

      // Filtres
      if (filters.doctor_id) {
        sql += ' AND c.doctor_id = ?';
        params.push(filters.doctor_id);
      }

      if (filters.status) {
        sql += ' AND c.status = ?';
        params.push(filters.status);
      }

      if (filters.patient_name) {
        sql += ' AND c.patient_name LIKE ?';
        params.push(`%${filters.patient_name}%`);
      }

      if (filters.date_from) {
        sql += ' AND c.consultation_date >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += ' AND c.consultation_date <= ?';
        params.push(filters.date_to);
      }

      if (filters.site_id) {
        sql += ' AND c.site_id = ?';
        params.push(filters.site_id);
      }

      sql += ' ORDER BY c.consultation_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const consultations = await query(sql, params);
      return consultations.map(consultation => new Consultation(consultation));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des consultations: ${error.message}`);
    }
  }

  static async getConsultationStats(doctor_id = null, site_id = null, date_from = null, date_to = null) {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total_consultations,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count
        FROM consultations
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
        sql += ' AND consultation_date >= ?';
        params.push(date_from);
      }

      if (date_to) {
        sql += ' AND consultation_date <= ?';
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

      if (updateData.patient_age !== undefined) {
        fields.push('patient_age = ?');
        values.push(updateData.patient_age);
      }

      if (updateData.patient_gender !== undefined) {
        fields.push('patient_gender = ?');
        values.push(updateData.patient_gender);
      }

      if (updateData.consultation_date !== undefined) {
        fields.push('consultation_date = ?');
        values.push(updateData.consultation_date);
      }

      if (updateData.symptoms !== undefined) {
        fields.push('symptoms = ?');
        values.push(updateData.symptoms ? updateData.symptoms.trim() : null);
      }

      if (updateData.diagnosis !== undefined) {
        fields.push('diagnosis = ?');
        values.push(updateData.diagnosis ? updateData.diagnosis.trim() : null);
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

      const sql = `UPDATE consultations SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);

      // Mettre à jour l'instance
      Object.assign(this, updateData);
      if (updateData.patient_name) this.patient_name = updateData.patient_name.trim();

      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la consultation: ${error.message}`);
    }
  }

  async cancel() {
    try {
      const sql = `
        UPDATE consultations 
        SET status = 'CANCELLED', updated_at = NOW() 
        WHERE id = ?
      `;
      await query(sql, [this.id]);

      this.status = 'CANCELLED';
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation de la consultation: ${error.message}`);
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM consultations WHERE id = ?';
      await query(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la consultation: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      patient_name: this.patient_name,
      patient_phone: this.patient_phone,
      patient_age: this.patient_age,
      patient_gender: this.patient_gender,
      consultation_date: this.consultation_date,
      symptoms: this.symptoms,
      diagnosis: this.diagnosis,
      notes: this.notes,
      doctor_id: this.doctor_id,
      doctor_name: this.doctor_name,
      site_id: this.site_id,
      site_name: this.site_name,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Consultation;

