import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Alert, Spinner, Modal, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AdminPharmacistSidebar from './AdminPharmacistSidebar';
import AdminPharmacistHeader from './AdminPharmacistHeader';
import Icon from '../common/Icons';
import SiteService from '../../services/siteService';
import StockService from '../../services/stockService';

const SiteStocksManagement = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteStocks, setSiteStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await SiteService.getActiveSites();
      if (response.success) {
        setSites(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedSite(response.data[0]);
          loadSiteStocks(response.data[0].id);
        }
      } else {
        setError(response.message || 'Erreur lors du chargement des sites');
      }
    } catch (err) {
      setError('Erreur lors du chargement des sites');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteStocks = async (siteId) => {
    try {
      setLoading(true);
      const response = await StockService.getSiteStocks(siteId);
      if (response.success) {
        setSiteStocks(response.data || []);
        setError(null);
      } else {
        setError(response.message || 'Erreur lors du chargement des stocks');
      }
    } catch (err) {
      setError('Erreur lors du chargement des stocks');
      console.error('Erreur:', err);
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

  const handleSiteChange = (siteId) => {
    const site = sites.find(s => s.id === parseInt(siteId));
    setSelectedSite(site);
    loadSiteStocks(siteId);
  };

  const handleViewStockDetails = (stock) => {
    setSelectedStock(stock);
    setShowStockModal(true);
  };

  const handleSynchronizeStock = async (siteId) => {
    try {
      setLoading(true);
      const response = await StockService.synchronizeSiteStock(siteId);
      if (response.success) {
        loadSiteStocks(siteId);
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de la synchronisation');
      }
    } catch (err) {
      setError('Erreur lors de la synchronisation');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = siteStocks.filter(stock => {
    const matchesSearch = stock.medication_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'low-stock') return matchesSearch && stock.quantity <= stock.min_stock;
    if (filterStatus === 'out-of-stock') return matchesSearch && stock.quantity === 0;
    if (filterStatus === 'normal') return matchesSearch && stock.quantity > stock.min_stock;
    
    return matchesSearch;
  });

  const getStockStatus = (stock) => {
    if (stock.quantity === 0) return { variant: 'danger', text: 'Rupture', icon: 'times-circle' };
    if (stock.quantity <= stock.min_stock) return { variant: 'warning', text: 'Stock faible', icon: 'exclamation-triangle' };
    return { variant: 'success', text: 'Normal', icon: 'check-circle' };
  };

  const getStockPercentage = (stock) => {
    if (stock.min_stock === 0) return 100;
    return Math.min((stock.quantity / (stock.min_stock * 2)) * 100, 100);
  };

  const getTotalValue = () => {
    return siteStocks.reduce((total, stock) => {
      return total + (stock.price ? stock.price * stock.quantity : 0);
    }, 0);
  };

  const getLowStockCount = () => {
    return siteStocks.filter(stock => stock.quantity <= stock.min_stock).length;
  };

  const getOutOfStockCount = () => {
    return siteStocks.filter(stock => stock.quantity === 0).length;
  };

  return (
    <div className="admin-pharmacist-dashboard">
      {/* Styles CSS personnalisés pour la responsivité */}
      <style>{`
        @media (max-width: 768px) {
          .stats-card {
            margin-bottom: 1rem !important;
          }
          .modern-table {
            font-size: 0.8rem;
          }
          .modern-table th,
          .modern-table td {
            padding: 0.5rem !important;
          }
          .action-btn {
            padding: 0.25rem 0.5rem !important;
            font-size: 0.7rem;
          }
          .table-responsive {
            border-radius: 8px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

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
                        <Icon name="warehouse" size={24} className="me-2" />
                        Stocks par Site
                      </h4>
                      <p className="text-muted mb-0">Visualisation et gestion des stocks par site</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" onClick={() => loadSites()}>
                        <Icon name="refresh" size={16} className="me-2" />
                        Actualiser
                      </Button>
                      {selectedSite && (
                        <Button 
                          variant="success"
                          onClick={() => handleSynchronizeStock(selectedSite.id)}
                          disabled={loading}
                        >
                          <Icon name="sync" size={16} className="me-2" />
                          Synchroniser
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                  {/* Sélection du site */}
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          <Icon name="building" size={16} className="me-1 text-primary" />
                          Sélectionner un site
                        </Form.Label>
                        <Form.Select
                          value={selectedSite?.id || ''}
                          onChange={(e) => handleSiteChange(e.target.value)}
                          style={{
                            borderRadius: '8px',
                            border: '2px solid #e9ecef',
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {sites.map(site => (
                            <option key={site.id} value={site.id}>
                              {site.name} {site.address && `- ${site.address}`}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      {selectedSite && (
                        <div className="site-info p-3 bg-light rounded">
                          <h6 className="mb-1">{selectedSite.name}</h6>
                          {selectedSite.address && (
                            <p className="text-muted mb-1 small">
                              <Icon name="map-marker-alt" size={12} className="me-1" />
                              {selectedSite.address}
                            </p>
                          )}
                          {selectedSite.contact_person && (
                            <p className="text-muted mb-0 small">
                              <Icon name="user" size={12} className="me-1" />
                              Contact: {selectedSite.contact_person}
                            </p>
                          )}
                        </div>
                      )}
                    </Col>
                  </Row>

                  {/* Statistiques du site sélectionné */}
                  {selectedSite && (
                    <Row className="mb-4">
                      <Col md={3}>
                        <Card className="text-center border-0 bg-light">
                          <Card.Body className="py-3">
                            <div className="text-primary mb-2">
                              <Icon name="boxes" size={24} />
                            </div>
                            <h5 className="mb-1">{siteStocks.length}</h5>
                            <small className="text-muted">Médicaments</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="text-center border-0 bg-light">
                          <Card.Body className="py-3">
                            <div className="text-warning mb-2">
                              <Icon name="exclamation-triangle" size={24} />
                            </div>
                            <h5 className="mb-1">{getLowStockCount()}</h5>
                            <small className="text-muted">Stock faible</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="text-center border-0 bg-light">
                          <Card.Body className="py-3">
                            <div className="text-danger mb-2">
                              <Icon name="times-circle" size={24} />
                            </div>
                            <h5 className="mb-1">{getOutOfStockCount()}</h5>
                            <small className="text-muted">Rupture</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="text-center border-0 bg-light">
                          <Card.Body className="py-3">
                            <div className="text-success mb-2">
                              <Icon name="dollar-sign" size={24} />
                            </div>
                            <h5 className="mb-1">{getTotalValue().toLocaleString()} Ar</h5>
                            <small className="text-muted">Valeur totale</small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}

                  {/* Filtres et recherche */}
                  {selectedSite && (
                    <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                      <Card.Body className="p-4">
                        <Row className="mb-3">
                          <Col lg={8} md={12}>
                            <div className="search-container">
                              <InputGroup style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <InputGroup.Text style={{ 
                                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                  border: 'none',
                                  color: 'white'
                                }}>
                                  <Icon name="search" size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  placeholder="Rechercher un médicament..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  style={{ 
                                    border: 'none',
                                    fontSize: '1rem',
                                    padding: '12px 16px'
                                  }}
                                />
                                {searchTerm && (
                                  <Button 
                                    variant="outline-secondary"
                                    onClick={() => setSearchTerm('')}
                                    style={{ border: 'none', background: 'transparent' }}
                                  >
                                    <Icon name="times" size={16} />
                                  </Button>
                                )}
                              </InputGroup>
                            </div>
                          </Col>
                          <Col lg={4} md={12}>
                            <Form.Select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              style={{
                                borderRadius: '12px',
                                border: '2px solid #e9ecef',
                                padding: '12px 16px',
                                fontSize: '0.9rem'
                              }}
                            >
                              <option value="all">Tous les stocks</option>
                              <option value="normal">Stock normal</option>
                              <option value="low-stock">Stock faible</option>
                              <option value="out-of-stock">Rupture de stock</option>
                            </Form.Select>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Tableau des stocks */}
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <Icon name="exclamation-triangle" size={16} className="me-2" />
                      {error}
                    </Alert>
                  )}

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <Spinner animation="border" variant="primary" size="lg" className="mb-3" />
                        <h5 className="text-primary mb-2">Chargement en cours...</h5>
                        <p className="text-muted">Récupération des stocks du site</p>
                      </div>
                    </div>
                  ) : selectedSite ? (
                    <div className="table-responsive">
                      <Table striped hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Médicament</th>
                            <th>Catégorie</th>
                            <th>Quantité</th>
                            <th>Stock Min</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStocks.map((stock) => {
                            const stockStatus = getStockStatus(stock);
                            const stockPercentage = getStockPercentage(stock);
                            
                            return (
                              <tr key={stock.id}>
                                <td>
                                  <div>
                                    <strong>{stock.medication_name}</strong>
                                    {stock.unit_name && (
                                      <div className="text-muted small">{stock.unit_name}</div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <Badge 
                                    bg="secondary" 
                                    style={{ 
                                      backgroundColor: stock.category_color || '#6c757d',
                                      color: 'white'
                                    }}
                                  >
                                    {stock.category_name || 'Non classé'}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <span className="fw-bold me-2">{stock.quantity}</span>
                                    <ProgressBar 
                                      variant={stockStatus.variant}
                                      now={stockPercentage}
                                      style={{ width: '60px', height: '8px' }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <span className="text-muted">{stock.min_stock}</span>
                                </td>
                                <td>
                                  <Badge bg={stockStatus.variant}>
                                    <Icon name={stockStatus.icon} size={12} className="me-1" />
                                    {stockStatus.text}
                                  </Badge>
                                </td>
                                <td>
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => handleViewStockDetails(stock)}
                                    title="Voir les détails"
                                  >
                                    <Icon name="eye" size={14} />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>

                      {filteredStocks.length === 0 && (
                        <div className="text-center py-5">
                          <Icon name="warehouse" size={48} className="text-muted mb-3" />
                          <h5 className="text-muted">Aucun stock trouvé</h5>
                          <p className="text-muted">Ajustez vos critères de recherche ou vérifiez que le site a des stocks.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <Icon name="building" size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">Sélectionnez un site</h5>
                      <p className="text-muted">Choisissez un site dans la liste pour voir ses stocks.</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal de détail du stock */}
      <Modal show={showStockModal} onHide={() => setShowStockModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="box" size={20} className="me-2" />
            Détail du stock - {selectedStock?.medication_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStock && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Informations du médicament</h6>
                  <div className="mb-2">
                    <strong>Nom:</strong> {selectedStock.medication_name}
                  </div>
                  <div className="mb-2">
                    <strong>Catégorie:</strong> {selectedStock.category_name}
                  </div>
                  <div className="mb-2">
                    <strong>Unité:</strong> {selectedStock.unit_name}
                  </div>
                  <div className="mb-2">
                    <strong>Prix unitaire:</strong> {selectedStock.price ? `${selectedStock.price.toLocaleString()} Ar` : 'N/A'}
                  </div>
                </Col>
                <Col md={6}>
                  <h6>Stock actuel</h6>
                  <div className="mb-2">
                    <strong>Quantité:</strong> {selectedStock.quantity} {selectedStock.unit_name}
                  </div>
                  <div className="mb-2">
                    <strong>Stock minimum:</strong> {selectedStock.min_stock}
                  </div>
                  <div className="mb-2">
                    <strong>Statut:</strong> 
                    <Badge bg={getStockStatus(selectedStock).variant} className="ms-2">
                      {getStockStatus(selectedStock).text}
                    </Badge>
                  </div>
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>Niveau de stock:</strong>
                <ProgressBar 
                  variant={getStockStatus(selectedStock).variant}
                  now={getStockPercentage(selectedStock)}
                  style={{ height: '20px', marginTop: '8px' }}
                  label={`${getStockPercentage(selectedStock).toFixed(1)}%`}
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStockModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SiteStocksManagement;
