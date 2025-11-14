import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import SiteService from '../../services/siteService';
import PharmacistHeader from './PharmacistHeader';
import PharmacistSidebar from './PharmacistSidebar';


const PharmacistDashboard = () => {
  const { logout } = useAuth();
  const currentSiteId = localStorage.getItem('currentSiteId');
  const [siteName, setSiteName] = useState('');
  const [loading, setLoading] = useState(!!currentSiteId);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Nettoyer le site courant lors de la déconnexion
      localStorage.removeItem('currentSiteId');
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const loadSiteName = async () => {
      if (!currentSiteId) {
        setSiteName('');
        return;
      }
      try {
        setError('');
        setLoading(true);
        // 1) Essayer via le profil enrichi (plus sûr pour les permissions pharmacien)
        const profile = await authService.getProfile();
        const sites = Array.isArray(profile?.sites) ? profile.sites : [];
        const match = sites.find((s) => String(s.id) === String(currentSiteId));
        if (match) {
          setSiteName(match.name || `Site ${currentSiteId}`);
          return;
        }
        // 2) Fallback: tenter un getSiteById (peut être restreint par rôles)
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
        setError("Impossible de récupérer le site courant");
      } finally {
        setLoading(false);
      }
    };
    loadSiteName();
  }, [currentSiteId]);

  return (
    <div className="pharmacist-dashboard">
      {/* Sidebar */}
      <PharmacistSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <PharmacistHeader 
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />

        {/* Dashboard Content */}
        <Container fluid className="py-4">
          <Card className="shadow-sm">
          <Card.Body className="p-4">
            {/* Actions rapides */}
            <h5 className="mb-4">Actions rapides</h5>
            <Row className="g-4">
              <Col md={4}>
                <Card className="h-100 hover-card border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <div className="text-success mb-2" style={{ fontSize: '2.25rem' }}>📦</div>
                    <h6 className="card-title">Inventaire du site</h6>
                    <p className="card-text text-muted small">Consulter les stocks disponibles</p>
                    <Button variant="success" size="sm" onClick={() => window.location.href = '/pharmacist/dashboard'} disabled>
                      Bientôt
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 hover-card border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <div className="text-primary mb-2" style={{ fontSize: '2.25rem' }}>📋</div>
                    <h6 className="card-title">Ordonnances</h6>
                    <p className="card-text text-muted small">Créer/traiter des prescriptions</p>
                    <Button variant="primary" size="sm" onClick={() => window.location.href = '/pharmacist/dashboard'} disabled>
                      Bientôt
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 hover-card border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <div className="text-warning mb-2" style={{ fontSize: '2.25rem' }}>⚠️</div>
                    <h6 className="card-title">Alertes</h6>
                    <p className="card-text text-muted small">Bas stock, expirations</p>
                    <Button variant="warning" size="sm" onClick={() => window.location.href = '/pharmacist/dashboard'} disabled>
                      Bientôt
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* KPIs simples */}
            <Row className="g-3 mt-4">
              <Col md={3}>
                <Card className="text-center border-0 bg-success text-white">
                  <Card.Body className="py-3">
                    <h3 className="mb-1">--</h3>
                    <small>Médicaments dispo</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 bg-warning text-white">
                  <Card.Body className="py-3">
                    <h3 className="mb-1">--</h3>
                    <small>Bas stock</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 bg-danger text-white">
                  <Card.Body className="py-3">
                    <h3 className="mb-1">--</h3>
                    <small>Expirés</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 bg-info text-white">
                  <Card.Body className="py-3">
                    <h3 className="mb-1">--</h3>
                    <small>Mouvements ajd</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default PharmacistDashboard;


