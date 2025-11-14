const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const { authenticateToken, authorize } = require('../middleware/auth');
const { ROLES } = require('../services/roleService');

router.use(authenticateToken);
router.use(authorize(ROLES.ADMIN, ROLES.ADMIN_PHARMACIST));

router.get('/', async (req, res) => {
  try {
    const units = await Unit.findAll();
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des unités:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des unités',
      error: error.message
    });
  }
});

module.exports = router;
