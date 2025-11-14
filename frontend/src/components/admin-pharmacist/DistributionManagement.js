import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Alert, Modal, ListGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AdminPharmacistSidebar from './AdminPharmacistSidebar';
import AdminPharmacistHeader from './AdminPharmacistHeader';
import Icon from '../common/Icons';
import DistributionService from '../../services/distributionService';
import SiteService from '../../services/siteService';
/*import MedicationService from '../../services/medicationService';*/
import CreateDistributionModal from './CreateDistributionModal';

const DistributionManagement = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [showNewDistributionModal, setShowNewDistributionModal] = useState(false);
  const [showEditDistributionModal, setShowEditDistributionModal] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState(null);
  const [selectedDistributions, setSelectedDistributions] = useState([]);
  const [bulkAction, setBulkAction] = useState('');


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des données de distribution...');
      
      // Charger les distributions et les sites en parallèle
      const [distributionsResponse, sitesResponse] = await Promise.all([
        DistributionService.getAllDistributions(),
        SiteService.getActiveSites()
      ]);
      
      console.log('🔍 Réponse distributions:', distributionsResponse);
      console.log('🔍 Réponse sites:', sitesResponse);
      
      if (distributionsResponse.success) {
        setDistributions(distributionsResponse.data || []);
        console.log(`✅ ${distributionsResponse.data?.length || 0} distributions chargées`);
      } else {
        console.error('❌ Erreur distributions:', distributionsResponse.message);
        setError(distributionsResponse.message || 'Erreur lors du chargement des distributions');
      }
      
      if (sitesResponse.success) {
        setSites(sitesResponse.data || []);
        console.log(`✅ ${sitesResponse.data?.length || 0} sites chargés`);
      } else {
        console.error('❌ Erreur sites:', sitesResponse.message);
        setError(sitesResponse.message || 'Erreur lors du chargement des sites');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur générale:', err);
      setError('Erreur lors du chargement des données: ' + err.message);
      setLoading(false);
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

  const filteredDistributions = distributions.filter(dist => {
    const matchesSearch = dist.id?.toString().includes(searchTerm.toLowerCase()) ||
                         dist.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dist.items && dist.items.some(item => 
                           item.medication_name?.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && dist.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'En attente', icon: 'clock' },
      distributed: { variant: 'success', text: 'Distribué', icon: 'check-circle' },
      cancelled: { variant: 'danger', text: 'Annulé', icon: 'times-circle' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: 'question' };
    
    return (
      <Badge bg={config.variant}>
        <Icon name={config.icon} size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const handleViewDistribution = (distribution) => {
    setSelectedDistribution(distribution);
    setShowDistributionModal(true);
  };

  const handleUpdateDistributionStatus = async (distributionId, newStatus) => {
    try {
      setLoading(true);
      
      let response;
      if (newStatus === 'DISTRIBUTED') {
        response = await DistributionService.markAsDistributed(distributionId);
      } else if (newStatus === 'CANCELLED') {
        response = await DistributionService.cancelDistribution(distributionId);
      }
      
      if (response && response.success) {
        // Recharger les données
        await loadData();
      } else {
        setError(response?.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDistribution = () => {
    setShowNewDistributionModal(true);
  };

  const handleEditDistribution = (distribution) => {
    setEditingDistribution(distribution);
    setShowEditDistributionModal(true);
  };

  const handleSelectDistribution = (distributionId, isSelected) => {
    if (isSelected) {
      setSelectedDistributions(prev => [...prev, distributionId]);
    } else {
      setSelectedDistributions(prev => prev.filter(id => id !== distributionId));
    }
  };

  const handleSelectAllDistributions = (isSelected) => {
    if (isSelected) {
      setSelectedDistributions(filteredDistributions.map(dist => dist.id));
    } else {
      setSelectedDistributions([]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDistributions.length === 0) return;

    try {
      setLoading(true);
      const promises = selectedDistributions.map(id => {
        if (bulkAction === 'DISTRIBUTED') {
          return DistributionService.markAsDistributed(id);
        } else if (bulkAction === 'CANCELLED') {
          return DistributionService.cancelDistribution(id);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      await loadData();
      setSelectedDistributions([]);
      setBulkAction('');
    } catch (error) {
      console.error('Erreur lors de l\'action groupée:', error);
      setError('Erreur lors de l\'action groupée');
    } finally {
      setLoading(false);
    }
  };

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
        <Container fluid className="py-4">
          <Row>
            <Col>
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-1 text-primary">
                        <Icon name="truck" size={24} className="me-2" />
                        Distribution aux Sites
                      </h4>
                      <p className="text-muted mb-0">Gérer la distribution des médicaments vers les sites</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" onClick={loadData}>
                        <Icon name="refresh" size={16} className="me-2" />
                        Actualiser
                      </Button>
                      <Button 
                        variant="primary"
                        onClick={() => setShowNewDistributionModal(true)}
                      >
                        <Icon name="plus" size={16} className="me-2" />
                        Nouvelle Distribution
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                  {/* Statistiques rapides */}
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="text-center border-0 bg-light">
                        <Card.Body className="py-3">
                          <div className="text-primary mb-2">
                            <Icon name="clock" size={24} />
                          </div>
                          <h5 className="mb-1">{distributions.filter(d => d.status === 'pending').length}</h5>
                          <small className="text-muted">En attente</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center border-0 bg-light">
                        <Card.Body className="py-3">
                          <div className="text-success mb-2">
                            <Icon name="check-circle" size={24} />
                          </div>
                          <h5 className="mb-1">{distributions.filter(d => d.status === 'distributed').length}</h5>
                          <small className="text-muted">Distribuées</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center border-0 bg-light">
                        <Card.Body className="py-3">
                          <div className="text-danger mb-2">
                            <Icon name="times-circle" size={24} />
                          </div>
                          <h5 className="mb-1">{distributions.filter(d => d.status === 'cancelled').length}</h5>
                          <small className="text-muted">Annulées</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center border-0 bg-light">
                        <Card.Body className="py-3">
                          <div className="text-info mb-2">
                            <Icon name="truck" size={24} />
                          </div>
                          <h5 className="mb-1">{distributions.length}</h5>
                          <small className="text-muted">Total</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Actions groupées */}
                  {selectedDistributions.length > 0 && (
                    <Alert variant="info" className="mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <Icon name="info-circle" size={16} className="me-2" />
                          {selectedDistributions.length} distribution(s) sélectionnée(s)
                        </span>
                        <div className="d-flex gap-2">
                          <Form.Select
                            size="sm"
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            style={{ width: '200px' }}
                          >
                            <option value="">Choisir une action</option>
                            <option value="DISTRIBUTED">Marquer comme distribuées</option>
                            <option value="CANCELLED">Annuler</option>
                          </Form.Select>
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={handleBulkAction}
                            disabled={!bulkAction}
                          >
                            <Icon name="check" size={14} className="me-1" />
                            Appliquer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-secondary"
                            onClick={() => setSelectedDistributions([])}
                          >
                            <Icon name="times" size={14} className="me-1" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Filtres et recherche */}
                  <Row className="mb-4">
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text>
                          <Icon name="search" size={16} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Rechercher une distribution..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="distributed">Distribué</option>
                        <option value="cancelled">Annulé</option>
                      </Form.Select>
                    </Col>
                  </Row>


                  {/* Tableau des distributions */}
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <Icon name="exclamation-triangle" size={16} className="me-2" />
                      {error}
                    </Alert>
                  )}

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      <p className="mt-3 text-muted">Chargement des distributions...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table striped hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>
                              <Form.Check
                                type="checkbox"
                                checked={selectedDistributions.length === filteredDistributions.length && filteredDistributions.length > 0}
                                onChange={(e) => handleSelectAllDistributions(e.target.checked)}
                              />
                            </th>
                            <th>ID</th>
                            <th>Site</th>
                            <th>Médicaments</th>
                            <th>Date Création</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDistributions.map((distribution) => (
                            <tr key={distribution.id}>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedDistributions.includes(distribution.id)}
                                  onChange={(e) => handleSelectDistribution(distribution.id, e.target.checked)}
                                />
                              </td>
                              <td>
                                <strong className="text-primary">#{distribution.id}</strong>
                              </td>
                              <td>
                                <div>
                                  <strong>{distribution.site_name}</strong>
                                  {distribution.location && (
                                    <div className="text-muted small">{distribution.location}</div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  {distribution.items && distribution.items.length > 0 ? (
                                    <div>
                                      <Badge bg="info" className="me-1">
                                        {distribution.items.length} médicament(s)
                                      </Badge>
                                      <div className="small text-muted mt-1">
                                        {distribution.items.slice(0, 2).map((item, index) => (
                                          <span key={index}>
                                            {item.medication_name} ({item.quantity})
                                            {index < Math.min(distribution.items.length, 2) - 1 && ', '}
                                          </span>
                                        ))}
                                        {distribution.items.length > 2 && (
                                          <span>... et {distribution.items.length - 2} autre(s)</span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted">Aucun médicament</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {distribution.created_at 
                                  ? new Date(distribution.created_at).toLocaleDateString('fr-FR')
                                  : 'Non définie'
                                }
                              </td>
                              <td>{getStatusBadge(distribution.status)}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => handleViewDistribution(distribution)}
                                    title="Voir les détails"
                                  >
                                    <Icon name="eye" size={14} />
                                  </Button>
                                  {distribution.status === 'pending' && (
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleEditDistribution(distribution)}
                                      title="Modifier"
                                    >
                                      <Icon name="edit" size={14} />
                                    </Button>
                                  )}
                                  {distribution.status === 'pending' && (
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      onClick={() => handleUpdateDistributionStatus(distribution.id, 'distributed')}
                                      title="Marquer comme distribuée"
                                    >
                                      <Icon name="check" size={14} />
                                    </Button>
                                  )}
                                  {distribution.status === 'pending' && (
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleUpdateDistributionStatus(distribution.id, 'cancelled')}
                                      title="Annuler"
                                    >
                                      <Icon name="times" size={14} />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      {filteredDistributions.length === 0 && (
                        <div className="text-center py-5">
                          <Icon name="truck" size={48} className="text-muted mb-3" />
                          <h5 className="text-muted">Aucune distribution trouvée</h5>
                          <p className="text-muted">Ajustez vos critères de recherche ou créez une nouvelle distribution.</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal de détail de distribution */}
      <Modal show={showDistributionModal} onHide={() => setShowDistributionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="truck" size={20} className="me-2" />
            Détail de la distribution #{selectedDistribution?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDistribution && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Informations générales</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="px-0">
                      <strong>Médicament:</strong> {selectedDistribution.medication_name}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Site:</strong> {selectedDistribution.site_name}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Quantité:</strong> {selectedDistribution.quantity} unités
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Date distribution:</strong> {selectedDistribution.distribution_date 
                        ? new Date(selectedDistribution.distribution_date).toLocaleDateString('fr-FR')
                        : 'Non définie'
                      }
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Statut:</strong> {getStatusBadge(selectedDistribution.status)}
                    </ListGroup.Item>
                    {selectedDistribution.notes && (
                      <ListGroup.Item className="px-0">
                        <strong>Notes:</strong> {selectedDistribution.notes}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <h6>Informations supplémentaires</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="px-0">
                      <strong>Créé par:</strong> {selectedDistribution.first_name} {selectedDistribution.last_name}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Date de création:</strong> {new Date(selectedDistribution.created_at).toLocaleDateString('fr-FR')}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Dernière mise à jour:</strong> {new Date(selectedDistribution.updated_at).toLocaleDateString('fr-FR')}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDistributionModal(false)}>
            Fermer
          </Button>
          <Button variant="primary">
            <Icon name="print" size={16} className="me-2" />
            Imprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal nouvelle distribution */}
      <CreateDistributionModal 
        show={showNewDistributionModal}
        onHide={() => setShowNewDistributionModal(false)}
        onSuccess={() => {
          setShowNewDistributionModal(false);
          loadData();
        }}
        sites={sites}
      />

      {/* Modal Modification Distribution - TODO: Créer EditDistributionModal */}
      <Modal show={showEditDistributionModal} onHide={() => setShowEditDistributionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="edit" size={20} className="me-2" />
            Modifier la Distribution #{editingDistribution?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <Icon name="info-circle" size={16} className="me-2" />
            Fonctionnalité de modification en cours de développement.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditDistributionModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DistributionManagement;