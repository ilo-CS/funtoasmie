import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Row, Col, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import PharmacistHeader from './PharmacistHeader';
import PharmacistSidebar from './PharmacistSidebar';

const PharmacistMedications = () => {
  const { logout } = useAuth();
  const currentSiteId = localStorage.getItem('currentSiteId');
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(!!currentSiteId);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentSiteId');
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Données factices pour l'instant
  useEffect(() => {
    const mockMedications = [
      {
        id: 1,
        name: 'Paracétamol 500mg',
        unit: 'comprimé',
        description: 'Antalgique et antipyrétique',
        stock: 150,
        min_stock: 50,
        max_stock: 300
      },
      {
        id: 2,
        name: 'Amoxicilline 1g',
        unit: 'comprimé',
        description: 'Antibiotique à large spectre',
        stock: 80,
        min_stock: 30,
        max_stock: 200
      }
    ];
    setMedications(mockMedications);
    setLoading(false);
  }, [currentSiteId]);

  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(query.toLowerCase())
  );

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

        {/* Medications Content */}
        <Container fluid className="py-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 text-success">Médicaments</h5>
            </Card.Header>
            <Card.Body>
              {!currentSiteId && (
                <Alert variant="warning" className="mb-3">Aucun site sélectionné.</Alert>
              )}

              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Control 
                    placeholder="Rechercher un médicament..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Col>
                <Col md={6} className="d-flex align-items-center">
                  <small className="text-muted">
                    {filteredMedications.length} médicament(s) trouvé(s)
                  </small>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Médicament</th>
                        <th>Description</th>
                        <th className="text-center">Stock actuel</th>
                        <th className="text-center">Stock min</th>
                        <th className="text-center">Stock max</th>
                        <th className="text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">Aucun résultat</td>
                        </tr>
                      ) : (
                        filteredMedications.map((medication) => (
                          <tr key={medication.id}>
                            <td>
                              <div>
                                <div className="fw-semibold">{medication.name}</div>
                                <small className="text-muted">{medication.unit}</small>
                              </div>
                            </td>
                            <td>{medication.description}</td>
                            <td className="text-center fw-bold">{medication.stock}</td>
                            <td className="text-center">{medication.min_stock}</td>
                            <td className="text-center">{medication.max_stock}</td>
                            <td className="text-center">
                              {medication.stock === 0 ? (
                                <Badge bg="danger">Rupture</Badge>
                              ) : medication.stock <= medication.min_stock ? (
                                <Badge bg="warning">Bas stock</Badge>
                              ) : (
                                <Badge bg="success">Normal</Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default PharmacistMedications;
