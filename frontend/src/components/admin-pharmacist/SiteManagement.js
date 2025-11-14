import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Alert, Modal, ListGroup, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AdminPharmacistSidebar from './AdminPharmacistSidebar';
import AdminPharmacistHeader from './AdminPharmacistHeader';
import Icon from '../common/Icons';
import SiteService from '../../services/siteService';

const SiteManagement = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [showEditSiteModal, setShowEditSiteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_person: '',
    phone: ''
  });

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des sites...');
      
      // Debug: Vérifier l'utilisateur connecté
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('👤 Utilisateur connecté:', currentUser);
      console.log('🔑 Rôle de l\'utilisateur:', currentUser.role);
      console.log('🎫 Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
      
      const response = await SiteService.getAllSites({ active_only: false });
      
      if (response.success) {
        setSites(response.data || []);
        console.log(`✅ ${response.data?.length || 0} sites chargés`);
      } else {
        setError(response.message || 'Erreur lors du chargement des sites');
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des sites:', err);
      setError('Erreur lors du chargement des sites: ' + err.message);
    } finally {
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

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && site.is_active;
    if (filterStatus === 'inactive') return matchesSearch && !site.is_active;
    
    return matchesSearch;
  });

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">
        <Icon name="check-circle" size={12} className="me-1" />
        Actif
      </Badge>
    ) : (
      <Badge bg="danger">
        <Icon name="times-circle" size={12} className="me-1" />
        Inactif
      </Badge>
    );
  };

  const handleViewSite = (site) => {
    setSelectedSite(site);
    setShowSiteModal(true);
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name || '',
      address: site.address || '',
      contact_person: site.contact_person || '',
      phone: site.phone || ''
    });
    setShowEditSiteModal(true);
  };

  const handleDeleteSite = (site) => {
    setSelectedSite(site);
    setShowDeleteModal(true);
  };

  const handleCreateSite = () => {
    setFormData({
      name: '',
      address: '',
      contact_person: '',
      phone: ''
    });
    setShowNewSiteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let response;
      if (editingSite) {
        response = await SiteService.updateSite(editingSite.id, formData);
      } else {
        response = await SiteService.createSite(formData);
      }
      
      if (response.success) {
        setShowNewSiteModal(false);
        setShowEditSiteModal(false);
        setEditingSite(null);
        await loadSites();
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateSite = async (siteId) => {
    try {
      setLoading(true);
      const response = await SiteService.deactivateSite(siteId);
      
      if (response.success) {
        await loadSites();
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de la désactivation');
      }
    } catch (err) {
      setError('Erreur lors de la désactivation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      const response = await SiteService.deleteSite(selectedSite.id);
      
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedSite(null);
        await loadSites();
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression: ' + err.message);
    } finally {
      setSubmitting(false);
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
                        <Icon name="building" size={24} className="me-2" />
                        Gestion des Sites
                      </h4>
                      <p className="text-muted mb-0">Gérer les sites de distribution</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" onClick={loadSites}>
                        <Icon name="refresh" size={16} className="me-2" />
                        Actualiser
                      </Button>
                      <Button 
                        variant="primary"
                        onClick={handleCreateSite}
                      >
                        <Icon name="plus" size={16} className="me-2" />
                        Nouveau Site
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                  {/* Filtres et recherche */}
                  <Row className="mb-4">
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text>
                          <Icon name="search" size={16} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Rechercher un site..."
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
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* Messages d'erreur */}
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <Icon name="exclamation-triangle" size={16} className="me-2" />
                      {error}
                    </Alert>
                  )}

                  {/* Tableau des sites */}
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      <p className="mt-3 text-muted">Chargement des sites...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table striped hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Adresse</th>
                            <th>Contact</th>
                            <th>Téléphone</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSites.map((site) => (
                            <tr key={site.id}>
                              <td>
                                <strong className="text-primary">#{site.id}</strong>
                              </td>
                              <td>
                                <div>
                                  <strong>{site.name}</strong>
                                </div>
                              </td>
                              <td>
                                <div className="text-muted">
                                  {site.address || 'Non renseignée'}
                                </div>
                              </td>
                              <td>
                                <div>
                                  {site.contact_person || 'Non renseigné'}
                                </div>
                              </td>
                              <td>
                                <div>
                                  {site.phone || 'Non renseigné'}
                                </div>
                              </td>
                              <td>{getStatusBadge(site.is_active)}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => handleViewSite(site)}
                                    title="Voir les détails"
                                  >
                                    <Icon name="eye" size={14} />
                                  </Button>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleEditSite(site)}
                                    title="Modifier"
                                  >
                                    <Icon name="edit" size={14} />
                                  </Button>
                                  {site.is_active && (
                                    <Button 
                                      variant="outline-warning" 
                                      size="sm"
                                      onClick={() => handleDeactivateSite(site.id)}
                                      title="Désactiver"
                                    >
                                      <Icon name="pause" size={14} />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDeleteSite(site)}
                                    title="Supprimer"
                                  >
                                    <Icon name="trash" size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      {filteredSites.length === 0 && (
                        <div className="text-center py-5">
                          <Icon name="building" size={48} className="text-muted mb-3" />
                          <h5 className="text-muted">Aucun site trouvé</h5>
                          <p className="text-muted">Ajustez vos critères de recherche ou créez un nouveau site.</p>
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

      {/* Modal de détail de site */}
      <Modal show={showSiteModal} onHide={() => setShowSiteModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="building" size={20} className="me-2" />
            Détail du site #{selectedSite?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSite && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Informations générales</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="px-0">
                      <strong>Nom:</strong> {selectedSite.name}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Adresse:</strong> {selectedSite.address || 'Non renseignée'}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Contact:</strong> {selectedSite.contact_person || 'Non renseigné'}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Téléphone:</strong> {selectedSite.phone || 'Non renseigné'}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Statut:</strong> {getStatusBadge(selectedSite.is_active)}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <h6>Informations système</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="px-0">
                      <strong>Date de création:</strong> {new Date(selectedSite.created_at).toLocaleDateString('fr-FR')}
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0">
                      <strong>Dernière mise à jour:</strong> {new Date(selectedSite.updated_at).toLocaleDateString('fr-FR')}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSiteModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => {
            setShowSiteModal(false);
            handleEditSite(selectedSite);
          }}>
            <Icon name="edit" size={16} className="me-2" />
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal nouveau site */}
      <Modal show={showNewSiteModal} onHide={() => setShowNewSiteModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="plus" size={20} className="me-2" />
            Nouveau Site
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="building" size={16} className="me-1 text-primary" />
                    Nom du site *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Site Central"
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="map-marker" size={16} className="me-1 text-primary" />
                    Adresse
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Adresse complète du site"
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="user" size={16} className="me-1 text-primary" />
                    Personne de contact
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    placeholder="Nom du responsable"
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="phone" size={16} className="me-1 text-primary" />
                    Téléphone
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+261 XX XX XX XX"
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowNewSiteModal(false)}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={submitting}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Création...
              </>
            ) : (
              <>
                <Icon name="plus" size={16} className="me-1" />
                Créer le site
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal édition site */}
      <Modal show={showEditSiteModal} onHide={() => setShowEditSiteModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="edit" size={20} className="me-2" />
            Modifier le site
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="building" size={16} className="me-1 text-primary" />
                    Nom du site *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="map-marker" size={16} className="me-1 text-primary" />
                    Adresse
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="user" size={16} className="me-1 text-primary" />
                    Personne de contact
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <Icon name="phone" size={16} className="me-1 text-primary" />
                    Téléphone
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowEditSiteModal(false)}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
          >
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmit}
            disabled={submitting}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Modification...
              </>
            ) : (
              <>
                <Icon name="save" size={16} className="me-1" />
                Sauvegarder
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <Icon name="trash" size={20} className="me-2" />
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <Icon name="alert-triangle" size={48} className="text-warning mb-3" />
            <h5>Êtes-vous sûr de vouloir supprimer ce site ?</h5>
            <p className="text-muted">
              <strong>{selectedSite?.name}</strong>
            </p>
            <Alert variant="warning" className="mt-3">
              <Icon name="info-circle" size={16} className="me-2" />
              Cette action est irréversible. Le site sera définitivement supprimé.
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
          >
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={submitting}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              <>
                <Icon name="trash" size={16} className="me-1" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SiteManagement;
