import React, { useState, useEffect } from 'react';
import {Container,Row,Col,Card,Alert,Spinner,Table,Form,Button,Badge,Modal,InputGroup} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AdminPharmacistSidebar from './AdminPharmacistSidebar';
import AdminPharmacistHeader from './AdminPharmacistHeader';
import Icon from '../common/Icons';
import StockService from '../../services/stockService';
import SiteService from '../../services/siteService';
import MedicationService from '../../services/medicationService';
import './StockMovements.css';

const StockMovements = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movements, setMovements] = useState([]);
  const [sites, setSites] = useState([]);
  const [medications, setMedications] = useState([]);
  const [filters, setFilters] = useState({
    medication_id: '',
    site_id: '',
    movement_type: '',
    reference_type: '',
    date_from: '',
    date_to: ''
  });
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (sites.length > 0 || medications.length > 0) {
      loadMovements();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sitesResponse, medicationsResponse] = await Promise.all([
        SiteService.getAllSites(),
        MedicationService.getAllMedications()
      ]);

      if (sitesResponse.success) {
        setSites(sitesResponse.data);
      }

      if (medicationsResponse.success) {
        setMedications(medicationsResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    try {
      const response = await StockService.getStockMovements(filters);
      if (response.success) {
        setMovements(response.data);
        
        // Charger le résumé si on a des filtres
        if (filters.medication_id || filters.site_id) {
          const summaryResponse = await StockService.getMovementSummary(
            filters.medication_id || null,
            filters.site_id || null,
            filters.date_from || null,
            filters.date_to || null
          );
          if (summaryResponse.success) {
            setSummary(summaryResponse.data);
          }
        } else {
          setSummary(null);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      medication_id: '',
      site_id: '',
      movement_type: '',
      reference_type: '',
      date_from: '',
      date_to: ''
    });
  };

  const handleMovementClick = (movement) => {
    setSelectedMovement(movement);
    setShowDetailModal(true);
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case 'IN': return 'success';
      case 'OUT': return 'danger';
      case 'TRANSFER_IN': return 'info';
      case 'TRANSFER_OUT': return 'warning';
      case 'ADJUSTMENT': return 'secondary';
      default: return 'primary';
    }
  };

  const getMovementTypeIcon = (type) => {
    switch (type) {
      case 'IN': return 'arrow-up';
      case 'OUT': return 'arrow-down';
      case 'TRANSFER_IN': return 'arrow-up';
      case 'TRANSFER_OUT': return 'arrow-down';
      case 'ADJUSTMENT': return 'exchange-alt';
      default: return 'exchange-alt';
    }
  };

  const getReferenceTypeColor = (type) => {
    switch (type) {
      case 'DISTRIBUTION': return 'primary';
      case 'ORDER': return 'success';
      case 'ADJUSTMENT': return 'warning';
      case 'TRANSFER': return 'info';
      default: return 'secondary';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-pharmacist-dashboard">
        <AdminPharmacistSidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />
        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <AdminPharmacistHeader 
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
          />
          <Container className="mt-4">
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </Spinner>
              <p className="mt-2">Chargement des mouvements de stock...</p>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-pharmacist-dashboard">
        <AdminPharmacistSidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />
        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <AdminPharmacistHeader 
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
          />
          <Container className="mt-4">
            <Alert variant="danger">
              <Icon name="exchange-alt" size={16} className="me-2" />
              {error}
            </Alert>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-pharmacist-dashboard">
      {/* Sidebar */}
      <AdminPharmacistSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <AdminPharmacistHeader 
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <Container fluid className="stock-movements">
      {/* En-tête */}
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">
            <Icon name="exchange-alt" size={24} className="me-3" />
            Mouvements de Stock
          </h2>
          <p className="text-muted">Historique complet des mouvements de stock</p>
        </Col>
      </Row>

      {/* Résumé */}
      {summary && (
        <Row className="mb-4">
          <Col>
            <Card className="summary-card">
              <Card.Header>
                <h5 className="mb-0">
                  <Icon name="filter" size={16} className="me-2" />
                  Résumé des Mouvements
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="stat-item">
                      <h6 className="text-muted">Total Mouvements</h6>
                      <h4 className="text-primary">{summary.total_movements}</h4>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-item">
                      <h6 className="text-muted">Entrées</h6>
                      <h4 className="text-success">{summary.total_in}</h4>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-item">
                      <h6 className="text-muted">Sorties</h6>
                      <h4 className="text-danger">{summary.total_out}</h4>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-item">
                      <h6 className="text-muted">Ajustements</h6>
                      <h4 className="text-warning">{summary.adjustment_count}</h4>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtres */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Icon name="filter" size={16} className="me-2" />
                Filtres
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Médicament</Form.Label>
                    <Form.Select
                      value={filters.medication_id}
                      onChange={(e) => handleFilterChange('medication_id', e.target.value)}
                    >
                      <option value="">Tous les médicaments</option>
                      {medications.map(med => (
                        <option key={med.id} value={med.id}>
                          {med.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Site</Form.Label>
                    <Form.Select
                      value={filters.site_id}
                      onChange={(e) => handleFilterChange('site_id', e.target.value)}
                    >
                      <option value="">Tous les sites</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de Mouvement</Form.Label>
                    <Form.Select
                      value={filters.movement_type}
                      onChange={(e) => handleFilterChange('movement_type', e.target.value)}
                    >
                      <option value="">Tous</option>
                      <option value="IN">Entrée</option>
                      <option value="OUT">Sortie</option>
                      <option value="TRANSFER_IN">Transfert Entrant</option>
                      <option value="TRANSFER_OUT">Transfert Sortant</option>
                      <option value="ADJUSTMENT">Ajustement</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de Référence</Form.Label>
                    <Form.Select
                      value={filters.reference_type}
                      onChange={(e) => handleFilterChange('reference_type', e.target.value)}
                    >
                      <option value="">Tous</option>
                      <option value="DISTRIBUTION">Distribution</option>
                      <option value="ORDER">Commande</option>
                      <option value="ADJUSTMENT">Ajustement</option>
                      <option value="TRANSFER">Transfert</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Actions</Form.Label>
                    <div className="d-grid">
                      <Button variant="outline-secondary" onClick={clearFilters}>
                        <Icon name="search" size={16} className="me-1" />
                        Effacer
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date Début</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Icon name="calendar" size={16} />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date Fin</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Icon name="calendar" size={16} />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tableau des mouvements */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Icon name="exchange-alt" size={16} className="me-2" />
                Historique des Mouvements ({movements.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {movements.length === 0 ? (
                <Alert variant="info">
                  <Icon name="exchange-alt" size={16} className="me-2" />
                  Aucun mouvement trouvé avec les filtres sélectionnés
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Médicament</th>
                        <th>Type</th>
                        <th>Quantité</th>
                        <th>Référence</th>
                        <th>Site</th>
                        <th>Utilisateur</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((movement) => (
                        <tr key={movement.id}>
                          <td>
                            <small>{formatDate(movement.created_at)}</small>
                          </td>
                          <td>
                            <strong>{movement.medication_name}</strong>
                          </td>
                          <td>
                            <Badge bg={getMovementTypeColor(movement.movement_type)}>
                              <Icon name={getMovementTypeIcon(movement.movement_type)} size={12} className="me-1" />
                              {movement.movement_type}
                            </Badge>
                          </td>
                          <td>
                            <strong className="text-primary">{movement.quantity}</strong>
                          </td>
                          <td>
                            <Badge bg={getReferenceTypeColor(movement.reference_type)}>
                              {movement.reference_type}
                            </Badge>
                            {movement.reference_id && (
                              <small className="text-muted d-block">#{movement.reference_id}</small>
                            )}
                          </td>
                          <td>
                            {movement.site_name && (
                              <div>
                                <Icon name="warehouse" size={12} className="me-1" />
                                {movement.site_name}
                              </div>
                            )}
                            {movement.from_site_name && movement.to_site_name && (
                              <div className="text-muted small">
                                <Icon name="arrow-down" size={12} className="me-1" />
                                {movement.from_site_name} → {movement.to_site_name}
                              </div>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">{movement.user_name}</small>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleMovementClick(movement)}
                            >
                              <Icon name="eye" size={12} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal des détails */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="eye" size={16} className="me-2" />
            Détails du Mouvement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMovement && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Informations Générales</h6>
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td><strong>ID:</strong></td>
                        <td>{selectedMovement.id}</td>
                      </tr>
                      <tr>
                        <td><strong>Date:</strong></td>
                        <td>{formatDate(selectedMovement.created_at)}</td>
                      </tr>
                      <tr>
                        <td><strong>Médicament:</strong></td>
                        <td>{selectedMovement.medication_name}</td>
                      </tr>
                      <tr>
                        <td><strong>Quantité:</strong></td>
                        <td>
                          <Badge bg={getMovementTypeColor(selectedMovement.movement_type)}>
                            {selectedMovement.quantity}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Type et Référence</h6>
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Type:</strong></td>
                        <td>
                          <Badge bg={getMovementTypeColor(selectedMovement.movement_type)}>
                            <Icon name={getMovementTypeIcon(selectedMovement.movement_type)} size={12} className="me-1" />
                            {selectedMovement.movement_type}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Référence:</strong></td>
                        <td>
                          <Badge bg={getReferenceTypeColor(selectedMovement.reference_type)}>
                            {selectedMovement.reference_type}
                          </Badge>
                          {selectedMovement.reference_id && (
                            <span className="text-muted"> #{selectedMovement.reference_id}</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Utilisateur:</strong></td>
                        <td>{selectedMovement.user_name}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              {(selectedMovement.site_name || selectedMovement.from_site_name || selectedMovement.to_site_name) && (
                <Row className="mt-3">
                  <Col>
                    <h6>Sites Concernés</h6>
                    <Table size="sm">
                      <tbody>
                        {selectedMovement.site_name && (
                          <tr>
                            <td><strong>Site:</strong></td>
                            <td>
                              <Icon name="warehouse" size={12} className="me-1" />
                              {selectedMovement.site_name}
                            </td>
                          </tr>
                        )}
                        {selectedMovement.from_site_name && (
                          <tr>
                            <td><strong>Site Source:</strong></td>
                            <td>
                              <Icon name="arrow-down" size={12} className="me-1" />
                              {selectedMovement.from_site_name}
                            </td>
                          </tr>
                        )}
                        {selectedMovement.to_site_name && (
                          <tr>
                            <td><strong>Site Destination:</strong></td>
                            <td>
                              <Icon name="arrow-up" size={12} className="me-1" />
                              {selectedMovement.to_site_name}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )}
              
              {selectedMovement.notes && (
                <Row className="mt-3">
                  <Col>
                    <h6>Notes</h6>
                    <Alert variant="light">
                      {selectedMovement.notes}
                    </Alert>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
        </Container>
      </div>
    </div>
  );
};

export default StockMovements;
