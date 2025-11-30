const MedicalPrescription = require('../models/MedicalPrescription');
const { HTTP_STATUS, MESSAGES } = require('../constants');

class MedicalPrescriptionController {
  
  /**
   * Créer une nouvelle ordonnance médicale
   */
  static async createPrescription(req, res) {
    try {
      const prescriptionData = {
        ...req.body,
        doctor_id: req.user.id,
        site_id: req.user.current_site_id || req.body.site_id || req.headers['x-site-id']
      };

      const prescriptionId = await MedicalPrescription.create(prescriptionData);
      const prescription = await MedicalPrescription.findById(prescriptionId);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.CREATED || 'Ordonnance médicale créée avec succès',
        data: prescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'ordonnance médicale:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer toutes les ordonnances médicales
   */
  static async getAllPrescriptions(req, res) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query;
      const offset = (page - 1) * limit;

      // Pour les docteurs non-admin, filtrer par leur ID
      if (req.user.role === 'doctor' || req.user.role === 'head doctor') {
        filters.doctor_id = req.user.id;
      }

      const prescriptions = await MedicalPrescription.findAll(
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
      console.error('❌ Erreur lors de la récupération des ordonnances médicales:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR || 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer les ordonnances médicales d'un docteur
   */
  static async getDoctorPrescriptions(req, res) {
    try {
      const { doctor_id } = req.params;
      const { page = 1, limit = 50, ...filters } = req.query;
      const offset = (page - 1) * limit;

      // Vérifier que l'utilisateur peut accéder à ces ordonnances
      if (req.user.id !== parseInt(doctor_id) && 
          req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à ces ordonnances médicales'
        });
      }

      const prescriptions = await MedicalPrescription.findByDoctor(
        parseInt(doctor_id),
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
      console.error('❌ Erreur lors de la récupération des ordonnances médicales du docteur:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR || 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer une ordonnance médicale par ID
   */
  static async getPrescriptionById(req, res) {
    try {
      const { id } = req.params;
      const prescription = await MedicalPrescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Ordonnance médicale non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut accéder à cette ordonnance
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor' &&
          prescription.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette ordonnance médicale'
        });
      }

      res.json({
        success: true,
        data: prescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'ordonnance médicale:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR || 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Mettre à jour une ordonnance médicale
   */
  static async updatePrescription(req, res) {
    try {
      const { id } = req.params;
      const prescription = await MedicalPrescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Ordonnance médicale non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut modifier cette ordonnance
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor' &&
          prescription.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette ordonnance médicale'
        });
      }

      // Ne pas permettre de modifier une ordonnance remplie ou annulée
      if (prescription.status === 'FULFILLED') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Impossible de modifier une ordonnance déjà remplie'
        });
      }

      await prescription.update(req.body);
      const updatedPrescription = await MedicalPrescription.findById(id);

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.UPDATED || 'Ordonnance médicale mise à jour avec succès',
        data: updatedPrescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'ordonnance médicale:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Annuler une ordonnance médicale
   */
  static async cancelPrescription(req, res) {
    try {
      const { id } = req.params;
      const prescription = await MedicalPrescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Ordonnance médicale non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut annuler cette ordonnance
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor' &&
          prescription.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette ordonnance médicale'
        });
      }

      if (prescription.status === 'FULFILLED') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Impossible d\'annuler une ordonnance déjà remplie'
        });
      }

      await prescription.cancel();
      const updatedPrescription = await MedicalPrescription.findById(id);

      res.json({
        success: true,
        message: 'Ordonnance médicale annulée',
        data: updatedPrescription
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de l\'ordonnance médicale:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Supprimer une ordonnance médicale
   */
  static async deletePrescription(req, res) {
    try {
      const { id } = req.params;
      const prescription = await MedicalPrescription.findById(id);

      if (!prescription) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Ordonnance médicale non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut supprimer cette ordonnance
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          prescription.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette ordonnance médicale'
        });
      }

      // Ne pas permettre de supprimer une ordonnance remplie
      if (prescription.status === 'FULFILLED') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Impossible de supprimer une ordonnance déjà remplie'
        });
      }

      await prescription.delete();

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.DELETED || 'Ordonnance médicale supprimée avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'ordonnance médicale:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer les statistiques des ordonnances médicales
   */
  static async getPrescriptionStats(req, res) {
    try {
      const { site_id, date_from, date_to } = req.query;
      
      // Pour les docteurs non-admin, utiliser leur ID
      let doctor_id = null;
      if (req.user.role === 'doctor' || req.user.role === 'head doctor') {
        doctor_id = req.user.id;
      } else if (req.query.doctor_id) {
        doctor_id = parseInt(req.query.doctor_id);
      }

      const stats = await MedicalPrescription.getPrescriptionStats(
        doctor_id,
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
        message: MESSAGES.ERROR.SERVER_ERROR || 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = MedicalPrescriptionController;

