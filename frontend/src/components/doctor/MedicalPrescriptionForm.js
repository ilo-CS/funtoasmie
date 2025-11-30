import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import medicalPrescriptionService from '../../services/medicalPrescriptionService';
import medicationService from '../../services/medicationService';
import { useAuth } from '../../context/AuthContext';

const MedicalPrescriptionForm = ({ show, onHide, consultation = null, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [error, setError] = useState('');
  const [medications, setMedications] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    consultation_id: null,
    notes: '',
    items: [{
      medication_id: '',
      quantity: 1,
      dosage: '',
      duration: '',
      instructions: '',
      notes: ''
    }]
  });

  useEffect(() => {
    loadMedications();
    if (consultation) {
      setFormData(prev => ({
        ...prev,
        patient_name: consultation.patient_name || '',
        patient_phone: consultation.patient_phone || '',
        consultation_id: consultation.id || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patient_name: '',
        patient_phone: '',
        consultation_id: null
      }));
    }
    setError('');
  }, [consultation, show]);

  const loadMedications = async () => {
    setLoadingMedications(true);
    try {
      const response = await medicationService.getAllMedications({ status: 'ACTIVE' });
      if (response.success && response.data) {
        setMedications(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des médicaments:', err);
    } finally {
      setLoadingMedications(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        medication_id: '',
        quantity: 1,
        dosage: '',
        duration: '',
        instructions: '',
        notes: ''
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.patient_name || formData.patient_name.trim().length < 2) {
      setError('Le nom du patient est obligatoire');
      return;
    }

    const validItems = formData.items.filter(item => item.medication_id && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Au moins un médicament avec une quantité valide est requis');
      return;
    }

    setLoading(true);

    try {
      const prescriptionData = {
        ...formData,
        items: validItems.map(item => ({
          medication_id: parseInt(item.medication_id),
          quantity: parseInt(item.quantity),
          dosage: item.dosage || null,
          duration: item.duration || null,
          instructions: item.instructions || null,
          notes: item.notes || null
        })),
        consultation_id: formData.consultation_id || null
      };

      await medicalPrescriptionService.createPrescription(prescriptionData);

      if (onSuccess) onSuccess();
      onHide();
      // Réinitialiser le formulaire
      setFormData({
        patient_name: '',
        patient_phone: '',
        consultation_id: null,
        notes: '',
        items: [{
          medication_id: '',
          quantity: 1,
          dosage: '',
          duration: '',
          instructions: '',
          notes: ''
        }]
      });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la création de l\'ordonnance');
    } finally {
      setLoading(false);
    }
  };

  const getMedicationName = (medicationId) => {
    const medication = medications.find(m => m.id === parseInt(medicationId));
    return medication ? medication.name : '';
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-warning text-white">
        <Modal.Title>Nouvelle ordonnance médicale</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Nom du patient <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                  required
                  placeholder="Nom complet du patient"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="tel"
                  name="patient_phone"
                  value={formData.patient_phone}
                  onChange={handleChange}
                  placeholder="032 12 345 67"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">Médicaments prescrits <span className="text-danger">*</span></Form.Label>
              <Button variant="outline-success" size="sm" onClick={addItem}>
                + Ajouter un médicament
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <Card key={index} className="mb-3 border">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <strong>Médicament {index + 1}</strong>
                    {formData.items.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>

                  <Row>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>Médicament</Form.Label>
                        {loadingMedications ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <Form.Select
                            value={item.medication_id}
                            onChange={(e) => handleItemChange(index, 'medication_id', e.target.value)}
                            required
                          >
                            <option value="">Sélectionner un médicament</option>
                            {medications.map((med) => (
                              <option key={med.id} value={med.id}>
                                {med.name}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quantité</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="1000"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Posologie</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                          placeholder="Ex: 2 comprimés"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Durée</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.duration}
                          onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                          placeholder="Ex: 7 jours"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Instructions</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={item.instructions}
                          onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                          placeholder="Instructions de prise..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes supplémentaires..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Annuler
          </Button>
          <Button variant="warning" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Création...
              </>
            ) : (
              'Créer l\'ordonnance'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MedicalPrescriptionForm;

