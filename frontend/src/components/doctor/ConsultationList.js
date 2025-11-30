import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Row, Col, Form, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import consultationService from '../../services/consultationService';
import ConsultationForm from './ConsultationForm';
import { useAuth } from '../../context/AuthContext';

const ConsultationList = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [filters, setFilters] = useState({
    patient_name: '',
    status: 'ALL',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadConsultations();
  }, [filters]);

  const loadConsultations = async () => {
    setLoading(true);
    setError('');
    try {
      const filterParams = {};
      if (filters.patient_name) filterParams.patient_name = filters.patient_name;
      if (filters.status !== 'ALL') filterParams.status = filters.status;
      if (filters.date_from) filterParams.date_from = filters.date_from;
      if (filters.date_to) filterParams.date_to = filters.date_to;

      const response = await consultationService.getConsultations({ ...filterParams, limit: 50 });
      if (response.success) {
        setConsultations(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (consultation) => {
    setSelectedConsultation(consultation);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      return;
    }

    try {
      await consultationService.deleteConsultation(id);
      loadConsultations();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette consultation ?')) {
      return;
    }

    try {
      await consultationService.cancelConsultation(id);
      loadConsultations();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleFormSuccess = () => {
    loadConsultations();
    setShowForm(false);
    setSelectedConsultation(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1 text-danger">Consultations</h4>
            <p className="text-muted mb-0">Gérer les consultations médicales</p>
          </div>
          <Button variant="warning" onClick={() => {
            setSelectedConsultation(null);
            setShowForm(true);
          }}>
            + Nouvelle consultation
          </Button>
        </Card.Header>

        <Card.Body>
          {/* Filtres */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Rechercher un patient</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nom du patient..."
                  value={filters.patient_name}
                  onChange={(e) => setFilters({ ...filters, patient_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="ALL">Tous</option>
                  <option value="COMPLETED">Terminées</option>
                  <option value="CANCELLED">Annulées</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Date début</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Date fin</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="secondary" onClick={() => setFilters({
                patient_name: '',
                status: 'ALL',
                date_from: '',
                date_to: ''
              })}>
                Réinitialiser
              </Button>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
            </div>
          ) : consultations.length === 0 ? (
            <Alert variant="info">Aucune consultation trouvée</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Âge</th>
                    <th>Genre</th>
                    <th>Diagnostic</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((consultation) => (
                    <tr key={consultation.id}>
                      <td>{formatDate(consultation.consultation_date)}</td>
                      <td>
                        <div>
                          <strong>{consultation.patient_name}</strong>
                          {consultation.patient_phone && (
                            <div className="text-muted small">{consultation.patient_phone}</div>
                          )}
                        </div>
                      </td>
                      <td>{consultation.patient_age || '-'}</td>
                      <td>
                        {consultation.patient_gender === 'M' ? 'M' : 
                         consultation.patient_gender === 'F' ? 'F' : 
                         consultation.patient_gender === 'OTHER' ? 'Autre' : '-'}
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {consultation.diagnosis || '-'}
                        </div>
                      </td>
                      <td>
                        <Badge bg={consultation.status === 'COMPLETED' ? 'success' : 'secondary'}>
                          {consultation.status === 'COMPLETED' ? 'Terminée' : 'Annulée'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(consultation)}
                          >
                            Modifier
                          </Button>
                          {consultation.status === 'COMPLETED' && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleCancel(consultation.id)}
                            >
                              Annuler
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(consultation.id)}
                          >
                            Supprimer
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

      <ConsultationForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setSelectedConsultation(null);
        }}
        consultation={selectedConsultation}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
};

export default ConsultationList;

