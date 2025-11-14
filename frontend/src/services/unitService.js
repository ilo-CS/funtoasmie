import api from './api';

const UnitService = {
  // Récupérer toutes les unités
  async getAllUnits() {
    try {
      const response = await api.get('/units');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des unités:', error);
      throw error;
    }
  }
};

export default UnitService;
