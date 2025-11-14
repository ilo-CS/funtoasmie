import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';
import AdminHeader from './AdminHeader';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { canManageUsers, canAccessReports, canAccessSettings } = useRole();

  const handleLogout = async () => {
    try {
      await logout();
      // La redirection se fait automatiquement via le contexte
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header Admin */}
      <AdminHeader />

      {/* Contenu principal */}
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h4 className="mb-1 text-primary">Tableau de bord Administrateur</h4>
                <p className="text-muted mb-0">Bienvenue dans l'interface d'administration de FUNTOA SMIE</p>
              </Card.Header>
              
              <Card.Body className="p-4">
                <h5 className="mb-4">Actions rapides</h5>
                <Row className="g-4">
                  {canManageUsers() && (
                    <>
                      <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm hover-card">
                          <Card.Body className="text-center p-4">
                            <div className="text-primary mb-3" style={{ fontSize: '3rem' }}>👥</div>
                            <h6 className="fw-bold">Gestion des utilisateurs</h6>
                            <p className="text-muted small">Gérer les utilisateurs du système</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm hover-card">
                          <Card.Body className="text-center p-4">
                            <div className="text-success mb-3" style={{ fontSize: '3rem' }}>➕</div>
                            <h6 className="fw-bold">Ajouter un utilisateur</h6>
                            <p className="text-muted small">Créer un nouvel utilisateur</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </>
                  )}
                  
                  {canAccessReports() && (
                    <Col md={4}>
                      <Card className="h-100 border-0 shadow-sm hover-card">
                        <Card.Body className="text-center p-4">
                          <div className="text-info mb-3" style={{ fontSize: '3rem' }}>📊</div>
                          <h6 className="fw-bold">Voir les rapports</h6>
                          <p className="text-muted small">Consulter les statistiques</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                  
                  {canAccessSettings() && (
                    <Col md={4}>
                      <Card className="h-100 border-0 shadow-sm hover-card">
                        <Card.Body className="text-center p-4">
                          <div className="text-warning mb-3" style={{ fontSize: '3rem' }}>⚙️</div>
                          <h6 className="fw-bold">Paramètres</h6>
                          <p className="text-muted small">Configurer le système</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
