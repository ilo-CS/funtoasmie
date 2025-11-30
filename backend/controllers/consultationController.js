const Consultation = require('../models/Consultation');
const { HTTP_STATUS, MESSAGES } = require('../constants');

class ConsultationController {
  
  /**
   * Créer une nouvelle consultation
   */
  static async createConsultation(req, res) {
    try {
      const consultationData = {
        ...req.body,
        doctor_id: req.user.id,
        site_id: req.user.current_site_id || req.body.site_id || req.headers['x-site-id']
      };

      const consultationId = await Consultation.create(consultationData);
      const consultation = await Consultation.findById(consultationId);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.CREATED || 'Consultation créée avec succès',
        data: consultation
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création de la consultation:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer toutes les consultations
   */
  static async getAllConsultations(req, res) {
    try {
      const { page = 1, limit = 50, ...filters } = req.query;
      const offset = (page - 1) * limit;

      // Pour les docteurs non-admin, filtrer par leur ID
      if (req.user.role === 'doctor' || req.user.role === 'head doctor') {
        filters.doctor_id = req.user.id;
      }

      const consultations = await Consultation.findAll(
        parseInt(limit), 
        parseInt(offset), 
        filters
      );

      res.json({
        success: true,
        data: consultations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: consultations.length
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des consultations:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR || 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer les consultations d'un docteur
   */
  static async getDoctorConsultations(req, res) {
    try {
      const { doctor_id } = req.params;
      const { page = 1, limit = 50, ...filters } = req.query;
      const offset = (page - 1) * limit;

      // Vérifier que l'utilisateur peut accéder à ces consultations
      if (req.user.id !== parseInt(doctor_id) && 
          req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à ces consultations'
        });
      }

      const consultations = await Consultation.findByDoctor(
        parseInt(doctor_id),
        parseInt(limit), 
        parseInt(offset), 
        filters
      );

      res.json({
        success: true,
        data: consultations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: consultations.length
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des consultations du docteur:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR || 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer une consultation par ID
   */
  static async getConsultationById(req, res) {
    try {
      const { id } = req.params;
      const consultation = await Consultation.findById(id);

      if (!consultation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Consultation non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut accéder à cette consultation
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor' &&
          consultation.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette consultation'
        });
      }

      res.json({
        success: true,
        data: consultation
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la consultation:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR || 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Mettre à jour une consultation
   */
  static async updateConsultation(req, res) {
    try {
      const { id } = req.params;
      const consultation = await Consultation.findById(id);

      if (!consultation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Consultation non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut modifier cette consultation
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor' &&
          consultation.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette consultation'
        });
      }

      await consultation.update(req.body);
      const updatedConsultation = await Consultation.findById(id);

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.UPDATED || 'Consultation mise à jour avec succès',
        data: updatedConsultation
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la consultation:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Annuler une consultation
   */
  static async cancelConsultation(req, res) {
    try {
      const { id } = req.params;
      const consultation = await Consultation.findById(id);

      if (!consultation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Consultation non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut annuler cette consultation
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          req.user.role !== 'head doctor' &&
          consultation.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette consultation'
        });
      }

      await consultation.cancel();
      const updatedConsultation = await Consultation.findById(id);

      res.json({
        success: true,
        message: 'Consultation annulée',
        data: updatedConsultation
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la consultation:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Supprimer une consultation
   */
  static async deleteConsultation(req, res) {
    try {
      const { id } = req.params;
      const consultation = await Consultation.findById(id);

      if (!consultation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND || 'Consultation non trouvée'
        });
      }

      // Vérifier que l'utilisateur peut supprimer cette consultation
      if (req.user.role !== 'admin' && 
          req.user.role !== 'admin personnel' &&
          consultation.doctor_id !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Accès non autorisé à cette consultation'
        });
      }

      await consultation.delete();

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.DELETED || 'Consultation supprimée avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la consultation:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Récupérer les statistiques des consultations
   */
  static async getConsultationStats(req, res) {
    try {
      const { site_id, date_from, date_to } = req.query;
      
      // Pour les docteurs non-admin, utiliser leur ID
      let doctor_id = null;
      if (req.user.role === 'doctor' || req.user.role === 'head doctor') {
        doctor_id = req.user.id;
      } else if (req.query.doctor_id) {
        doctor_id = parseInt(req.query.doctor_id);
      }

      const stats = await Consultation.getConsultationStats(
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

module.exports = ConsultationController;

