const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { HTTP_STATUS, MESSAGES } = require('../constants');
const { RoleService } = require('../services/roleService');
const Site = require('../models/Site');

const login = async (req, res) => {
  try {
    // Validation des données d'entrée
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Recherche de l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_CREDENTIALS
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_CREDENTIALS
      });
    }

    // Vérification du statut actif
    if (!user.is_active) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.ACCOUNT_DISABLED
      });
    }

    // Génération des tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Réponse de succès
    res.json({
      success: true,
      message: MESSAGES.SUCCESS.LOGIN,
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const { first_name, last_name, email, phone, password, role } = req.body;
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: MESSAGES.ERROR.USER_EXISTS
      });
    }

    const userId = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password,
      role: role || RoleService.getDefaultRole()
    });

    const newUser = await User.findById(userId);
    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.SUCCESS.REGISTER,
      data: {
        user: newUser.toJSON(),
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: MESSAGES.SUCCESS.LOGOUT
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Refresh token requis'
      });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    
    if (decoded.type !== 'refresh') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_TOKEN,
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND
      });
    }

    const newToken = generateToken(user);

    res.json({
      success: true,
      message: MESSAGES.SUCCESS.REFRESH,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.ERROR.INVALID_TOKEN,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userPayload = req.user.toJSON();

    // Récupération des sites autorisés
    // Hypothèse: en l'absence de table d'association utilisateur→site,
    // on renvoie les sites actifs. Vous pouvez affiner par rôle.
    let sites = [];
    try {
      sites = await Site.findActive();
      sites = sites.map((s) => s.toJSON());
    } catch (_) {
      sites = [];
    }

    res.json({
      success: true,
      data: {
        user: userPayload,
        sites
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  getProfile
};