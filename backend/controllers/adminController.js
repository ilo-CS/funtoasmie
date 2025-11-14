const User = require('../models/User');
const { validationResult } = require('express-validator');
const { HTTP_STATUS, MESSAGES } = require('../constants');
const { RoleService } = require('../services/roleService');

const getAllUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = ''
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const pageNum = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limitNum = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;
    const offset = (pageNum - 1) * limitNum;

    let whereConditions = [];
    let queryParams = [];

    if (search && search.trim()) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (role && role !== 'all' && role.trim()) {
      if (RoleService.isValidRole(role)) {
        whereConditions.push('role = ?');
        queryParams.push(role);
      }
    }

    if (status && status !== 'all' && status.trim()) {
      if (status === 'active') {
        whereConditions.push('is_active = 1');
      } else if (status === 'inactive') {
        whereConditions.push('is_active = 0');
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total 
      FROM users 
      ${whereClause}
    `;
    
    const countResult = await User.query(countSql, queryParams);
    const totalUsers = countResult[0].total;

    const usersSql = `
      SELECT id, first_name, last_name, email, phone, role, is_active, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = await User.query(usersSql, [...queryParams, limitNum, offset]);
    
    const activeCountSql = `
      SELECT COUNT(*) as active 
      FROM users 
      WHERE is_active = 1
    `;
    const activeResult = await User.query(activeCountSql);
    const activeUsers = activeResult[0].active;

    const userObjects = users.map(userData => new User(userData));

    res.json({
      success: true,
      data: {
        users: userObjects.map(user => user.toJSON()),
        totalUsers,
        activeUsers,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR
    });
  }
};

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const { first_name, last_name, email, phone, password, role, is_active } = req.body;
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
      role: role || RoleService.getDefaultRole(),
      is_active: is_active !== undefined ? is_active : true
    });

    const newUser = await User.findById(userId);

    if (!newUser) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur créé'
      });
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.SUCCESS.REGISTER,
      data: {
        user: newUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR
    });
  }
};

const updateUser = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    // Vérifier si l'utilisateur existe (tous statuts)
    const user = await User.findByIdAnyStatus(id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: MESSAGES.ERROR.USER_EXISTS
        });
      }
    }

    // Mettre à jour l'utilisateur
    await user.update(updateData);

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findById(id);

    if (!updatedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND
      });
    }

    res.json({
      success: true,
      message: MESSAGES.SUCCESS.UPDATE,
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    // Vérifier si l'utilisateur existe (tous statuts)
    const user = await User.findByIdAnyStatus(id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND
      });
    }

    // Empêcher la suppression de l'utilisateur connecté
    if (parseInt(id) === req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    // Supprimer l'utilisateur (soft delete)
    await user.delete();

    res.json({
      success: true,
      message: MESSAGES.SUCCESS.DELETE
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id || isNaN(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Le statut doit être un booléen'
      });
    }

    // Vérifier si l'utilisateur existe (tous statuts)
    const user = await User.findByIdAnyStatus(id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND
      });
    }

    // Empêcher la désactivation de l'utilisateur connecté
    if (parseInt(id) === req.user.id && !is_active) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte'
      });
    }

    // Mettre à jour le statut
    await user.update({ is_active });

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findById(id);

    if (!updatedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.USER_NOT_FOUND
      });
    }

    res.json({
      success: true,
      message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`,
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ERROR.SERVER_ERROR
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
};
