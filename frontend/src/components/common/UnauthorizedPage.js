import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from './Icons';

/**
 * Page d'erreur 403 - Accès non autorisé
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    // Rediriger vers la page d'accueil selon le rôle
    const redirectUrl = user?.role ? 
      (user.role === 'admin' ? '/admin' : `/${user.role}`) : 
      '/login';
    navigate(redirectUrl);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="text-center p-5">
                {/* Icône d'erreur */}
                <div className="mb-4">
                  <div 
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                      color: 'white',
                      fontSize: '3rem'
                    }}
                  >
                    <Icon name="exclamationTriangle" size={60} />
                  </div>
                </div>

                {/* Titre */}
                <h1 className="display-4 fw-bold text-danger mb-3">
                  Accès Refusé
                </h1>

                {/* Sous-titre */}
                <h2 className="h4 text-muted mb-4">
                  Erreur 403 - Accès Non Autorisé
                </h2>

                {/* Message d'explication */}
                <div className="mb-4">
                  <p className="lead text-muted mb-3">
                    Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
                  </p>
                  
                  {user && (
                    <div className="alert alert-info border-0">
                      <div className="d-flex align-items-center">
                        <Icon name="infoCircle" size={20} className="me-2" />
                        <div>
                          <strong>Votre rôle actuel :</strong> {user.role}
                          <br />
                          <small className="text-muted">
                            Contactez votre administrateur si vous pensez que c'est une erreur.
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleGoHome}
                    className="px-4 py-3"
                  >
                    <Icon name="home" size={18} className="me-2" />
                    Retour à l'accueil
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={handleLogout}
                    className="px-4 py-3"
                  >
                    <Icon name="signOut" size={18} className="me-2" />
                    Se déconnecter
                  </Button>
                </div>

                {/* Informations supplémentaires */}
                <div className="mt-5 pt-4 border-top">
                  <small className="text-muted">
                    Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur système.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UnauthorizedPage;
