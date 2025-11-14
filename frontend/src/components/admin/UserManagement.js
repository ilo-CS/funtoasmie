import React, { useState, useEffect } from 'react';
import {Container,Row,Col,Card,Table,Badge,Button,Spinner,Alert, Dropdown, Form} from 'react-bootstrap';
import Icon from '../common/Icons';
import AdminHeader from './AdminHeader';
import UserForm from './UserForm';
import UserDetails from './UserDetails';
import BulkActionConfirmation from './BulkActionConfirmation';
import { useRole } from '../../hooks/useRole';
import apiService from '../../services/api';
import { getRoleLabel, getRoleColor, ROLES } from '../../constants/roles';
import { formatDate } from '../../utils/dateFormatter';
import './UserManagement.css';

const UserManagement = () => {
  // ===== ÉTATS =====
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  
  // États pour les modales
  const [showUserForm, setShowUserForm] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // États pour les actions en lot
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkConfirmation, setShowBulkConfirmation] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState(null);
  
  // Hooks
  const { canManageUsers } = useRole();

  // ===== EFFETS =====
  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, searchRole, searchStatus]);

  // Effet pour gérer la sélection globale
  useEffect(() => {
    if (selectAll) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [selectAll, filteredUsers]);

  // Effet pour afficher/masquer les actions en lot
  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0);
  }, [selectedUsers]);

  // ===== FONCTIONS PRINCIPALES =====
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/admin/users');
      
      if (response.success) {
        setUsers(response.data.users);
        setTotalUsers(response.data.totalUsers);
      } else {
        setError(response.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrage par terme de recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        `${user.last_name}${user.first_name ? ` ${user.first_name}` : ''}`.toLowerCase().includes(term)
      );
    }

    // Filtrage par rôle
    if (searchRole) {
      filtered = filtered.filter(user => user.role === searchRole);
    }

    // Filtrage par statut
    if (searchStatus) {
      if (searchStatus === 'active') {
        filtered = filtered.filter(user => user.is_active === true || user.is_active === 1);
      } else if (searchStatus === 'inactive') {
        filtered = filtered.filter(user => user.is_active === false || user.is_active === 0);
      }
    }

    setFilteredUsers(filtered);
  };

  // ===== HANDLERS =====
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleRoleChange = (e) => setSearchRole(e.target.value);
  const handleStatusChange = (e) => setSearchStatus(e.target.value);
  const clearFilters = () => {
    setSearchTerm('');
    setSearchRole('');
    setSearchStatus('');
  };

  // Handlers pour les modales
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowUserForm(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      setFormLoading(true);
      const response = await apiService.delete(`/admin/users/${userId}`);
      
      if (response.success) {
        // Recharger la liste des utilisateurs
        await loadUsers();
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      setFormLoading(true);
      const response = await apiService.put(`/admin/users/${userId}`, {
        is_active: isActive
      });
      
      if (response.success) {
        // Recharger la liste des utilisateurs
        await loadUsers();
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setError('Erreur lors de la modification de l\'utilisateur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveUser = async (userData, userId) => {
    try {
      setFormLoading(true);
      let response;
      
      if (userId) {
        // Modification
        response = await apiService.put(`/admin/users/${userId}`, userData);
      } else {
        // Création
        response = await apiService.post('/admin/users', userData);
      }
      
      if (response.success) {
        // Recharger la liste des utilisateurs
        await loadUsers();
        setError(null);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return { success: false, message: error.message || 'Erreur lors de la sauvegarde' };
    } finally {
      setFormLoading(false);
    }
  };

  // ===== HANDLERS POUR LES ACTIONS EN LOT =====
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;

    if (action === 'export') {
      // Export des utilisateurs sélectionnés (pas de confirmation nécessaire)
      exportSelectedUsers();
      return;
    }

    // Pour les autres actions, afficher la confirmation
    setPendingBulkAction(action);
    setShowBulkConfirmation(true);
  };

  const confirmBulkAction = async () => {
    if (!pendingBulkAction) return;

    try {
      setBulkActionLoading(true);
      let response;

      switch (pendingBulkAction) {
        case 'activate':
          response = await apiService.put('/admin/users/bulk', {
            userIds: selectedUsers,
            action: 'activate'
          });
          break;
        case 'deactivate':
          response = await apiService.put('/admin/users/bulk', {
            userIds: selectedUsers,
            action: 'deactivate'
          });
          break;
        case 'delete':
          response = await apiService.delete('/admin/users/bulk', {
            data: { userIds: selectedUsers }
          });
          break;
        default:
          throw new Error('Action non reconnue');
      }

      if (response.success) {
        // Recharger la liste des utilisateurs
        await loadUsers();
        clearSelection();
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de l\'action en lot');
      }
    } catch (error) {
      console.error('Erreur lors de l\'action en lot:', error);
      setError('Erreur lors de l\'action en lot');
    } finally {
      setBulkActionLoading(false);
      setShowBulkConfirmation(false);
      setPendingBulkAction(null);
    }
  };

  const exportSelectedUsers = () => {
    const selectedUsersData = filteredUsers.filter(user => selectedUsers.includes(user.id));
    const csvContent = generateCSV(selectedUsersData);
    downloadCSV(csvContent, 'utilisateurs_selectionnes.csv');
  };

  const generateCSV = (users) => {
    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = users.map(user => [
      user.id,
      user.last_name,
      user.first_name || '',
      user.email,
      user.phone || '',
      getRoleLabel(user.role),
      user.is_active ? 'Actif' : 'Inactif',
      formatDate(user.created_at)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== RENDU PRINCIPAL =====
  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />
      
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="mb-1 text-primary">
                      <Icon name="users" size={24} className="me-2" />
                      Gestion des Utilisateurs
                    </h4>
                    <p className="text-muted mb-0">Gérez et administrez les utilisateurs du système FUNTOA-SMIE</p>
                  </div>
                  {canManageUsers() && (
                    <Button 
                      variant="primary" 
                      onClick={handleCreateUser}
                      className="d-flex align-items-center"
                    >
                      <Icon name="plus" size={16} className="me-2" />
                      Ajout d'un nouvel utilisateur
                    </Button>
                  )}
                </div>
              </Card.Header>
              
              <Card.Body className="p-4">
                {/* Barre de recherche */}
                {renderSearchBar()}
                
                {/* Actions en lot */}
                {showBulkActions && renderBulkActions()}
                
                {/* Tableau principal */}
                {renderMainTable()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modales */}
      <UserForm
        show={showUserForm}
        onHide={() => setShowUserForm(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        isEditing={isEditing}
        loading={formLoading}
      />

      <UserDetails
        show={showUserDetails}
        onHide={() => setShowUserDetails(false)}
        user={selectedUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleUserStatus}
      />

      <BulkActionConfirmation
        show={showBulkConfirmation}
        onHide={() => setShowBulkConfirmation(false)}
        onConfirm={confirmBulkAction}
        action={pendingBulkAction}
        selectedCount={selectedUsers.length}
        loading={bulkActionLoading}
      />
    </div>
  );

  // ===== FONCTIONS DE RENDU =====

  function renderSearchBar() {
    return (
      <div className="mb-4">
        <Row className="g-3">
          <Col md={5}>
            <div className="position-relative">
              <Icon name="search" size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </Col>
          <Col md={3}>
            <select
              className="form-select"
              value={searchRole}
              onChange={handleRoleChange}
            >
              <option value="">Tous les rôles</option>
              {Object.entries(ROLES).map(([key, value]) => (
                <option key={value} value={value}>
                  {getRoleLabel(value)}
                </option>
              ))}
            </select>
          </Col>
          <Col md={2}>
            <select
              className="form-select"
              value={searchStatus}
              onChange={handleStatusChange}
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </Col>
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={clearFilters}
              className="w-100"
            >
              <Icon name="times" size={14} className="me-1" />
              Effacer
            </Button>
          </Col>
        </Row>
      </div>
    );
  }

  function renderBulkActions() {
    return (
      <div className="bulk-actions-bar mb-4 p-3 bg-primary text-white rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Icon name="checkCircle" size={20} className="me-2" />
            <span className="fw-semibold">
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="d-flex gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => handleBulkAction('activate')}
              disabled={bulkActionLoading}
            >
              <Icon name="play" size={14} className="me-1" />
              Activer
            </Button>
            
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => handleBulkAction('deactivate')}
              disabled={bulkActionLoading}
            >
              <Icon name="pause" size={14} className="me-1" />
              Désactiver
            </Button>
            
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => handleBulkAction('export')}
              disabled={bulkActionLoading}
            >
              <Icon name="download" size={14} className="me-1" />
              Exporter
            </Button>
            
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={bulkActionLoading}
            >
              <Icon name="trash" size={14} className="me-1" />
              Supprimer
            </Button>
            
            <Button
              variant="outline-light"
              size="sm"
              onClick={clearSelection}
              disabled={bulkActionLoading}
            >
              <Icon name="times" size={14} className="me-1" />
              Annuler
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function renderMainTable() {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Liste des Utilisateurs</h5>
          <small className="text-muted">
            {renderUserCount()}
          </small>
        </div>
        
        {renderTableContent()}
      </div>
    );
  }

  function renderUserCount() {
    const count = filteredUsers.length;
    const total = totalUsers;
    const hasFilters = searchTerm || searchRole || searchStatus;
    
    return `${count} utilisateur${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''}${hasFilters ? ` sur ${total} au total` : ''}`;
  }

  function renderTableContent() {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();
    if (filteredUsers.length === 0) return renderEmptyState();
    return renderUsersTable();
  }

  function renderLoadingState() {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Chargement des utilisateurs...</p>
      </div>
    );
  }

  function renderErrorState() {
    return (
      <Alert variant="danger">
        <Icon name="exclamationTriangle" size={20} className="me-2" />
        {error}
      </Alert>
    );
  }

  function renderEmptyState() {
    const hasFilters = searchTerm || searchRole || searchStatus;
    
    return (
      <div className="text-center py-4">
        <Icon name="users" size={48} className="text-muted mb-3" />
        <h5 className="text-muted">
          {hasFilters ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
        </h5>
        <p className="text-muted">
          {hasFilters 
            ? 'Aucun utilisateur ne correspond à vos critères de recherche.' 
            : 'Commencez par ajouter un utilisateur.'
          }
        </p>
        {hasFilters && (
          <Button variant="outline-primary" onClick={clearFilters}>
            <Icon name="times" size={16} className="me-2" />
            Effacer les filtres
          </Button>
        )}
      </div>
    );
  }

  function renderUsersTable() {
    return (
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th width="50">
                <Form.Check
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={bulkActionLoading}
                />
              </th>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={selectedUsers.includes(user.id) ? 'table-primary' : ''}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    disabled={bulkActionLoading}
                  />
                </td>
                <td>{renderUserCell(user)}</td>
                <td>{renderEmailCell(user.email)}</td>
                <td>{renderPhoneCell(user.phone)}</td>
                <td>{renderRoleCell(user.role)}</td>
                <td>{renderStatusCell(user.is_active)}</td>
                <td>{renderDateCell(user.created_at)}</td>
                <td>{renderActionsCell(user)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  // ===== FONCTIONS DE RENDU DES CELLULES =====
  function renderUserCell(user) {
    return (
      <div className="d-flex align-items-center">
        <div 
          className="user-avatar me-3"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {user.last_name?.charAt(0)?.toUpperCase()}
          {user.first_name?.charAt(0)?.toUpperCase() || ''}
        </div>
        <div>
          <div className="fw-semibold">
            {user.last_name}{user.first_name ? ` ${user.first_name}` : ''}
          </div>
          <small className="text-muted">ID: {user.id}</small>
        </div>
      </div>
    );
  }

  function renderEmailCell(email) {
    return (
      <div className="text-truncate" style={{ maxWidth: '200px' }}>
        {email}
      </div>
    );
  }

  function renderPhoneCell(phone) {
    return phone || <span className="text-muted">Non renseigné</span>;
  }

  function renderRoleCell(role) {
    const roleInfo = getRoleInfo(role);
    
    return (
      <div className="role-cell">
        <div className="role-badge-container">
          <Badge 
            bg={roleInfo.color} 
            className={`role-badge role-badge-${roleInfo.type}`}
          >
            <Icon name={roleInfo.icon} size={12} className="me-1" />
            {roleInfo.label}
          </Badge>
        </div>
        <small className="role-description text-muted">
          {roleInfo.description}
        </small>
      </div>
    );
  }

  function getRoleInfo(role) {
    const roleInfoMap = {
      [ROLES.ADMIN]: {
        label: 'Administrateur',
        color: 'danger',
        type: 'admin',
        icon: 'shield',
        description: 'Accès complet'
      },
      [ROLES.ADMIN_PERSONNEL]: {
        label: 'Personnel d\'administration',
        color: 'dark',
        type: 'admin-personnel',
        icon: 'users',
        description: 'Gestion du personnel'
      },
      [ROLES.ADMIN_PHARMACIST]: {
        label: 'Administrateur Pharmacie',
        color: 'success',
        type: 'admin-pharmacist',
        icon: 'pills',
        description: 'Gestion pharmacie'
      },
      [ROLES.HEAD_DOCTOR]: {
        label: 'Chef Médecin',
        color: 'warning',
        type: 'head-doctor',
        icon: 'user-md',
        description: 'Supervision médicale'
      },
      [ROLES.DOCTOR]: {
        label: 'Médecin',
        color: 'warning',
        type: 'doctor',
        icon: 'stethoscope',
        description: 'Soins médicaux'
      },
      [ROLES.PHARMACIST]: {
        label: 'Pharmacien',
        color: 'success',
        type: 'pharmacist',
        icon: 'pills',
        description: 'Gestion médicaments'
      },
      [ROLES.RECEPTIONIST]: {
        label: 'Réceptionniste',
        color: 'info',
        type: 'receptionist',
        icon: 'desktop',
        description: 'Accueil patients'
      },
      [ROLES.NURSE]: {
        label: 'Infirmière',
        color: 'secondary',
        type: 'nurse',
        icon: 'heart',
        description: 'Soins infirmiers'
      },
      [ROLES.USER]: {
        label: 'Utilisateur',
        color: 'primary',
        type: 'user',
        icon: 'user',
        description: 'Accès standard'
      }
    };
    
    return roleInfoMap[role] || {
      label: role,
      color: 'light',
      type: 'unknown',
      icon: 'question',
      description: 'Rôle inconnu'
    };
  }

  function renderStatusCell(isActive) {
    return (
      <Badge 
        bg={isActive ? 'success' : 'secondary'}
        className="px-3 py-2"
      >
        {isActive ? 'Actif' : 'Inactif'}
      </Badge>
    );
  }

  function renderDateCell(dateString) {
    return (
      <small className="text-muted">
        {formatDate(dateString)}
      </small>
    );
  }

  function renderActionsCell(user) {
    return (
      <div className="d-flex justify-content-center">
        <Dropdown>
          <Dropdown.Toggle 
            variant="outline-secondary" 
            size="sm"
            title="Actions"
            className="kebab-menu-toggle"
          >
            <Icon name="ellipsis-vertical" size={16} />
          </Dropdown.Toggle>
          <Dropdown.Menu align="end" className="kebab-menu">
            <Dropdown.Item 
              onClick={() => handleViewUser(user)}
              className="text-primary"
            >
              <Icon name="eye" size={14} className="me-2" />
              Voir les détails
            </Dropdown.Item>
            
            {canManageUsers() && (
              <>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={() => handleEditUser(user)}
                  className="text-warning"
                >
                  <Icon name="edit" size={14} className="me-2" />
                  Modifier
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => handleToggleUserStatus(user.id, !user.is_active)}
                  className={user.is_active ? "text-warning" : "text-success"}
                >
                  <Icon name={user.is_active ? "pause" : "play"} size={14} className="me-2" />
                  {user.is_active ? 'Désactiver' : 'Activer'}
                </Dropdown.Item>
                
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-danger"
                >
                  <Icon name="trash" size={14} className="me-2" />
                  Supprimer
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
};

export default UserManagement;