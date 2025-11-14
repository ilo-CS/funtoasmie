import React from 'react';
import { Container, Row, Col, Card, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header Utilisateur */}
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
        <Container fluid>
          <Navbar.Brand className="fw-bold">
            <img 
              src="/logo.jpg" 
              alt="FUNTOA SMIE" 
              width="32" 
              height="32" 
              className="me-2 rounded"
            />
            FUNTOA SMIE
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="user-navbar-nav" />
          
          <Navbar.Collapse id="user-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link className="text-white">Tableau de bord</Nav.Link>
              <Nav.Link className="text-white">Mes rendez-vous</Nav.Link>
              <Nav.Link className="text-white">Mon dossier</Nav.Link>
            </Nav>
            
            <Nav>
              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    <div 
                      className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ width: '32px', height: '32px', fontSize: '0.875rem', fontWeight: '600' }}
                    >
                      US
                    </div>
                    <div className="d-none d-lg-block">
                      <div className="fw-medium text-white">{user?.name || 'Utilisateur'}</div>
                    </div>
                  </div>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Header>
                  <div className="text-center">
                    <div className="fw-bold">{user?.name || 'Utilisateur'}</div>
                    <small className="text-muted">{user?.email || 'user@funtoa.com'}</small>
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
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h4 className="mb-1 text-primary">Tableau de bord Utilisateur</h4>
                <p className="text-muted mb-0">Bienvenue dans votre espace personnel FUNTOA SMIE</p>
              </Card.Header>
              
              <Card.Body className="p-4">
                <h5 className="mb-4">Services disponibles</h5>
                <Row className="g-4">
                  <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <Card.Body className="text-center p-4">
                        <div className="text-primary mb-3" style={{ fontSize: '3rem' }}>📅</div>
                        <h6 className="fw-bold">Prendre rendez-vous</h6>
                        <p className="text-muted small">Réserver un rendez-vous médical</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <Card.Body className="text-center p-4">
                        <div className="text-success mb-3" style={{ fontSize: '3rem' }}>📋</div>
                        <h6 className="fw-bold">Mon dossier médical</h6>
                        <p className="text-muted small">Consulter votre dossier médical</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <Card.Body className="text-center p-4">
                        <div className="text-info mb-3" style={{ fontSize: '3rem' }}>💊</div>
                        <h6 className="fw-bold">Ordonnances</h6>
                        <p className="text-muted small">Consulter vos ordonnances</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserDashboard;
