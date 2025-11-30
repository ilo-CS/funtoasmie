import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import consultationService from '../../services/consultationService';
import { useAuth } from '../../context/AuthContext';

const ConsultationForm = ({ show, onHide, consultation = null, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_age: '',
    patient_gender: '',
    consultation_date: new Date().toISOString().slice(0, 16),
    symptoms: '',
    diagnosis: '',
    notes: ''
  });

  useEffect(() => {
    if (consultation) {
      setFormData({
        patient_name: consultation.patient_name || '',
        patient_phone: consultation.patient_phone || '',
        patient_age: consultation.patient_age || '',
        patient_gender: consultation.patient_gender || '',
        consultation_date: consultation.consultation_date 
          ? new Date(consultation.consultation_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        symptoms: consultation.symptoms || '',
        diagnosis: consultation.diagnosis || '',
        notes: consultation.notes || ''
      });
    } else {
      setFormData({
        patient_name: '',
        patient_phone: '',
        patient_age: '',
        patient_gender: '',
        consultation_date: new Date().toISOString().slice(0, 16),
        symptoms: '',
        diagnosis: '',
        notes: ''
      });
    }
    setError('');
  }, [consultation, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const consultationData = {
        ...formData,
        patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
        patient_gender: formData.patient_gender || null
      };

      if (consultation) {
        await consultationService.updateConsultation(consultation.id, consultationData);
      } else {
        await consultationService.createConsultation(consultationData);
      }

      if (onSuccess) onSuccess();
      onHide();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-warning text-white">
        <Modal.Title>
          {consultation ? 'Modifier la consultation' : 'Nouvelle consultation'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
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

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Âge</Form.Label>
                <Form.Control
                  type="number"
                  name="patient_age"
                  value={formData.patient_age}
                  onChange={handleChange}
                  min="0"
                  max="150"
                  placeholder="Âge"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Genre</Form.Label>
                <Form.Select
                  name="patient_gender"
                  value={formData.patient_gender}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="OTHER">Autre</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date de consultation</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="consultation_date"
                  value={formData.consultation_date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Symptômes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Décrire les symptômes du patient..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Diagnostic</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Diagnostic médical..."
            />
          </Form.Group>

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
                Enregistrement...
              </>
            ) : (
              consultation ? 'Modifier' : 'Créer'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ConsultationForm;

