import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Row, Col, Form, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import medicalPrescriptionService from '../../services/medicalPrescriptionService';
import MedicalPrescriptionForm from './MedicalPrescriptionForm';
import { useAuth } from '../../context/AuthContext';

const MedicalPrescriptionList = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPrescription, setDetailsPrescription] = useState(null);
  const [filters, setFilters] = useState({
    patient_name: '',
    status: 'ALL',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadPrescriptions();
  }, [filters]);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const filterParams = {};
      if (filters.patient_name) filterParams.patient_name = filters.patient_name;
      if (filters.status !== 'ALL') filterParams.status = filters.status;
      if (filters.date_from) filterParams.date_from = filters.date_from;
      if (filters.date_to) filterParams.date_to = filters.date_to;

      const response = await medicalPrescriptionService.getPrescriptions({ ...filterParams, limit: 50 });
      if (response.success) {
        setPrescriptions(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des ordonnances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      return;
    }

    try {
      await medicalPrescriptionService.deletePrescription(id);
      loadPrescriptions();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette ordonnance ?')) {
      return;
    }

    try {
      await medicalPrescriptionService.cancelPrescription(id);
      loadPrescriptions();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await medicalPrescriptionService.getPrescriptionById(id);
      if (response.success) {
        setDetailsPrescription(response.data);
        setShowDetails(true);
      }
    } catch (err) {
      alert(err.message || 'Erreur lors du chargement des détails');
    }
  };

  const handleFormSuccess = () => {
    loadPrescriptions();
    setShowForm(false);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge bg="success">Active</Badge>;
      case 'FULFILLED':
        return <Badge bg="info">Remplie</Badge>;
      case 'CANCELLED':
        return <Badge bg="secondary">Annulée</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1 text-danger">Ordonnances médicales</h4>
            <p className="text-muted mb-0">Gérer les ordonnances médicales</p>
          </div>
          <Button variant="warning" onClick={() => setShowForm(true)}>
            + Nouvelle ordonnance
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
                  <option value="ACTIVE">Active</option>
                  <option value="FULFILLED">Remplie</option>
                  <option value="CANCELLED">Annulée</option>
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
          ) : prescriptions.length === 0 ? (
            <Alert variant="info">Aucune ordonnance trouvée</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Médicaments</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>{formatDate(prescription.prescribed_date)}</td>
                      <td>
                        <div>
                          <strong>{prescription.patient_name}</strong>
                          {prescription.patient_phone && (
                            <div className="text-muted small">{prescription.patient_phone}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        {prescription.items && prescription.items.length > 0 ? (
                          <div>
                            {prescription.items.length} médicament{prescription.items.length > 1 ? 's' : ''}
                            <div className="text-muted small">
                              {prescription.items.slice(0, 2).map(item => item.medication_name).join(', ')}
                              {prescription.items.length > 2 && '...'}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{getStatusBadge(prescription.status)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleViewDetails(prescription.id)}
                          >
                            Détails
                          </Button>
                          {prescription.status === 'ACTIVE' && (
                            <>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleCancel(prescription.id)}
                              >
                                Annuler
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(prescription.id)}
                              >
                                Supprimer
                              </Button>
                            </>
                          )}
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

      <MedicalPrescriptionForm
        show={showForm}
        onHide={() => setShowForm(false)}
        consultation={selectedPrescription}
        onSuccess={handleFormSuccess}
      />

      {/* Modal pour afficher les détails */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton className="bg-warning text-white">
          <Modal.Title>Détails de l'ordonnance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsPrescription && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Patient:</strong> {detailsPrescription.patient_name}
                </Col>
                <Col md={6}>
                  <strong>Téléphone:</strong> {detailsPrescription.patient_phone || '-'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date:</strong> {formatDate(detailsPrescription.prescribed_date)}
                </Col>
                <Col md={6}>
                  <strong>Statut:</strong> {getStatusBadge(detailsPrescription.status)}
                </Col>
              </Row>
              {detailsPrescription.items && detailsPrescription.items.length > 0 && (
                <div className="mb-3">
                  <strong>Médicaments prescrits:</strong>
                  <Table striped bordered className="mt-2">
                    <thead>
                      <tr>
                        <th>Médicament</th>
                        <th>Quantité</th>
                        <th>Posologie</th>
                        <th>Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsPrescription.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.medication_name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.dosage || '-'}</td>
                          <td>{item.duration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              {detailsPrescription.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p>{detailsPrescription.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MedicalPrescriptionList;

