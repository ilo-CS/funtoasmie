import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminPharmacistSidebar from './AdminPharmacistSidebar';
import AdminPharmacistHeader from './AdminPharmacistHeader';
import Icon from '../common/Icons';
import StockService from '../../services/stockService';
import OrderService from '../../services/orderService';
import DistributionService from '../../services/distributionService';
import PrescriptionService from '../../services/prescriptionService';
import MedicationService from '../../services/medicationService';
import SiteService from '../../services/siteService';
import StockMovementService from '../../services/stockMovementService';

const AdminPharmacistDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    stock: null,
    orders: null,
    distributions: null,
    prescriptions: null,
    medications: null,
    sites: null,
    alerts: null,
    recentMovements: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les statistiques en parallèle
      const [
        stockSummary,
        orderStats,
        distributionStats,
        prescriptionStats,
        medicationStats,
        sitesData,
        stockAlerts,
        recentMovements
      ] = await Promise.allSettled([
        StockService.getStockSummary(),
        OrderService.getOrderStatistics(),
        DistributionService.getDistributionStatistics(),
        PrescriptionService.getPrescriptionStats(),
        MedicationService.getStatistics(),
        SiteService.getAllSites({ active_only: true }),
        StockService.getStockAlerts({ limit: 10 }),
        StockMovementService.getRecentMovements(5)
      ]);

      setStats({
        stock: stockSummary.status === 'fulfilled' ? stockSummary.value?.data : null,
        orders: orderStats.status === 'fulfilled' ? orderStats.value?.data : null,
        distributions: distributionStats.status === 'fulfilled' ? distributionStats.value?.data : null,
        prescriptions: prescriptionStats.status === 'fulfilled' ? prescriptionStats.value?.data : null,
        medications: medicationStats.status === 'fulfilled' ? medicationStats.value?.data : null,
        sites: sitesData.status === 'fulfilled' ? sitesData.value?.data : null,
        alerts: stockAlerts.status === 'fulfilled' ? stockAlerts.value?.data : null,
        recentMovements: recentMovements.status === 'fulfilled' ? recentMovements.value : null
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // La redirection se fait automatiquement via le contexte
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getAlertCount = () => {
    if (!stats.alerts) return 0;
    return Array.isArray(stats.alerts) ? stats.alerts.length : 0;
  };

  const getPendingOrdersCount = () => {
    if (!stats.orders) return 0;
    return stats.orders.pending_count || 0;
  };

  const getPendingDistributionsCount = () => {
    if (!stats.distributions) return 0;
    return stats.distributions.pending_count || 0;
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

        {/* Dashboard Content */}
      <Container fluid className="py-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* En-tête du Dashboard */}
              <Row className="mb-4">
                <Col>
                  <Card className="shadow-sm border-0">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                          <h3 className="mb-1 text-primary fw-bold">Tableau de bord Administrateur Pharmacie</h3>
                          <p className="text-muted mb-0">Vue d'ensemble de votre pharmacie FUNTOA SMIE</p>
                        </div>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={loadDashboardData}
                        >
                          <Icon name="refresh" size={16} className="me-2" />
                          Actualiser
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Alertes importantes */}
              {(getAlertCount() > 0 || getPendingOrdersCount() > 0 || getPendingDistributionsCount() > 0) && (
                <Row className="mb-4">
                  <Col>
                    <Alert variant="warning" className="border-0 shadow-sm">
                      <div className="d-flex align-items-center">
                        <Icon name="exclamationTriangle" size={24} className="me-3 text-warning" />
                        <div className="flex-grow-1">
                          <Alert.Heading className="mb-2">Alertes importantes</Alert.Heading>
                          <div className="d-flex flex-wrap gap-3">
                            {getAlertCount() > 0 && (
                              <Badge bg="danger" className="px-3 py-2">
                                <Icon name="exclamationCircle" size={14} className="me-1" />
                                {getAlertCount()} alerte{getAlertCount() > 1 ? 's' : ''} de stock
                              </Badge>
                            )}
                            {getPendingOrdersCount() > 0 && (
                              <Badge bg="warning" className="px-3 py-2 text-dark">
                                <Icon name="shopping-cart" size={14} className="me-1" />
                                {getPendingOrdersCount()} commande{getPendingOrdersCount() > 1 ? 's' : ''} en attente
                              </Badge>
                            )}
                            {getPendingDistributionsCount() > 0 && (
                              <Badge bg="info" className="px-3 py-2">
                                <Icon name="truck" size={14} className="me-1" />
                                {getPendingDistributionsCount()} distribution{getPendingDistributionsCount() > 1 ? 's' : ''} en attente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  </Col>
                </Row>
              )}

              {/* Cartes de Statistiques */}
              <Row className="g-4 mb-4">
                {/* Stock Total */}
                <Col xs={12} sm={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm stats-card" style={{ 
                    background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                    color: 'white'
                  }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="mb-2 opacity-75 small">Stock Total</p>
                          <h2 className="mb-0 fw-bold">{formatNumber(stats.stock?.total_quantity || 0)}</h2>
                          <p className="mb-0 mt-2 small opacity-75">
                            {formatNumber(stats.stock?.total_medications || 0)} médicament{stats.stock?.total_medications !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-circle p-3">
                          <Icon name="database" size={32} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Commandes */}
                <Col xs={12} sm={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm stats-card" style={{ 
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    color: 'white'
                  }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="mb-2 opacity-75 small">Commandes</p>
                          <h2 className="mb-0 fw-bold">{formatNumber(stats.orders?.total_count || 0)}</h2>
                          <p className="mb-0 mt-2 small opacity-75">
                            {getPendingOrdersCount()} en attente
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-circle p-3">
                          <Icon name="shopping-cart" size={32} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Distributions */}
                <Col xs={12} sm={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm stats-card" style={{ 
                    background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                    color: 'white'
                  }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="mb-2 opacity-75 small">Distributions</p>
                          <h2 className="mb-0 fw-bold">{formatNumber(stats.distributions?.total_count || 0)}</h2>
                          <p className="mb-0 mt-2 small opacity-75">
                            {getPendingDistributionsCount()} en attente
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-circle p-3">
                          <Icon name="truck" size={32} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Prescriptions */}
                <Col xs={12} sm={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm stats-card" style={{ 
                    background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                    color: 'white'
                  }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="mb-2 opacity-75 small">Prescriptions</p>
                          <h2 className="mb-0 fw-bold">{formatNumber(stats.prescriptions?.total_count || 0)}</h2>
                          <p className="mb-0 mt-2 small opacity-75">
                            {formatNumber(stats.prescriptions?.today_count || 0)} aujourd'hui
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-circle p-3">
                          <Icon name="pills" size={32} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Statistiques détaillées */}
              <Row className="g-4 mb-4">
                {/* Sites actifs */}
                <Col xs={12} md={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm hover-card">
                    <Card.Body className="p-4 text-center">
                      <div className="text-primary mb-3">
                        <Icon name="building" size={40} />
                      </div>
                      <h3 className="mb-1 fw-bold">{formatNumber(stats.sites?.length || 0)}</h3>
                      <p className="text-muted mb-0 small">Sites actifs</p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Médicaments */}
                <Col xs={12} md={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm hover-card">
                    <Card.Body className="p-4 text-center">
                      <div className="text-success mb-3">
                        <Icon name="pills" size={40} />
                      </div>
                      <h3 className="mb-1 fw-bold">{formatNumber(stats.medications?.total_count || 0)}</h3>
                      <p className="text-muted mb-0 small">Médicaments</p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Alertes de stock */}
                <Col xs={12} md={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm hover-card">
                    <Card.Body className="p-4 text-center">
                      <div className="text-danger mb-3">
                        <Icon name="exclamationTriangle" size={40} />
                      </div>
                      <h3 className="mb-1 fw-bold">{getAlertCount()}</h3>
                      <p className="text-muted mb-0 small">Alertes de stock</p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Mouvements récents */}
                <Col xs={12} md={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm hover-card">
                    <Card.Body className="p-4 text-center">
                      <div className="text-info mb-3">
                        <Icon name="exchange-alt" size={40} />
                      </div>
                      <h3 className="mb-1 fw-bold">{formatNumber(stats.recentMovements?.length || 0)}</h3>
                      <p className="text-muted mb-0 small">Mouvements récents</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Actions rapides */}
              <Row className="mb-4">
            <Col>
                  <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white border-0 pb-0">
                      <h5 className="mb-3 text-primary fw-bold">
                        <Icon name="chartBar" size={20} className="me-2" />
                        Actions rapides
                      </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-4">
                    <Col md={6} lg={4}>
                      <Card className="h-100 hover-card border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div className="text-success mb-3" style={{ fontSize: '2.5rem' }}>
                            <Icon name="database" size={40} />
                          </div>
                              <h6 className="card-title fw-bold">Gestion des Stocks</h6>
                          <p className="card-text text-muted small">Inventaire global et vue d'ensemble</p>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => navigate('/admin-pharmacist/global-stock')}
                          >
                            Accéder
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6} lg={4}>
                      <Card className="h-100 hover-card border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div className="text-info mb-3" style={{ fontSize: '2.5rem' }}>
                            <Icon name="exchange-alt" size={40} />
                          </div>
                              <h6 className="card-title fw-bold">Mouvements de Stock</h6>
                          <p className="card-text text-muted small">Historique et suivi des mouvements</p>
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => navigate('/admin-pharmacist/stock-movements')}
                          >
                            Accéder
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6} lg={4}>
                      <Card className="h-100 hover-card border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                            <Icon name="shopping-cart" size={40} />
                          </div>
                              <h6 className="card-title fw-bold">Commandes</h6>
                          <p className="card-text text-muted small">Gérer les commandes fournisseurs</p>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/admin-pharmacist/orders')}
                          >
                            Accéder
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6} lg={4}>
                      <Card className="h-100 hover-card border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div className="text-warning mb-3" style={{ fontSize: '2.5rem' }}>
                            <Icon name="truck" size={40} />
                          </div>
                              <h6 className="card-title fw-bold">Distribution</h6>
                          <p className="card-text text-muted small">Distribution aux sites</p>
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => navigate('/admin-pharmacist/distribution')}
                          >
                            Accéder
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6} lg={4}>
                      <Card className="h-100 hover-card border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div className="text-info mb-3" style={{ fontSize: '2.5rem' }}>
                            <Icon name="warehouse" size={40} />
                          </div>
                              <h6 className="card-title fw-bold">Stocks par Site</h6>
                          <p className="card-text text-muted small">Visualiser les stocks par site</p>
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => navigate('/admin-pharmacist/site-stocks')}
                          >
                            Accéder
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6} lg={4}>
                      <Card className="h-100 hover-card border-0 shadow-sm">
                        <Card.Body className="text-center p-4">
                          <div className="text-secondary mb-3" style={{ fontSize: '2.5rem' }}>
                            <Icon name="building" size={40} />
                          </div>
                              <h6 className="card-title fw-bold">Gestion des Sites</h6>
                          <p className="card-text text-muted small">Gérer les sites de distribution</p>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/admin-pharmacist/sites')}
                          >
                            Accéder
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
            </>
          )}
      </Container>
      </div>
    </div>
  );
};

export default AdminPharmacistDashboard;
