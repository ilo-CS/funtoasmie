const Company = require('../models/Company');
const { validationResult } = require('express-validator');

class CompanyController {
  // Récupérer tous les companies
  static async getAllCompanies(req, res) {
    try {
      const { limit = 50, offset = 0, active_only = true } = req.query;
      
      const companies = await Company.findAll(
        parseInt(limit), 
        parseInt(offset), 
        active_only === 'true'
      );
      
      res.json({
        success: true,
        data: companies,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: companies.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des companies:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des companies',
        error: error.message
      });
    }
  }

  // Récupérer un company par ID
  static async getCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await Company.findById(id);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du company:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du company',
        error: error.message
      });
    }
  }

  // Récupérer les companies actifs
  static async getActiveCompanies(req, res) {
    try {
      const companies = await Company.findActive();
      
      res.json({
        success: true,
        data: companies
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des companies actifs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des companies actifs',
        error: error.message
      });
    }
  }

  // Créer un nouveau company
  static async createCompany(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const companyData = req.body;
      const companyId = await Company.create(companyData);
      
      // Récupérer le company créé
      const newCompany = await Company.findById(companyId);
      
      res.status(201).json({
        success: true,
        message: 'Company créé avec succès',
        data: newCompany
      });
    } catch (error) {
      console.error('Erreur lors de la création du company:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du company',
        error: error.message
      });
    }
  }

  // Mettre à jour un company
  static async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company non trouvé'
        });
      }
      
      await company.update(updateData);
      
      // Récupérer le company mis à jour
      const updatedCompany = await Company.findById(id);
      
      res.json({
        success: true,
        message: 'Company mis à jour avec succès',
        data: updatedCompany
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du company:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du company',
        error: error.message
      });
    }
  }

  // Désactiver un company
  static async deactivateCompany(req, res) {
    try {
      const { id } = req.params;
      
      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company non trouvé'
        });
      }
      
      await company.deactivate();
      
      res.json({
        success: true,
        message: 'Company désactivé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation du company:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la désactivation du company',
        error: error.message
      });
    }
  }

  // Supprimer un company
  static async deleteCompany(req, res) {
    try {
      const { id } = req.params;
      console.log('🗑️ Tentative de suppression du company ID:', id);
      
      const company = await Company.findById(id);
      if (!company) {
        console.log('❌ Company non trouvé avec ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Company non trouvé'
        });
      }
      
      await company.delete();
      res.json({
        success: true,
        message: 'Company supprimé avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du company:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du company',
        error: error.message
      });
    }
  }
}

module.exports = CompanyController;
