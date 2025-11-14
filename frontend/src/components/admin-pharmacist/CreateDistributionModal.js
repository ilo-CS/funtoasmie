import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Table, InputGroup } from 'react-bootstrap';
import Icon from '../common/Icons';
import DistributionService from '../../services/distributionService';
import MedicationService from '../../services/medicationService';

const CreateDistributionModal = ({ show, onHide, onSuccess, sites }) => {
  const [formData, setFormData] = useState({
    site_id: '',
    distribution_date: '',
    notes: ''
  });
  const [distributionItems, setDistributionItems] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  useEffect(() => {
    if (show) {
      loadMedications();
      // Initialiser la date à aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, distribution_date: today }));
    }
  }, [show]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const response = await MedicationService.getAllMedications();
      if (response.success) {
        setMedications(response.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médicaments:', error);
      setError('Erreur lors du chargement des médicaments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleAddItem = (item) => {
    // Vérifier si le médicament n'est pas déjà ajouté
    const existingItem = distributionItems.find(i => i.medication_id === item.medication_id);
    if (existingItem) {
      setError('Ce médicament est déjà dans la distribution');
      return;
    }
    
    setDistributionItems(prev => [...prev, item]);
    setShowAddItemModal(false);
  };

  const handleRemoveItem = (medicationId) => {
    setDistributionItems(prev => prev.filter(item => item.medication_id !== medicationId));
  };

  const handleUpdateItemQuantity = (medicationId, newQuantity) => {
    setDistributionItems(prev => 
      prev.map(item => 
        item.medication_id === medicationId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.site_id) {
      setError('Veuillez sélectionner un site de destination');
      return;
    }

    if (distributionItems.length === 0) {
      setError('Veuillez ajouter au moins un médicament à la distribution');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Créer une seule distribution groupée avec tous les items
      const distributionData = {
        site_id: formData.site_id,
        items: distributionItems.map(item => ({
          medication_id: item.medication_id,
          quantity: parseInt(item.quantity)
        })),
        notes: formData.notes
      };
      
      const response = await DistributionService.createDistribution(distributionData);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Erreur lors de la création de la distribution');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setError('Erreur lors de la création de la distribution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      site_id: '',
      distribution_date: '',
      notes: ''
    });
    setDistributionItems([]);
    setError(null);
    onHide();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="plus" size={20} className="me-2" />
            Nouvelle Distribution
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                <Icon name="exclamation-triangle" size={16} className="me-2" />
                {error}
              </Alert>
            )}

            {/* Informations de base */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Icon name="map-marker" size={16} className="me-2" />
                    Site de destination *
                  </Form.Label>
                  <Form.Select
                    name="site_id"
                    value={formData.site_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionner un site</option>
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>
                        {site.name} - {site.address}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Icon name="calendar" size={16} className="me-2" />
                    Date de distribution *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="distribution_date"
                    value={formData.distribution_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Médicaments à distribuer */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                  <Icon name="pills" size={16} className="me-2" />
                  Médicaments à distribuer
                </h6>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowAddItemModal(true)}
                  disabled={loading}
                >
                  <Icon name="plus" size={14} className="me-1" />
                  Ajouter un médicament
                </Button>
              </div>

              {distributionItems.length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                  <Icon name="info-circle" size={24} className="mb-2" />
                  <p className="mb-0">Aucun médicament ajouté</p>
                  <small>Cliquez sur "Ajouter un médicament" pour commencer</small>
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>Médicament</th>
                        <th>Quantité</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distributionItems.map((item, index) => {
                        const medication = medications.find(m => m.id === item.medication_id);
                        return (
                          <tr key={item.medication_id}>
                            <td>
                              <strong>{medication?.name || 'Médicament inconnu'}</strong>
                            </td>
                            <td>
                              <InputGroup size="sm" style={{ width: '120px' }}>
                                <Form.Control
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItemQuantity(item.medication_id, e.target.value)}
                                  min="1"
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveItem(item.medication_id)}
                              >
                                <Icon name="times" size={12} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>

            {/* Notes */}
            <Form.Group className="mb-3">
              <Form.Label>
                <Icon name="sticky-note" size={16} className="me-2" />
                Notes (optionnel)
              </Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Notes supplémentaires sur cette distribution..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || distributionItems.length === 0}>
              {submitting ? (
                <>
                  <Icon name="spinner" size={14} className="me-2" />
                  Création...
                </>
              ) : (
                <>
                  <Icon name="check" size={14} className="me-2" />
                  Créer la distribution ({distributionItems.length} médicament{distributionItems.length > 1 ? 's' : ''})
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal d'ajout d'un médicament */}
      <AddMedicationItemModal
        show={showAddItemModal}
        onHide={() => setShowAddItemModal(false)}
        onAdd={handleAddItem}
        medications={medications}
        existingItems={distributionItems}
      />
    </>
  );
};

// Modal pour ajouter un médicament
const AddMedicationItemModal = ({ show, onHide, onAdd, medications, existingItems }) => {
  const [selectedMedication, setSelectedMedication] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedMedication || !quantity) {
      return;
    }

    const medication = medications.find(m => m.id === parseInt(selectedMedication));
    if (medication) {
      onAdd({
        medication_id: parseInt(selectedMedication),
        medication_name: medication.name,
        medication_dosage: medication.dosage,
        quantity: parseInt(quantity)
      });
      
      // Reset form
      setSelectedMedication('');
      setQuantity('');
    }
  };

  const handleClose = () => {
    setSelectedMedication('');
    setQuantity('');
    onHide();
  };

  // Filtrer les médicaments déjà ajoutés
  const availableMedications = medications.filter(med => 
    !existingItems.some(item => item.medication_id === med.id)
  );

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          <Icon name="plus" size={16} className="me-2" />
          Ajouter un médicament
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Médicament *</Form.Label>
            <Form.Select
              value={selectedMedication}
              onChange={(e) => setSelectedMedication(e.target.value)}
              required
            >
              <option value="">Sélectionner un médicament</option>
              {availableMedications.map(medication => (
                <option key={medication.id} value={medication.id}>
                  {medication.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantité *</Form.Label>
            <Form.Control
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
              placeholder="Quantité à distribuer"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            <Icon name="plus" size={14} className="me-1" />
            Ajouter
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateDistributionModal;
