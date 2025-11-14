import React from 'react';
import { Nav } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../common/Icons';
import './PharmacistSidebar.css';

const PharmacistSidebar = ({ isOpen, onToggle, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'home',
      href: '/pharmacist/dashboard',
      active: location.pathname === '/pharmacist/dashboard'
    },
    {
      id: 'inventory',
      label: 'Inventaire',
      icon: 'warehouse',
      href: '/pharmacist/inventory',
      active: location.pathname === '/pharmacist/inventory'
    },
    {
      id: 'prescriptions',
      label: 'Ordonnances',
      icon: 'file-medical',
      href: '/pharmacist/prescriptions',
      active: location.pathname === '/pharmacist/prescriptions'
    },
    {
      id: 'stock-movements',
      label: 'Mouvements',
      icon: 'exchange-alt',
      href: '/pharmacist/movements',
      active: location.pathname === '/pharmacist/movements'
    },
    {
      id: 'alerts',
      label: 'Alertes',
      icon: 'exclamation-triangle',
      href: '/pharmacist/alerts',
      active: location.pathname === '/pharmacist/alerts'
    }
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay d-lg-none"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`pharmacist-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header du sidebar */}
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <div className="logo-container me-3">
              <img
                src="/logo.jpg"
                alt="FUNTOA SMIE"
                className="sidebar-logo"
              />
            </div>
            <div className="brand-text">
              <h6 className="mb-0 fw-bold text-white">FUNTOA SMIE</h6>
              <small className="text-light">Pharmacie</small>
            </div>
          </div>
          
          {/* Bouton fermer pour mobile */}
          <button 
            className="sidebar-close-btn d-lg-none"
            onClick={onToggle}
          >
            <Icon name="times" size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <Nav className="flex-column">
            {menuItems.map((item) => {
              if (item.show === false) return null;
              
              return (
                <Nav.Item key={item.id}>
                  <Nav.Link 
                    onClick={() => navigate(item.href)}
                    className={`sidebar-nav-link ${item.active ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <Icon name={item.icon} size={18} className="me-3" />
                    {item.label}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </div>

        {/* Footer du sidebar */}
        <div className="sidebar-footer">
          <div className="text-center">
            <small className="text-light">© 2025 FUNTOA SMIE</small> <small className="text-light" style={{ opacity: 0.7 }}>Version 1.0.0</small>
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacistSidebar;
