import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, InputGroup, Alert, Badge, Modal } from 'react-bootstrap';
import Icon from '../common/Icons';
import OrderItemService from '../../services/orderItemService';
import MedicationService from '../../services/medicationService';

const OrderItemsManager = ({ orderId }) => {
  console.log('🔍 OrderItemsManager component is rendering with orderId:', orderId);
  
  const [items, setItems] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    medication_id: '',
    quantity: 1
  });
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (orderId) {
      loadOrderItems();
      loadMedications();
    }
  }, [orderId]);

  const loadOrderItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await OrderItemService.getOrderItems(orderId);
      
      if (response.success) {
        const items = response.data || [];
        setItems(items);
        
      } else {
        setError(response.message || 'Erreur lors du chargement des articles');
      }
    } catch (err) {
      // Gestion spécifique des erreurs
      if (err.message.includes('404') || err.message.includes('not found')) {
        setItems([]);
      } else {
        setError(err.message || 'Erreur lors du chargement des articles');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async () => {
    try {
      const response = await MedicationService.getAllMedications();
      if (response.success) {
        setMedications(response.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médicaments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'quantity' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Si c'est un changement de médicament, mettre à jour les informations
    if (name === 'medication_id') {
      const medication = medications.find(m => m.id === parseInt(value));
      if (medication) {
        setSelectedMedication(medication);
      }
    }
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.medication_id) {
      errors.medication_id = 'Le médicament est obligatoire';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'La quantité doit être supérieure à 0';
    }
    
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await OrderItemService.addOrderItem(orderId, formData);
      
      if (response.success) {
        // Recharger les articles
        await loadOrderItems();
        
        // Fermer le modal
        setShowAddModal(false);
        setFormData({
          medication_id: '',
          quantity: 1
        });
        setValidationErrors({});
      } else {
        setError(response.message || 'Erreur lors de l\'ajout de l\'article');
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout de l\'article:', err);
      setError(err.message || 'Erreur lors de l\'ajout de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      medication_id: item.medication_id,
      quantity: item.quantity
    });
    setShowAddModal(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await OrderItemService.updateOrderItem(editingItem.id, {
        quantity: formData.quantity
      });
      
      if (response.success) {
        // Recharger les articles
        await loadOrderItems();
        
        // Fermer le modal
        setShowAddModal(false);
        setEditingItem(null);
        setFormData({
          medication_id: '',
          quantity: 1
        });
        setValidationErrors({});
      } else {
        setError(response.message || 'Erreur lors de la mise à jour de l\'article');
      }
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour de l\'article:', err);
      setError(err.message || 'Erreur lors de la mise à jour de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        setLoading(true);
        setError(null);
        
        const response = await OrderItemService.deleteOrderItem(itemId);
        
        if (response.success) {
          // Recharger les articles
          await loadOrderItems();
        } else {
          setError(response.message || 'Erreur lors de la suppression de l\'article');
        }
      } catch (err) {
        console.error('❌ Erreur lors de la suppression de l\'article:', err);
        setError(err.message || 'Erreur lors de la suppression de l\'article');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormData({
      medication_id: '',
      quantity: 1
    });
    setValidationErrors({});
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Icon name="list" size={20} className="me-2" />
            Articles de la commande
          </h5>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={loadOrderItems}
              disabled={loading}
            >
              <Icon name="refresh" size={14} className="me-1" />
              Actualiser
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              <Icon name="plus" size={14} className="me-1" />
              Ajouter un article
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <Icon name="exclamation-triangle" size={16} className="me-2" />
              {error}
            </Alert>
          )}
          
          {loading && items.length === 0 ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des articles...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-5">
              <div className="alert alert-info border-0 mb-4" style={{
                background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
                borderRadius: '12px'
              }}>
                <Icon name="shopping-cart" size={48} className="text-info mb-3" />
                <h5 className="text-info mb-2">
                  <strong>Commande Créée avec Succès !</strong>
                </h5>
                <p className="mb-0 text-muted">
                  Votre commande est prête. Ajoutez maintenant les médicaments que vous souhaitez commander.
                </p>
              </div>
              
              <div className="d-flex justify-content-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                  }}
                >
                  <Icon name="plus" size={20} className="me-2" />
                  Ajouter le Premier Article
                </Button>
              </div>
              
              <p className="text-muted mt-3 mb-0">
                <Icon name="info-circle" size={14} className="me-1" />
                Vous pouvez ajouter plusieurs médicaments à cette commande
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Médicament</th>
                    <th>Quantité</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <strong>{item.medication_name}</strong>
                          {item.description && (
                            <div className="text-muted small">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">{item.quantity}</Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            disabled={loading}
                            title="Modifier"
                          >
                            <Icon name="edit" size={12} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={loading}
                            title="Supprimer"
                          >
                            <Icon name="trash" size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal d'ajout/modification d'article */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name={editingItem ? "edit" : "plus"} size={20} className="me-2" />
            {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Médicament <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="medication_id"
                    value={formData.medication_id}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.medication_id}
                    disabled={loading || editingItem}
                  >
                    <option value="">Sélectionner un médicament</option>
                    {medications.map(medication => (
                      <option key={medication.id} value={medication.id}>
                        {medication.name}
                      </option>
                    ))}
                  </Form.Select>
                  {validationErrors.medication_id && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.medication_id}
                    </Form.Control.Feedback>
                  )}
                  
                  {/* Affichage des informations du médicament sélectionné */}
                  {selectedMedication && (
                    <div className="alert alert-light border mt-2" style={{ fontSize: '0.875rem' }}>
                      <div className="d-flex align-items-center">
                        <Icon name="info-circle" size={14} className="text-info me-2" />
                        <div>
                          <strong>Médicament sélectionné :</strong> {selectedMedication.name}
                          {selectedMedication.description && (
                            <div className="text-muted small mt-1">{selectedMedication.description}</div>
                          )}
                          <div className="mt-1">
                            <span className="badge bg-secondary">
                              Stock disponible: {selectedMedication.quantity} {selectedMedication.unit_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Quantité <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.quantity}
                    disabled={loading}
                    min="1"
                    max="10000"
                  />
                  {validationErrors.quantity && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.quantity}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              
            </Row>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={editingItem ? handleUpdateItem : handleAddItem}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {editingItem ? 'Mise à jour...' : 'Ajout...'}
              </>
            ) : (
              <>
                <Icon name={editingItem ? "check" : "plus"} size={16} className="me-2" />
                {editingItem ? 'Mettre à jour' : 'Ajouter'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderItemsManager;
