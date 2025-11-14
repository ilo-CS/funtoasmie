import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icons';
import './AdminPharmacistHeader.css';

const AdminPharmacistHeader = ({ onToggleSidebar, onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getRoleLabel = (role) => {
    const roleLabels = {
      'admin pharmacist': 'Administrateur Pharmacie',
      'admin': 'Administrateur',
      'pharmacist': 'Pharmacien'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'admin pharmacist': 'primary',
      'admin': 'danger',
      'pharmacist': 'primary'
    };
    return roleColors[role] || 'primary';
  };

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="admin-pharmacist-header shadow-sm border-bottom"
      style={{ 
        minHeight: '70px',
        position: 'sticky',
        top: 0,
        zIndex: 1030
      }}
    >
      <Container fluid>
        {/* Bouton menu pour mobile */}
        <button 
          className="sidebar-toggle-btn d-lg-none me-3"
          onClick={onToggleSidebar}
        >
          <Icon name="bars" size={20} />
        </button>

         {/* Slogan central */}
         <div className="mx-auto d-none d-lg-flex align-items-center">
           <div className="text-center">
             <h6 className="mb-0 text-primary fw-bold" style={{ fontSize: '1.1rem' }}>
               Santé et sécurité : main dans la main vers le succès
             </h6>
           </div>
         </div>

        {/* Actions et profil utilisateur */}
        <Nav className="ms-auto">
          {/* Notifications */}
          <Nav.Link href="/admin-pharmacist/notifications" className="nav-link-custom me-2">
            <div className="position-relative">
              <Icon name="bell" size={18} />
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{ fontSize: '0.7rem' }}
              >
                3
              </Badge>
            </div>
          </Nav.Link>

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
                    background: 'linear-gradient(45deg, #1e3a8a,rgb(24, 55, 104))',
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
            id="admin-pharmacist-profile-dropdown"
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
                    background: 'linear-gradient(45deg, #1e3a8a,rgb(16, 50, 105))',
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
            <NavDropdown.Item as="div" className="dropdown-item-custom">
              <Icon name="cog" size={16} className="me-2" />
              Paramètres
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item 
              as="div"
              onClick={onLogout}
              className="dropdown-item-custom text-danger"
              style={{ cursor: 'pointer' }}
            >
              <Icon name="signOut" size={16} className="me-2" />
              Déconnexion
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminPharmacistHeader;
