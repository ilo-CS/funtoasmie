const Prescription = require('../models/Prescription');
const StockMovement = require('../models/StockMovement');
const SiteStock = require('../models/SiteStock');
const { HTTP_STATUS, MESSAGES } = require('../constants');

class PrescriptionController {
  
  /**
   * Créer une nouvelle prescription
   */
  static async createPrescription(req, res) {
    try {
      const prescriptionData = {
        ...req.body,
        pharmacist_id: req.user.id,
        site_id: req.user.current_site_id || req.body.site_id || req.headers['x-site-id']
      };


      const prescriptionId = await Prescription.create(prescriptionData);
      const prescription = await Prescription.findById(prescriptionId);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.CREATED,
        data: prescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création de la prescription:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer toutes les prescriptions
   */
  static async getAllPrescriptions(req, res) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query;
      const offset = (page - 1) * limit;

      const prescriptions = await Prescription.findAll(
        parseInt(limit), 
        parseInt(offset), 
        filters
      );

      res.json({
        success: true,
        data: prescriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: prescriptions.length
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des prescriptions:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer les prescriptions d'un site
   */
  static async getSitePrescriptions(req, res) {
    try {
      const { site_id } = req.params;
      const { page = 1, limit = 50, ...filters } = req.query;
      const offset = (page - 1) * limit;

      // Vérifier que l'utilisateur a accès à ce site
      if (req.user.role !== 'admin' && req.user.role !== 'admin pharmacist') {
        // Pour les pharmaciens, on vérifie s'ils ont un site courant défini
        // ou si le site_id correspond à un site auquel ils ont accès
        const currentSiteId = req.user.current_site_id || req.headers['x-site-id'];
        if (currentSiteId && parseInt(currentSiteId) !== parseInt(site_id)) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Accès non autorisé à ce site. Vous ne pouvez accéder qu\'aux prescriptions de votre site assigné.'
          });
        }
      }

      const prescriptions = await Prescription.findBySite(
        parseInt(site_id),
        parseInt(limit), 
        parseInt(offset), 
        filters
      );

      res.json({
        success: true,
        data: prescriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: prescriptions.length
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des prescriptions du site:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer les prescriptions d'un pharmacien
   */
  static async getPharmacistPrescriptions(req, res) {
    try {
      const { pharmacist_id } = req.params;
      const { page = 1, limit = 50, ...filters } = req.query;
      const offset = (page - 1) * limit;

      // Vérifier que l'utilisateur peut accéder à ces prescriptions
      if (req.user.id !== parseInt(pharmacist_id) && 
          req.user.role !== 'admin' && 
          req.user.role !== 'admin pharmacist') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à ces prescriptions'
        });
      }

      const prescriptions = await Prescription.findByPharmacist(
        parseInt(pharmacist_id),
        parseInt(limit), 
        parseInt(offset), 
        filters
      );

      res.json({
        success: true,
        data: prescriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: prescriptions.length
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des prescriptions du pharmacien:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer une prescription par ID
   */
  static async getPrescriptionById(req, res) {
    try {
      const { id } = req.params;
      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Vérifier que l'utilisateur peut accéder à cette prescription
      if (req.user.role !== 'admin' && req.user.role !== 'admin pharmacist') {
        const userSites = req.user.sites || [];
        if (!userSites.some(site => site.id === prescription.site_id) &&
            prescription.pharmacist_id !== req.user.id) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Accès non autorisé à cette prescription'
          });
        }
      }

      res.json({
        success: true,
        data: prescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la prescription:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Mettre à jour une prescription
   */
  static async updatePrescription(req, res) {
    try {
      const { id } = req.params;
      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Vérifier que l'utilisateur peut modifier cette prescription
      const currentSiteId = req.headers['x-site-id'];
      const canAccess = prescription.pharmacist_id === req.user.id || 
                       req.user.role === 'admin' || 
                       req.user.role === 'admin pharmacist' ||
                       (req.user.role === 'pharmacist' && currentSiteId && prescription.site_id == currentSiteId);
      
      if (!canAccess) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette prescription'
        });
      }

      // Ne pas permettre de modifier une prescription préparée
      if (prescription.status === 'PREPARED') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Impossible de modifier une prescription déjà préparée'
        });
      }

      await prescription.update(req.body);
      const updatedPrescription = await Prescription.findById(id);

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.UPDATED,
        data: updatedPrescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la prescription:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Marquer une prescription comme "en préparation"
   */
  static async markAsPreparing(req, res) {
    try {
      const { id } = req.params;
      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Vérifier que l'utilisateur peut modifier cette prescription
      const currentSiteId = req.headers['x-site-id'];
      const canAccess = prescription.pharmacist_id === req.user.id || 
                       req.user.role === 'admin' || 
                       req.user.role === 'admin pharmacist' ||
                       (req.user.role === 'pharmacist' && currentSiteId && prescription.site_id == currentSiteId);
      
      if (!canAccess) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette prescription'
        });
      }

      if (prescription.status !== 'PENDING') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Seules les prescriptions en attente peuvent être marquées comme en préparation'
        });
      }

      await prescription.markAsPreparing();
      const updatedPrescription = await Prescription.findById(id);

      res.json({
        success: true,
        message: 'Prescription marquée comme en préparation',
        data: updatedPrescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Marquer une prescription comme "préparée" et créer le mouvement de stock
   */
  static async markAsPrepared(req, res) {
    try {
      const { id } = req.params;
      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Vérifier que l'utilisateur peut modifier cette prescription
      // Un pharmacien peut finaliser une prescription si :
      // 1. Il a créé la prescription, OU
      // 2. Il est admin/admin pharmacist, OU  
      // 3. Il travaille sur le même site que la prescription
      const currentSiteId = req.headers['x-site-id'];
      const canAccess = prescription.pharmacist_id === req.user.id || 
                       req.user.role === 'admin' || 
                       req.user.role === 'admin pharmacist' ||
                       (req.user.role === 'pharmacist' && currentSiteId && prescription.site_id == currentSiteId);
      
      if (!canAccess) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette prescription'
        });
      }

      if (prescription.status !== 'PREPARING') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Seules les prescriptions en préparation peuvent être marquées comme préparées'
        });
      }

      // Vérifier le stock disponible pour tous les médicaments
      const stockMovements = [];
      
      for (const item of prescription.items || []) {
        const siteStock = await SiteStock.findBySiteAndMedication(
          prescription.site_id, 
          item.medication_id
        );

        if (!siteStock || siteStock.quantity < item.quantity) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `Stock insuffisant pour ${item.medication_name || 'un médicament'}. Disponible: ${siteStock?.quantity || 0}, Demandé: ${item.quantity}`
          });
        }

        // Créer le mouvement de stock OUT pour ce médicament
        const movementData = {
          medication_id: item.medication_id,
          movement_type: 'OUT',
          quantity: item.quantity,
          reference_type: 'PRESCRIPTION',
          reference_id: prescription.id,
          site_id: prescription.site_id,
          from_site_id: prescription.site_id,
          to_site_id: null,
          user_id: req.user.id,
          notes: `Dispensation prescription - Patient: ${prescription.patient_name} - ${item.medication_name || 'Médicament'}`
        };

        const movementId = await StockMovement.create(movementData);
        stockMovements.push(movementId);

        // Mettre à jour le stock du site pour ce médicament
        await SiteStock.updateQuantity(
          prescription.site_id,
          item.medication_id,
          siteStock.quantity - item.quantity
        );
      }

      // Marquer la prescription comme préparée
      await prescription.markAsPrepared();
      const updatedPrescription = await Prescription.findById(id);

      res.json({
        success: true,
        message: 'Prescription préparée avec succès',
        data: updatedPrescription,
        stock_movements: stockMovements
      });
    } catch (error) {
      console.error('❌ Erreur lors de la finalisation de la prescription:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Annuler une prescription
   */
  static async cancelPrescription(req, res) {
    try {
      const { id } = req.params;
      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Vérifier que l'utilisateur peut modifier cette prescription
      const currentSiteId = req.headers['x-site-id'];
      const canAccess = prescription.pharmacist_id === req.user.id || 
                       req.user.role === 'admin' || 
                       req.user.role === 'admin pharmacist' ||
                       (req.user.role === 'pharmacist' && currentSiteId && prescription.site_id == currentSiteId);
      
      if (!canAccess) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette prescription'
        });
      }

      if (prescription.status === 'PREPARED') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Impossible d\'annuler une prescription déjà préparée'
        });
      }

      await prescription.cancel();
      const updatedPrescription = await Prescription.findById(id);

      res.json({
        success: true,
        message: 'Prescription annulée',
        data: updatedPrescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la prescription:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Supprimer une prescription
   */
  static async deletePrescription(req, res) {
    try {
      const { id } = req.params;
      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Vérifier que l'utilisateur peut supprimer cette prescription
      if (prescription.pharmacist_id !== req.user.id && 
          req.user.role !== 'admin' && 
          req.user.role !== 'admin pharmacist') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette prescription'
        });
      }

      await prescription.delete();

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.DELETED
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la prescription:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer les statistiques des prescriptions
   */
  static async getPrescriptionStats(req, res) {
    try {
      const { site_id, date_from, date_to } = req.query;
      
      // Vérifier que l'utilisateur peut accéder à ces statistiques
      if (site_id && req.user.role !== 'admin' && req.user.role !== 'admin pharmacist') {
        const userSites = req.user.sites || [];
        if (!userSites.some(site => site.id === parseInt(site_id))) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Accès non autorisé à ce site'
          });
        }
      }

      const stats = await Prescription.getPrescriptionStats(
        site_id ? parseInt(site_id) : null,
        date_from,
        date_to
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = PrescriptionController;
