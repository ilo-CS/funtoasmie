import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Alert, 
  Spinner,
  Badge,
  Button,
  Modal,
  Table
} from 'react-bootstrap';
import Icon from '../common/Icons';
import StockService from '../../services/stockService';
import SiteService from '../../services/siteService';
import './StockDashboard.css';

const StockDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [siteStocks, setSiteStocks] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryResponse, sitesResponse] = await Promise.all([
        StockService.getStockSummary(),
        SiteService.getAllSites()
      ]);

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }

      if (sitesResponse.success) {
        setSites(sitesResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleSiteClick = async (site) => {
    try {
      setSelectedSite(site);
      setShowSiteModal(true);
      
      const response = await StockService.getSiteStocks(site.id);
      if (response.success) {
        setSiteStocks(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stocks du site:', error);
    }
  };

  const handleSynchronize = async () => {
    if (!selectedSite) return;

    try {
      setSyncing(true);
      const response = await StockService.synchronizeSiteStock(selectedSite.id);
      
      if (response.success) {
        // Recharger les données
        await loadDashboardData();
        const stocksResponse = await StockService.getSiteStocks(selectedSite.id);
        if (stocksResponse.success) {
          setSiteStocks(stocksResponse.data);
        }
        
        alert(`Synchronisation terminée: ${response.data.total_adjusted} ajustements effectués`);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK': return 'danger';
      case 'LOW_STOCK': return 'warning';
      case 'HIGH_STOCK': return 'info';
      default: return 'success';
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement du tableau de bord des stocks...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Icon name="exclamation-triangle" size={16} className="me-2" />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="stock-dashboard">
      {/* En-tête */}
      <Row className="mb-4">
        <Col>
          <h2 className="dashboard-title">
            <Icon name="warehouse" size={24} className="me-3" />
            Tableau de Bord des Stocks
          </h2>
          <p className="text-muted">Vue d'ensemble de la gestion des stocks</p>
        </Col>
      </Row>

      {/* Résumé global */}
      {summary && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                  <Icon name="pills" size={40} />
                </div>
                <h4 className="card-title">{summary.global.total_medications}</h4>
                <p className="card-text text-muted">Médicaments</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <div className="text-success mb-3" style={{ fontSize: '2.5rem' }}>
                  <Icon name="arrow-up" size={40} />
                </div>
                <h4 className="card-title">{summary.global.total_quantity.toLocaleString()}</h4>
                <p className="card-text text-muted">Stock Global</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <div className="text-warning mb-3" style={{ fontSize: '2.5rem' }}>
                  <Icon name="exclamation-triangle" size={40} />
                </div>
                <h4 className="card-title">{summary.global.low_stock_count}</h4>
                <p className="card-text text-muted">Stock Faible</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <div className="text-danger mb-3" style={{ fontSize: '2.5rem' }}>
                  <Icon name="times" size={40} />
                </div>
                <h4 className="card-title">{summary.global.out_of_stock_count}</h4>
                <p className="card-text text-muted">Rupture</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Résumé des sites */}
      {summary && (
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <Icon name="exchange-alt" size={16} className="me-2" />
                  Répartition par Sites
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="stat-item">
                      <h6 className="text-muted">Sites avec stock</h6>
                      <h4 className="text-primary">{summary.sites.total_sites_with_stock}</h4>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="stat-item">
                      <h6 className="text-muted">Total en sites</h6>
                      <h4 className="text-success">{summary.sites.total_quantity_in_sites}</h4>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <Icon name="exclamation-triangle" size={16} className="me-2" />
                  Alertes par Sites
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="stat-item">
                      <h6 className="text-muted">Stock faible</h6>
                      <h4 className="text-warning">{summary.sites.low_stock_items}</h4>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="stat-item">
                      <h6 className="text-muted">Rupture</h6>
                      <h4 className="text-danger">{summary.sites.out_of_stock_items}</h4>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Liste des sites */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Icon name="warehouse" size={16} className="me-2" />
                Sites de Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              {sites.length === 0 ? (
                <Alert variant="info">
                  <Icon name="exclamation-triangle" size={16} className="me-2" />
                  Aucun site de distribution trouvé
                </Alert>
              ) : (
                <Row>
                  {sites.map((site) => (
                    <Col md={6} lg={4} key={site.id} className="mb-3">
                      <Card 
                        className="site-card h-100 cursor-pointer"
                        onClick={() => handleSiteClick(site)}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{site.name}</h6>
                            <Icon name="eye" size={16} className="text-muted" />
                          </div>
                          <p className="card-text text-muted small mb-2">{site.address}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg={site.is_active ? 'success' : 'secondary'}>
                              {site.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                            <small className="text-muted">
                              {site.contact_person}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal des détails du site */}
      <Modal show={showSiteModal} onHide={() => setShowSiteModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="warehouse" size={16} className="me-2" />
            Stocks - {selectedSite?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Médicaments en stock</h6>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleSynchronize}
              disabled={syncing}
            >
              <Icon name="refresh" size={16} className={syncing ? 'fa-spin' : ''} />
              {syncing ? ' Synchronisation...' : ' Synchroniser'}
            </Button>
          </div>

          {siteStocks.length === 0 ? (
            <Alert variant="info">
              <Icon name="exclamation-triangle" size={16} className="me-2" />
              Aucun médicament en stock pour ce site
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Médicament</th>
                  <th>Quantité</th>
                  <th>Stock Min</th>
                  <th>Statut</th>
                  <th>Dernière MAJ</th>
                </tr>
              </thead>
              <tbody>
                {siteStocks.map((stock) => (
                  <tr key={stock.id}>
                    <td>
                      <strong>{stock.medication_name}</strong>
                      <br />
                      <small className="text-muted">{stock.medication_unit}</small>
                    </td>
                    <td>
                      <strong className="text-primary">{stock.quantity}</strong>
                    </td>
                    <td>{stock.min_stock}</td>
                    <td>
                      <Badge bg={getStockStatusColor(stock.stock_status)}>
                        {stock.stock_status}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(stock.last_updated).toLocaleDateString('fr-FR')}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSiteModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StockDashboard;
