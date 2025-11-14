import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icons';
import './PharmacistHeader.css';
import { authService } from '../../services/api';
import SiteService from '../../services/siteService';

const PharmacistHeader = ({ onToggleSidebar, onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getRoleLabel = (role) => {
    const roleLabels = {
      'pharmacist': 'Pharmacien',
      'admin pharmacist': 'Administrateur Pharmacie',
      'admin': 'Administrateur'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'pharmacist': 'success',
      'admin pharmacist': 'primary',
      'admin': 'danger'
    };
    return roleColors[role] || 'success';
  };

  const [siteName, setSiteName] = useState('');
  const [loadingSite, setLoadingSite] = useState(false);
  const [siteError, setSiteError] = useState('');

  useEffect(() => {
    const currentSiteId = localStorage.getItem('currentSiteId');
    const loadSiteName = async () => {
      if (!currentSiteId) {
        setSiteName('');
        return;
      }
      try {
        setSiteError('');
        setLoadingSite(true);
        const profile = await authService.getProfile();
        const sites = Array.isArray(profile?.sites) ? profile.sites : [];
        const match = sites.find((s) => String(s.id) === String(currentSiteId));
        if (match) {
          setSiteName(match.name || `Site ${currentSiteId}`);
          return;
        }
        try {
          const resp = await SiteService.getSiteById(currentSiteId);
          const data = resp?.data?.site || resp?.data || resp;
          if (data?.name) {
            setSiteName(data.name);
            return;
          }
        } catch (_) {}
        setSiteName(`Site ${currentSiteId}`);
      } catch (e) {
        setSiteError('');
      } finally {
        setLoadingSite(false);
      }
    };
    loadSiteName();
  }, []);

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="pharmacist-header shadow-sm border-bottom"
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

         {/* Site courant au centre */}
         <div className="mx-auto d-none d-lg-flex align-items-center">
           <div className="text-center">
             <div className="text-muted small">Site en cours</div>
             <h6 className="mb-0 text-success fw-bold" style={{ fontSize: '1.1rem' }}>
               {loadingSite ? (
                 <span className="d-inline-flex align-items-center"><Spinner size="sm" className="me-2" />Chargement...</span>
               ) : (
                 siteName || 'Aucun site sélectionné'
               )}
             </h6>
           </div>
         </div>

        {/* Actions et profil utilisateur */}
        <Nav className="ms-auto">
          {/* Notifications */}
          <Nav.Link href="/pharmacist/notifications" className="nav-link-custom me-2">
            <div className="position-relative">
              <Icon name="bell" size={18} />
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{ fontSize: '0.7rem' }}
              >
                2
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
                    background: 'linear-gradient(45deg, #198754, #20c997)',
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
            id="pharmacist-profile-dropdown"
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
                    background: 'linear-gradient(45deg, #198754, #20c997)',
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

export default PharmacistHeader;
