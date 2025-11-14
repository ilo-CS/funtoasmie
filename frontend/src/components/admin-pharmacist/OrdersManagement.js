import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Alert, Modal, ListGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AdminPharmacistSidebar from './AdminPharmacistSidebar';
import AdminPharmacistHeader from './AdminPharmacistHeader';
import Icon from '../common/Icons';
import OrderService from '../../services/orderService';
import OrderItemService from '../../services/orderItemService';
import CreateOrderModal from './CreateOrderModal';
import './OrdersManagement.css';

const OrdersManagement = () => {
  console.log('🔍 OrdersManagement component is rendering...');
  
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  // Recharger les commandes quand le filtre de statut change
  useEffect(() => {
    if (filterStatus !== 'all') {
      loadOrders();
    }
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des commandes avec filtres:', { filterStatus, pagination });
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus.toUpperCase();
      }
      
      console.log('🔍 Paramètres de la requête:', params);
      
      const response = await OrderService.getAllOrders(params);
      
      console.log('🔍 Réponse reçue:', response);
      
      if (response.success) {
        setOrders(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || response.data?.length || 0
        }));
        console.log(`✅ ${response.data?.length || 0} commandes chargées`);
      } else {
        const errorMessage = response.message || 'Erreur lors du chargement des commandes';
        console.error('❌ Erreur de réponse:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des commandes:', err);
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Erreur lors du chargement des commandes';
      
      if (err.message.includes('DATABASE_TABLE_MISSING')) {
        errorMessage = 'Table des commandes non initialisée. Contactez l\'administrateur.';
      } else if (err.message.includes('DATABASE_SCHEMA_ERROR')) {
        errorMessage = 'Structure de la base de données incorrecte. Contactez l\'administrateur.';
      } else if (err.message.includes('DATABASE_CONNECTION_ERROR')) {
        errorMessage = 'Erreur de connexion à la base de données. Réessayez plus tard.';
      } else if (err.message.includes('fetch')) {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez que le serveur est démarré.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (err.message.includes('403')) {
        errorMessage = 'Accès refusé. Permissions insuffisantes.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Erreur du serveur. Contactez l\'administrateur.';
      } else {
        errorMessage = err.message || 'Erreur inconnue lors du chargement des commandes';
      }
      
      setError(errorMessage);
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

  // Filtrer les commandes côté client pour la recherche
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: 'warning', text: 'En attente', icon: 'clock' },
      APPROVED: { variant: 'info', text: 'Approuvée', icon: 'check' },
      IN_TRANSIT: { variant: 'primary', text: 'En transit', icon: 'truck' },
      DELIVERED: { variant: 'success', text: 'Livrée', icon: 'check-circle' },
      CANCELLED: { variant: 'danger', text: 'Annulée', icon: 'times-circle' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: 'question' };
    
    return (
      <Badge bg={config.variant}>
        <Icon name={config.icon} size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const handleViewOrder = async (order) => {
    try {
      setSelectedOrder(order);
      setShowOrderModal(true);

      // Charger les articles de la commande pour l'affichage détaillé
      const itemsResponse = await OrderItemService.getOrderItems(order.id);
      if (itemsResponse.success) {
        setSelectedOrder(prev => ({
          ...prev,
          items: itemsResponse.data || []
        }));
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des articles de la commande:', err);
      // On garde l'ouverture du modal même en cas d'erreur, avec 0 article affiché
    }
  };

  const handleUpdateOrderStatus = async (orderId, action) => {
    try {
      let response;
      
      switch (action) {
        case 'approve':
          response = await OrderService.approveOrder(orderId);
          break;
        case 'in-transit':
          response = await OrderService.markAsInTransit(orderId);
          break;
        case 'delivered':
          response = await OrderService.markAsDelivered(orderId);
          
          // Si c'est une livraison, afficher les détails de l'augmentation des stocks
          if (response.success && response.data?.deliveryDetails) {
            setDeliveryDetails(response.data.deliveryDetails);
            setShowDeliveryModal(true);
          }
          break;
        case 'cancel':
          response = await OrderService.cancelOrder(orderId);
          break;
        default:
          throw new Error('Action non reconnue');
      }
      
      if (response.success) {
        // Recharger les commandes pour avoir les données à jour
        await loadOrders();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleOrderCreated = (newOrder) => {
    console.log('✅ Nouvelle commande créée:', newOrder);
    // Recharger la liste des commandes
    loadOrders();
    setShowCreateModal(false);
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
              <Card className="orders-card">
                <Card.Header className="orders-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4>
                        <Icon name="shopping-cart" size={24} className="me-2" />
                        Gestion des Commandes
                      </h4>
                      <p>Gérer les commandes de médicaments</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" onClick={loadOrders}>
                        <Icon name="refresh" size={16} className="me-2" />
                        Actualiser
                      </Button>
                      <Button 
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <Icon name="plus" size={16} className="me-2" />
                        Nouvelle Commande
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                  {/* Information sur l'automatisation */}
                  <Alert variant="light">

                            <i><span className="text-muted"> Les stocks sont automatiquement mis à jour lors de la livraison des commandes.</span></i>

                  </Alert>

                  {/* Filtres et recherche */}
                  <div className="filters-section">
                    <Row>
                      <Col md={6}>
                        <InputGroup>
                          <InputGroup.Text>
                            <Icon name="search" size={16} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Rechercher une commande..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                          />
                        </InputGroup>
                      </Col>
                      <Col md={3}>
                        <Form.Select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="search-input"
                        >
                          <option value="all">Tous les statuts</option>
                          <option value="PENDING">En attente</option>
                          <option value="APPROVED">Approuvée</option>
                          <option value="IN_TRANSIT">En transit</option>
                          <option value="DELIVERED">Livrée</option>
                          <option value="CANCELLED">Annulée</option>
                        </Form.Select>
                      </Col>
                    </Row>
                  </div>


                  {/* Tableau des commandes */}
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
                      <p className="mt-3 text-muted">Chargement des commandes...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table striped hover className="orders-table">
                        <thead>
                          <tr>
                            <th>N° Commande</th>
                            <th>Fournisseur</th>
                            <th>Date Commande</th>
                            <th>Date Livraison</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id}>
                              <td>
                                <strong className="text-primary">{order.order_number}</strong>
                              </td>
                              <td>{order.supplier_name}</td>
                              <td>{new Date(order.order_date).toLocaleDateString('fr-FR')}</td>
                              <td>{new Date(order.delivery_date).toLocaleDateString('fr-FR')}</td>
                              <td>{getStatusBadge(order.status)}</td>
                              <td>
                                <div className="action-buttons">
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => handleViewOrder(order)}
                                    className="action-btn"
                                    title="Voir les détails"
                                  >
                                    <Icon name="eye" size={14} />
                                  </Button>
                                  {order.status === 'PENDING' && (
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'approve')}
                                      className="action-btn"
                                      title="Approuver"
                                    >
                                      <Icon name="check" size={14} />
                                    </Button>
                                  )}
                                  {order.status === 'APPROVED' && (
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'in-transit')}
                                      className="action-btn"
                                      title="Mettre en transit"
                                    >
                                      <Icon name="truck" size={14} />
                                    </Button>
                                  )}
                                  {order.status === 'IN_TRANSIT' && (
                                    <Button 
                                      variant="success" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                      className="action-btn"
                                      title="Marquer comme livrée"
                                    >
                                      <Icon name="check" size={14} className="me-1" />
                                      Livrer
                                    </Button>
                                  )}
                                  {(order.status === 'PENDING' || order.status === 'APPROVED') && (
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'cancel')}
                                      className="action-btn"
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

                      {filteredOrders.length === 0 && (
                        <div className="text-center py-5">
                          <Icon name="shopping-cart" size={48} className="text-muted mb-3" />
                          <h5 className="text-muted">Aucune commande trouvée</h5>
                          <p className="text-muted">Ajustez vos critères de recherche ou créez une nouvelle commande.</p>
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

      {/* Modal de détail de commande */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" className="detail-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="shopping-cart" size={20} className="me-2" />
            Détail de la commande {selectedOrder?.order_number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="info-group">
                    <h6>Informations générales</h6>
                    <div className="info-item">
                      <span className="info-label">Fournisseur:</span>
                      <span className="info-value">{selectedOrder.supplier_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date commande:</span>
                      <span className="info-value">{new Date(selectedOrder.order_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date livraison:</span>
                      <span className="info-value">{new Date(selectedOrder.delivery_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Statut:</span>
                      <span className="info-value">{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-group">
                    <h6>Articles commandés</h6>
                  <ListGroup variant="flush">
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <ListGroup.Item key={index} className="px-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.medication_name || 'Médicament'}</strong>
                            <br />
                            <small className="text-muted">
                              Quantité: {item.quantity} {item.unit_name || 'unités'}
                            </small>
                          </div>
                          <Badge bg="primary">{item.quantity} unités</Badge>
                        </div>
                      </ListGroup.Item>
                    ))}
                    <ListGroup.Item className="px-0 border-top">
                      <div className="d-flex justify-content-between">
                        <strong>Total des articles:</strong>
                        <strong className="text-primary">
                          {selectedOrder.items ? selectedOrder.items.length : 0} article(s)
                        </strong>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Fermer
          </Button>
          <Button variant="primary">
            <Icon name="print" size={16} className="me-2" />
            Imprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de création de commande */}
      <CreateOrderModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Modal de confirmation de livraison avec détails des stocks */}
      <Modal 
        show={showDeliveryModal} 
        onHide={() => setShowDeliveryModal(false)}
        size="lg"
        centered
        className="delivery-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="check-circle" size={20} className="me-2" />
            Commande Livrée avec Succès
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="success-alert">
              <Icon name="check-circle" size={32} className="success-icon" />
              <h5 className="mb-2">Livraison Traitée avec Succès</h5>
              <p className="mb-0">Les stocks ont été automatiquement mis à jour</p>
            </div>
          </div>

          {deliveryDetails && (
            <div>
              <h6 className="mb-3">
                <Icon name="database" size={16} className="me-2" />
                Détails de la Mise à Jour des Stocks
              </h6>
              
              <Row className="mb-3">
                <Col md={6}>
                  <div className="stats-card">
                    <Icon name="box" size={24} className="text-primary mb-2" />
                    <div className="stats-number text-primary">{deliveryDetails.itemsProcessed || 0}</div>
                    <p className="stats-label">Articles Traités</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="stats-card">
                    <Icon name="exchange-alt" size={24} className="text-success mb-2" />
                    <div className="stats-number text-success">{deliveryDetails.movementsCreated || 0}</div>
                    <p className="stats-label">Mouvements Créés</p>
                  </div>
                </Col>
              </Row>

              <div className="alert alert-light border">
                <Icon name="info-circle" size={16} className="me-2" />
                <strong>Actions Automatiques :</strong>
                <ul className="mb-0 mt-2 small">
                  <li>Stocks des médicaments mis à jour</li>
                  <li>Mouvements de stock enregistrés</li>
                  <li>Statut de la commande modifié</li>
                  <li>Historique conservé</li>
                </ul>
              </div>

              <div className="alert alert-light border">
                <Icon name="lightbulb" size={16} className="me-2" />
                <strong>Conseil :</strong> Consultez la section "Gestion des Stocks" pour vérifier les stocks mis à jour.
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="primary" 
            onClick={() => setShowDeliveryModal(false)}
          >
            Fermer
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => {
              setShowDeliveryModal(false);
            }}
          >
            <Icon name="warehouse" size={16} className="me-2" />
            Gestion des Stocks
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrdersManagement;
