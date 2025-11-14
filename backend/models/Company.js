const { query } = require('../config/database');

class Company {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.address = data.address || data.adress;
        this.city = data.city;
        this.phone = data.phone;
        this.mail = data.mail;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at || data.update_at;
    }

    static validateCompanyData(companyData) {
        const errors = [];
        
        // Vérifier le nom
        if (!companyData.name) {
            errors.push('Le nom de la société est obligatoire');
        } else if (companyData.name.trim().length < 2) {
            errors.push('Le nom du company doit contenir au moins 2 caractères');
        } else if (companyData.name.length > 100) {
            errors.push('Le nom du company ne peut pas dépasser 100 caractères');
        }
        
        // Vérifier l'adresse si elle est fournie
        if (companyData.address && companyData.address.length > 255) {
            errors.push('L\'adresse ne peut pas dépasser 255 caractères');
        }
        
        // Vérifier la ville si elle est fournie
        if (companyData.city && companyData.city.length > 100) {
            errors.push('La ville ne peut pas dépasser 100 caractères');
        }
        
        // Vérifier le téléphone si il est fourni
        if (companyData.phone && companyData.phone.length > 20) {
            errors.push('Le téléphone ne peut pas dépasser 20 caractères');
        }
        
        // Vérifier l'email si il est fourni
        if (companyData.mail && companyData.mail.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(companyData.mail)) {
                errors.push('L\'adresse email n\'est pas valide');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static async create(companyData) {
        try {
        // Valider les données
        const validation = this.validateCompanyData(companyData);
        if (!validation.isValid) {
            throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
        }

        const { name, address, city, phone, mail } = companyData;
        
        // Vérifier si le company existe déjà
        const existingCompany = await this.findByName(name);
        if (existingCompany) {
            throw new Error('Ce company existe déjà');
        }
        
        const sql = `
            INSERT INTO company (name, address, city, phone, mail, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `;
        
        const result = await query(sql, [
            name.trim(),
            address ? address.trim() : null,
            city ? city.trim() : null,
            phone ? phone.trim() : null,
            mail ? mail.trim() : null,
        ]);
        
        return result.insertId;
        } catch (error) {
        throw new Error(`Erreur lors de la création du company: ${error.message}`);
        }
    }

    static async findByName(name) {
      try {
        const sql = 'SELECT * FROM company WHERE name = ?';
        const company = await query(sql, [name]);
        return company.length > 0 ? new Company(company[0]) : null;
      } catch (error) {
        throw new Error(`Erreur lors de la recherche du company: ${error.message}`);
      }
    }

    static async findById(id) {
      try {
        const sql = 'SELECT * FROM company WHERE id = ?';
        const company = await query(sql, [id]);
        return company.length > 0 ? new Company(company[0]) : null;
      } catch (error) {
        throw new Error(`Erreur lors de la recherche du company: ${error.message}`);
      }
    }
  
    static async findAll(limit = 50, offset = 0, activeOnly = true) {
      try {
        let sql = 'SELECT * FROM company';
        const params = [];
        
        if (activeOnly) {
          sql += ' WHERE is_active = 1';
        }
        
        sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const company = await query(sql, params);
        return company.map(company => new Company(company));
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des company: ${error.message}`);
      }
    }

    static async findActive() {
      try {
        const sql = 'SELECT * FROM company WHERE is_active = 1 ORDER BY name ASC';
        const company = await query(sql);
        return company.map(company => new Company(company));
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des company actifs: ${error.message}`);
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
        
        if (updateData.city !== undefined) {
          fields.push('city = ?');
          values.push(updateData.city ? updateData.city.trim() : null);
        }
        
        if (updateData.phone !== undefined) {
          fields.push('phone = ?');
          values.push(updateData.phone ? updateData.phone.trim() : null);
        }
        
        if (updateData.mail !== undefined) {
          fields.push('mail = ?');
          values.push(updateData.mail ? updateData.mail.trim() : null);
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
        
        const sql = `UPDATE company SET ${fields.join(', ')} WHERE id = ?`;
        await query(sql, values);
        
        // Mettre à jour l'instance avec les nouvelles valeurs
        if (updateData.name !== undefined) this.name = updateData.name;
        if (updateData.address !== undefined) this.address = updateData.address;
        if (updateData.city !== undefined) this.city = updateData.city;
        if (updateData.phone !== undefined) this.phone = updateData.phone;
        if (updateData.mail !== undefined) this.mail = updateData.mail;
        if (updateData.is_active !== undefined) this.is_active = updateData.is_active;
        
        return this;
      } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du company: ${error.message}`);
      }
    }
  
    async delete() {
      try {
        const deleteSql = 'DELETE FROM company WHERE id = ?';
        await query(deleteSql, [this.id]);
        return true;
      } catch (error) {
        console.error('❌ Erreur dans la méthode delete du modèle company:', error);
        throw new Error(`Erreur lors de la suppression du company: ${error.message}`);
      }
    }
  
    async deactivate() {
      try {
        const sql = 'UPDATE company SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await query(sql, [this.id]);
        this.is_active = false;
        return true;
      } catch (error) {
        throw new Error(`Erreur lors de la désactivation du company: ${error.message}`);
      }
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        address: this.address,
        city: this.city,
        phone: this.phone,
        mail: this.mail,
        is_active: this.is_active,
        created_at: this.created_at,
        updated_at: this.updated_at
      };
    }
}
module.exports = Company;