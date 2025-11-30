import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Navbar, Nav, NavDropdown, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import ConsultationList from './ConsultationList';
import ConsultationForm from './ConsultationForm';
import MedicalPrescriptionList from './MedicalPrescriptionList';
import MedicalPrescriptionForm from './MedicalPrescriptionForm';
import consultationService from '../../services/consultationService';
import medicalPrescriptionService from '../../services/medicalPrescriptionService';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    consultations: { total: 0, completed: 0, cancelled: 0 },
    prescriptions: { total: 0, active: 0, fulfilled: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadStats();
    }
  }, [activeSection]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [consultationStats, prescriptionStats] = await Promise.all([
        consultationService.getConsultationStats({ doctor_id: user?.id }),
        medicalPrescriptionService.getPrescriptionStats({ doctor_id: user?.id })
      ]);

      if (consultationStats.success) {
        setStats(prev => ({
          ...prev,
          consultations: {
            total: consultationStats.data?.total_consultations || 0,
            completed: consultationStats.data?.completed_count || 0,
            cancelled: consultationStats.data?.cancelled_count || 0
          }
        }));
      }

      if (prescriptionStats.success) {
        setStats(prev => ({
          ...prev,
          prescriptions: {
            total: prescriptionStats.data?.total_prescriptions || 0,
            active: prescriptionStats.data?.active_count || 0,
            fulfilled: prescriptionStats.data?.fulfilled_count || 0
          }
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'consultations':
        return <ConsultationList />;
      case 'prescriptions':
        return <MedicalPrescriptionList />;
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h4 className="mb-1 text-danger">Tableau de bord Médecin</h4>
                <p className="text-muted mb-0">Bienvenue dans l'interface médicale de FUNTOA SMIE</p>
              </Card.Header>
              
              <Card.Body className="p-4">
                {/* Statistiques dash */}
                {loadingStats ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="warning" />
                  </div>
                ) : (
                  <Row className="mb-4">
                    <Col md={6}>
                      <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-success text-white">
                          <h5 className="mb-0">Consultations</h5>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col>
                              <div className="text-center">
                                <h3 className="text-success mb-1">{stats.consultations.total}</h3>
                                <small className="text-muted">Total</small>
                              </div>
                            </Col>
                            <Col>
                              <div className="text-center">
                                <h3 className="text-success mb-1">{stats.consultations.completed}</h3>
                                <small className="text-muted">Terminées</small>
                              </div>
                            </Col>
                            <Col>
                              <div className="text-center">
                                <h3 className="text-secondary mb-1">{stats.consultations.cancelled}</h3>
                                <small className="text-muted">Annulées</small>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-warning text-white">
                          <h5 className="mb-0">Ordonnances médicales</h5>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col>
                              <div className="text-center">
                                <h3 className="text-warning mb-1">{stats.prescriptions.total}</h3>
                                <small className="text-muted">Total</small>
                              </div>
                            </Col>
                            <Col>
                              <div className="text-center">
                                <h3 className="text-success mb-1">{stats.prescriptions.active}</h3>
                                <small className="text-muted">Actives</small>
                              </div>
                            </Col>
                            <Col>
                              <div className="text-center">
                                <h3 className="text-info mb-1">{stats.prescriptions.fulfilled}</h3>
                                <small className="text-muted">Remplies</small>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* Actions rapides */}
                <h5 className="mb-4">Actions rapides</h5>
                <Row className="g-4">
                  <Col md={3}>
                    <Card 
                      className="h-100 border-0 shadow-sm hover-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveSection('consultations')}
                    >
                      <Card.Body className="text-center p-4">
                        <div className="text-primary mb-3" style={{ fontSize: '3rem' }}>👥</div>
                        <h6 className="fw-bold">Gestion des patients</h6>
                        <p className="text-muted small">Consulter et gérer les dossiers patients</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3}>
                    <Card 
                      className="h-100 border-0 shadow-sm hover-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowConsultationForm(true)}
                    >
                      <Card.Body className="text-center p-4">
                        <div className="text-success mb-3" style={{ fontSize: '3rem' }}>🩺</div>
                        <h6 className="fw-bold">Nouvelle consultation</h6>
                        <p className="text-muted small">Créer une nouvelle consultation</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3}>
                    <Card 
                      className="h-100 border-0 shadow-sm hover-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowPrescriptionForm(true)}
                    >
                      <Card.Body className="text-center p-4">
                        <div className="text-warning mb-3" style={{ fontSize: '3rem' }}>📋</div>
                        <h6 className="fw-bold">Ordonnances</h6>
                        <p className="text-muted small">Rédiger des ordonnances médicales</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3}>
                    <Card 
                      className="h-100 border-0 shadow-sm hover-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveSection('consultations')}
                    >
                      <Card.Body className="text-center p-4">
                        <div className="text-info mb-3" style={{ fontSize: '3rem' }}>📊</div>
                        <h6 className="fw-bold">Rapports</h6>
                        <p className="text-muted small">Consulter les rapports médicaux</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header Médecin */}
      <Navbar bg="warning" variant="dark" expand="lg" className="shadow">
        <Container fluid>
          <Navbar.Brand className="fw-bold">
            <img 
              src="/logo.jpg" 
              alt="FUNTOA SMIE" 
              width="32" 
              height="32" 
              className="me-2 rounded"
            />
            FUNTOA SMIE - Médecin
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="doctor-navbar-nav" />
          
          <Navbar.Collapse id="doctor-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link 
                className={`text-white ${activeSection === 'dashboard' ? 'fw-bold' : ''}`}
                onClick={() => setActiveSection('dashboard')}
                style={{ cursor: 'pointer' }}
              >
                Tableau de bord
              </Nav.Link>
              <Nav.Link 
                className={`text-white ${activeSection === 'consultations' ? 'fw-bold' : ''}`}
                onClick={() => setActiveSection('consultations')}
                style={{ cursor: 'pointer' }}
              >
                Consultations
              </Nav.Link>
              <Nav.Link 
                className={`text-white ${activeSection === 'prescriptions' ? 'fw-bold' : ''}`}
                onClick={() => setActiveSection('prescriptions')}
                style={{ cursor: 'pointer' }}
              >
                Ordonnances
              </Nav.Link>
            </Nav>
            
            <Nav>
              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    <div 
                      className="bg-white text-danger rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ width: '32px', height: '32px', fontSize: '0.875rem', fontWeight: '600' }}
                    >
                      DR
                    </div>
                    <div className="d-none d-lg-block">
                      <div className="fw-medium text-white">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user?.name || 'Médecin'}
                      </div>
                    </div>
                  </div>
                }
                id="doctor-dropdown"
                align="end"
              >
                <NavDropdown.Header>
                  <div className="text-center">
                    <div className="fw-bold">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user?.name || 'Médecin'}
                    </div>
                    <small className="text-muted">{user?.email || 'medecin@funtoa.com'}</small>
                  </div>
                </NavDropdown.Header>
                <NavDropdown.Divider />
                <NavDropdown.Item>Mon profil</NavDropdown.Item>
                <NavDropdown.Item>Paramètres</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="text-danger" onClick={handleLogout}>Déconnexion</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Contenu principal */}
      {renderContent()}

      {/* Modals */}
      <ConsultationForm
        show={showConsultationForm}
        onHide={() => setShowConsultationForm(false)}
        onSuccess={() => {
          setShowConsultationForm(false);
          if (activeSection === 'dashboard') {
            loadStats();
          }
        }}
      />

      <MedicalPrescriptionForm
        show={showPrescriptionForm}
        onHide={() => setShowPrescriptionForm(false)}
        onSuccess={() => {
          setShowPrescriptionForm(false);
          if (activeSection === 'dashboard') {
            loadStats();
          }
        }}
      />
    </div>
  );
};

export default DoctorDashboard;
