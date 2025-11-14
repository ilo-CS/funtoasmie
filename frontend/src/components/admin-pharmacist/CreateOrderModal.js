import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, InputGroup, Tab, Tabs, Badge } from 'react-bootstrap';
import Icon from '../common/Icons';
import OrderService from '../../services/orderService';
import SupplierService from '../../services/supplierService';
import OrderItemsManager from './OrderItemsManager';

const CreateOrderModal = ({ show, onHide, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_number: '',
    notes: '',
    delivery_date: ''
  });
  
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Charger les fournisseurs au montage du composant
  useEffect(() => {
    if (show) {
      loadSuppliers();
      generateOrderNumber();
    }
  }, [show]);

  const loadSuppliers = async () => {
    try {
      const response = await SupplierService.getAllSuppliers();
      if (response.success) {
        setSuppliers(response.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    }
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const orderNumber = `CMD-${year}${month}${day}-${random}`;
    setFormData(prev => ({ ...prev, order_number: orderNumber }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    
    if (!formData.supplier_id) {
      errors.supplier_id = 'Le fournisseur est obligatoire';
    }
    
    if (!formData.order_number.trim()) {
      errors.order_number = 'Le numéro de commande est obligatoire';
    } else if (formData.order_number.length > 50) {
      errors.order_number = 'Le numéro de commande ne peut pas dépasser 50 caractères';
    }
    
    
    if (formData.notes && formData.notes.length > 500) {
      errors.notes = 'Les notes ne peuvent pas dépasser 500 caractères';
    }
    
    if (formData.delivery_date && new Date(formData.delivery_date) < new Date()) {
      errors.delivery_date = 'La date de livraison ne peut pas être dans le passé';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await OrderService.createOrder(formData);
      
      if (response.success) {
        setSuccess(true);
        setCreatedOrderId(response.data.id);
        setActiveTab('items');
      } else {
        setError(response.message || 'Erreur lors de la création de la commande');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        supplier_id: '',
        order_number: '',
        notes: '',
        delivery_date: ''
      });
      setError(null);
      setSuccess(false);
      setValidationErrors({});
      setCreatedOrderId(null);
      setActiveTab('basic');
      onHide();
    }
  };

  const handleFinish = () => {
    // Notifier le composant parent
    if (onOrderCreated) {
      onOrderCreated({ id: createdOrderId });
    }
    
    // Fermer le modal
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop={loading ? 'static' : true}>
      <Modal.Header closeButton={!loading}>
        <Modal.Title>
          <Icon name="plus" size={20} className="me-2" />
          Nouvelle Commande
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <Icon name="exclamation-triangle" size={16} className="me-2" />
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            <Icon name="check-circle" size={16} className="me-2" />
            Commande créée avec succès ! Vous pouvez maintenant ajouter des articles.
          </Alert>
        )}
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="basic" title="Informations de base">
            <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Fournisseur <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.supplier_id}
                  disabled={loading}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.supplier_id && (
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.supplier_id}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Numéro de commande <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="order_number"
                    value={formData.order_number}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.order_number}
                    disabled={loading}
                    placeholder="CMD-20250115-001"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={generateOrderNumber}
                    disabled={loading}
                    title="Générer un nouveau numéro"
                  >
                    <Icon name="refresh" size={14} />
                  </Button>
                </InputGroup>
                {validationErrors.order_number && (
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.order_number}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Date de livraison prévue</Form.Label>
                <Form.Control
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.delivery_date}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
                {validationErrors.delivery_date && (
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.delivery_date}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Notes (optionnel)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.notes}
              disabled={loading}
              placeholder="Notes supplémentaires sur la commande..."
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {formData.notes.length}/500 caractères
            </Form.Text>
            {validationErrors.notes && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.notes}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Form>
          </Tab>
          
          {createdOrderId && (
            <Tab eventKey="items" title={
              <span>
                <Icon name="list" size={16} className="me-1" />
                Articles de la commande
              </span>
            }>
              <OrderItemsManager 
                orderId={createdOrderId}
              />
            </Tab>
          )}
        </Tabs>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          Annuler
        </Button>
        {activeTab === 'basic' ? (
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Création...
              </>
            ) : (
              <>
                <Icon name="check" size={16} className="me-2" />
                Créer la commande
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="success" 
            onClick={handleFinish}
            disabled={loading}
          >
            <Icon name="check" size={16} className="me-2" />
            Finaliser la Commande
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOrderModal;
