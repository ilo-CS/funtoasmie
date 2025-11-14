import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';
import Icon from '../common/Icons';
import './AdminHeader.css';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const { canManageUsers, canManageCompany, canAccessReports, canAccessSettings } = useRole();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'Administrateur',
      user: 'Utilisateur',
      doctor: 'Médecin',
      pharmacist: 'Pharmacienne',
      receptionist: 'Réceptionniste',
      nurse: 'Infirmière'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role) => {
    const roleColors = {
      admin: 'danger',
      user: 'primary',
      doctor: 'warning',
      pharmacist: 'success',
      receptionist: 'info',
      nurse: 'secondary'
    };
    return roleColors[role] || 'primary';
  };

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="admin-header shadow-sm border-bottom"
      style={{ 
        minHeight: '70px',
        position: 'sticky',
        top: 0,
        zIndex: 1030
      }}
    >
      <Container fluid>
        {/* Logo et Titre */}
        <Navbar.Brand href="/admin" className="d-flex align-items-center">
          <div className="logo-container me-3">
            <img
              src="/logo.jpg"
              alt="FUNTOA SMIE"
              className="admin-logo"
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                border: '2px solid #e9ecef',
                objectFit: 'cover'
              }}
            />
          </div>
          <div className="brand-text">
            <h5 className="mb-0 fw-bold text-primary">FUNTOA SMIE</h5>
          </div>
        </Navbar.Brand>

        {/* Toggle pour mobile */}
        <Navbar.Toggle 
          aria-controls="admin-navbar" 
          className="border-0"
          style={{ boxShadow: 'none' }}
        >
          <Icon name="bars" size={20} />
        </Navbar.Toggle>

        <Navbar.Collapse id="admin-navbar">
          {/* Navigation Centrale */}
          <Nav className="mx-auto">
            <Nav.Link href="/admin" className="nav-link-custom">
              <Icon name="home" size={16} className="me-2" />
              Tableau de bord
            </Nav.Link>
            
            {canManageUsers() && (
              <Nav.Link href="/admin/users" className="nav-link-custom">
                <Icon name="users" size={16} className="me-2" />
                Gestion des Utilisateurs
              </Nav.Link>
            )}
            
            {canManageCompany() && (
              <Nav.Link href="/admin/company" className="nav-link-custom">
                <Icon name="company" size={16} className="me-2" />
                Gestion des sociétés
              </Nav.Link>
            )}
            
            {canAccessReports() && (
              <Nav.Link href="/admin/reports" className="nav-link-custom">
                <Icon name="chartBar" size={16} className="me-2" />
                Rapports
              </Nav.Link>
            )}
            
            {canAccessSettings() && (
              <Nav.Link href="/admin/settings" className="nav-link-custom">
                <Icon name="cog" size={16} className="me-2" />
                Paramètres
              </Nav.Link>
            )}
          </Nav>

          {/* Profil Utilisateur et Actions */}
          <Nav className="ms-auto">

            {/* Profil Dropdown */}
            <NavDropdown
              title={
                <div className="d-flex align-items-center">
                  <div 
                    className="user-avatar me-2"
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    {user?.last_name?.charAt(0)?.toUpperCase()}
                    {user?.first_name?.charAt(0)?.toUpperCase() || ''}
                  </div>
                  <div className="user-info d-none d-md-block">
                    <div className="fw-semibold text-dark">
                      {user?.last_name}{user?.first_name ? ` ${user?.first_name}` : ''}
                    </div>
                    <small className="text-muted">
                      {getRoleLabel(user?.role)}
                    </small>
            </div>
                </div>
              }
              id="admin-profile-dropdown"
              className="profile-dropdown"
              align="end"
            >
              {/* En-tête du dropdown */}
              <NavDropdown.Header className="dropdown-header bg-light">
                <div className="d-flex align-items-center">
                  <div 
                    className="user-avatar-large me-3"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    {user?.last_name?.charAt(0)?.toUpperCase()}
                    {user?.first_name?.charAt(0)?.toUpperCase() || ''}
                  </div>
                  <div>
                    <div className="fw-bold text-dark">
                      {user?.last_name}{user?.first_name ? ` ${user?.first_name}` : ''}
                </div>
                    <div className="text-muted small">
                      {user?.email}
                </div>
                    <Badge 
                      bg={getRoleColor(user?.role)}
                      className="mt-1"
                    >
                      {getRoleLabel(user?.role)}
                    </Badge>
              </div>
                </div>
              </NavDropdown.Header>

              {/* Actions du profil */}
              <NavDropdown.Item as="div" className="dropdown-item-custom">
                <Icon name="user" size={16} className="me-2" />
                Mon Profil
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item 
                as="div"
                onClick={handleLogout}
                className="dropdown-item-custom text-danger"
                style={{ cursor: 'pointer' }}
              >
                <Icon name="signOut" size={16} className="me-2" />
                Déconnexion
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminHeader;
