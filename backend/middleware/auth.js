const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const { HTTP_STATUS, MESSAGES, TOKEN_TYPES } = require('../constants');
const { RoleService, ROLES } = require('../services/roleService');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_TOKEN,
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    if (decoded.type && decoded.type !== TOKEN_TYPES.ACCESS) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_TOKEN,
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND,
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.is_active) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.ACCOUNT_DISABLED,
        code: 'ACCOUNT_DISABLED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_TOKEN,
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.EXPIRED_TOKEN,
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token pas encore valide',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    console.error('Erreur d\'authentification:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR,
      code: 'AUTH_ERROR'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    const hasRequiredRole = RoleService.hasRole(req.user, roles);
    
    if (!hasRequiredRole) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.ERROR.ACCESS_DENIED + '. Rôle requis: ' + roles.join(' ou ')
      });
    }

    next();
  };
};

const requireAdmin = authorize(ROLES.ADMIN);

const requireEmployee = authorize(
  ROLES.USER, 
  ROLES.DOCTOR, 
  ROLES.RECEPTIONIST, 
  ROLES.NURSE, 
  ROLES.ADMIN
);

const requirePatient = authorize(
  ROLES.USER, 
  ROLES.DOCTOR, 
  ROLES.RECEPTIONIST, 
  ROLES.NURSE, 
  ROLES.PHARMACIST,
  ROLES.ADMIN
);

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role,
      type: TOKEN_TYPES.ACCESS
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      type: TOKEN_TYPES.REFRESH
    },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

module.exports = {
  authenticateToken,
  authorize,
  requireAdmin,
  requireEmployee,
  requirePatient,
  generateToken,
  generateRefreshToken
};
