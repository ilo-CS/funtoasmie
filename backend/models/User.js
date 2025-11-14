const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { LIMITS, MESSAGES } = require('../constants');
const { RoleService } = require('../services/roleService');

class User {
  constructor(data) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.role = data.role;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validateUserData(userData) {
    const errors = [];

    // Validation du nom (obligatoire)
    if (!userData.last_name || userData.last_name.trim().length < LIMITS.NAME_MIN_LENGTH) {
      errors.push(`Le nom doit contenir au moins ${LIMITS.NAME_MIN_LENGTH} caractères`);
    }
    if (userData.last_name && userData.last_name.length > LIMITS.NAME_MAX_LENGTH) {
      errors.push(`Le nom ne peut pas dépasser ${LIMITS.NAME_MAX_LENGTH} caractères`);
    }
    if (userData.last_name && !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(userData.last_name)) {
      errors.push('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets');
    }

    // Validation du prénom (optionnel)
    if (userData.first_name && userData.first_name.trim().length < LIMITS.NAME_MIN_LENGTH) {
      errors.push(`Le prénom doit contenir au moins ${LIMITS.NAME_MIN_LENGTH} caractères`);
    }
    if (userData.first_name && userData.first_name.length > LIMITS.NAME_MAX_LENGTH) {
      errors.push(`Le prénom ne peut pas dépasser ${LIMITS.NAME_MAX_LENGTH} caractères`);
    }
    if (userData.first_name && !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(userData.first_name)) {
      errors.push('Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets');
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.push('Format d\'email invalide');
    }
    if (userData.email && userData.email.length > LIMITS.EMAIL_MAX_LENGTH) {
      errors.push(`L'email ne peut pas dépasser ${LIMITS.EMAIL_MAX_LENGTH} caractères`);
    }

    // Validation du téléphone (optionnel)
    if (userData.phone && userData.phone.length > LIMITS.PHONE_MAX_LENGTH) {
      errors.push(`Le téléphone ne peut pas dépasser ${LIMITS.PHONE_MAX_LENGTH} caractères`);
    }
    if (userData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(userData.phone)) {
      errors.push('Format de téléphone invalide');
    }

    // Validation du mot de passe (obligatoire pour la création)
    if (!userData.password) {
      errors.push('Le mot de passe est requis');
    } else {
      if (userData.password.length < LIMITS.PASSWORD_MIN_LENGTH) {
        errors.push(`Le mot de passe doit contenir au moins ${LIMITS.PASSWORD_MIN_LENGTH} caractères`);
      }
      if (userData.password.length > LIMITS.PASSWORD_MAX_LENGTH) {
        errors.push(`Le mot de passe ne peut pas dépasser ${LIMITS.PASSWORD_MAX_LENGTH} caractères`);
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(userData.password)) {
        errors.push('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async create(userData) {
    try {
      // Valider les données
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { first_name, last_name, email, phone, password, role } = userData;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error(MESSAGES.ERROR.USER_EXISTS);
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const sql = `
        INSERT INTO users (first_name, last_name, email, phone, passwrd, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        first_name.trim(),
        last_name.trim(),
        email.toLowerCase().trim(),
        phone ? phone.trim() : null,
        hashedPassword,
        role,
        1 // is_active = 1 (TRUE)
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
      const users = await query(sql, [email]);
      return users.length > 0 ? new User(users[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
      const users = await query(sql, [id]);
      return users.length > 0 ? new User(users[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
    }
  }

  static async findByIdAnyStatus(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const users = await query(sql, [id]);
      return users.length > 0 ? new User(users[0]) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
    }
  }

  async checkPassword(password) {
    try {
      const sql = 'SELECT passwrd FROM users WHERE id = ?';
      const users = await query(sql, [this.id]);
      
      if (users.length === 0) {
        return false;
      }
      
      return await bcrypt.compare(password, users[0].passwrd);
    } catch (error) {
      throw new Error(`Erreur lors de la vérification du mot de passe: ${error.message}`);
    }
  }

  static async findAll(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT id, first_name, last_name, email, phone, role, is_active, created_at, updated_at
        FROM users 
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const users = await query(sql, [limit, offset]);
      return users.map(user => new User(user));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.first_name !== undefined) {
        fields.push('first_name = ?');
        values.push(updateData.first_name.trim());
      }
      
      if (updateData.last_name !== undefined) {
        fields.push('last_name = ?');
        values.push(updateData.last_name.trim());
      }
      
      if (updateData.email !== undefined) {
        fields.push('email = ?');
        values.push(updateData.email.toLowerCase().trim());
      }
      
      if (updateData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(updateData.phone ? updateData.phone.trim() : null);
      }
      
      if (updateData.role !== undefined) {
        fields.push('role = ?');
        values.push(updateData.role);
      }
      
      if (updateData.password !== undefined && updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, 12);
        fields.push('passwrd = ?');
        values.push(hashedPassword);
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
      
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await query(sql, values);
      
      // Mettre à jour l'instance avec les nouvelles valeurs
      if (updateData.first_name !== undefined) this.first_name = updateData.first_name;
      if (updateData.last_name !== undefined) this.last_name = updateData.last_name;
      if (updateData.email !== undefined) this.email = updateData.email;
      if (updateData.phone !== undefined) this.phone = updateData.phone;
      if (updateData.role !== undefined) this.role = updateData.role;
      if (updateData.is_active !== undefined) this.is_active = updateData.is_active;
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  async delete() {
    try {
      const sql = 'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [this.id]);
      this.is_active = false;
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }

  getFullName() {
    if (this.first_name) {
      return `${this.last_name} ${this.first_name}`;
    }
    return this.last_name;
  }

  toJSON() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      name: this.getFullName(),
      email: this.email,
      phone: this.phone,
      role: this.role,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  static async query(sql, params = []) {
    return await query(sql, params);
  }
}

module.exports = User;
