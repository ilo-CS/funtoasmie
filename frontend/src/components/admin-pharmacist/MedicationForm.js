import React from 'react';
import { Modal, Form, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import Icon from '../common/Icons';
import './MedicationForm.css';

const MedicationForm = ({
  showModal,
  onHide,
  formData,
  onInputChange,
  onSubmit,
  submitting,
  error,
  categories,
  unitOptions,
  isEdit = false
}) => {
  return (
    <Modal show={showModal} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ 
        background: isEdit 
          ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
          : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        color: 'white',
        border: 'none'
      }}>
        <Modal.Title className="d-flex align-items-center">
          <Icon name={isEdit ? "edit" : "plus"} size={20} className="me-2" />
          {isEdit ? "Modifier le médicament" : "Ajouter un nouveau médicament"}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ padding: '2rem' }}>
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            {/* Nom du médicament */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="tag" size={16} className="me-1 text-primary" />
                  Nom du médicament *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="Ex: Paracétamol"
                  required
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>
            </Col>

            {/* Catégorie */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="grid" size={16} className="me-1 text-primary" />
                  Catégorie *
                </Form.Label>
                <Form.Select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={onInputChange}
                  required
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Description */}
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="file-text" size={16} className="me-1 text-primary" />
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                  placeholder="Description du médicament (optionnel)"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>
            </Col>

            {/* Quantité */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="package" size={16} className="me-1 text-primary" />
                  Quantité *
                </Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity || ''}
                  onChange={onInputChange}
                  placeholder="0"
                  min="0"
                  required
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>
            </Col>

            {/* Stock minimum */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="alert-triangle" size={16} className="me-1 text-warning" />
                  Stock minimum *
                </Form.Label>
                <Form.Control
                  type="number"
                  name="min_stock"
                  value={formData.min_stock || ''}
                  onChange={onInputChange}
                  placeholder="10"
                  min="1"
                  required
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>
            </Col>

            {/* Unité */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="hash" size={16} className="me-1 text-primary" />
                  Unité *
                </Form.Label>
                <Form.Select
                  name="unit_name"
                  value={formData.unit_name}
                  onChange={onInputChange}
                  required
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Sélectionner une unité</option>
                  {unitOptions.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Prix */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="dollar-sign" size={16} className="me-1 text-success" />
                  Prix (Ariary)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={onInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>
            </Col>

            {/* Fournisseur */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <Icon name="truck" size={16} className="me-1 text-info" />
                  Fournisseur
                </Form.Label>
                <Form.Control
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={onInputChange}
                  placeholder="Nom du fournisseur"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#007bff';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" style={{ marginTop: '1rem' }}>
              {error}
            </Alert>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer style={{ 
        border: 'none',
        padding: '1rem 2rem',
        background: '#f8f9fa'
      }}>
        <Button 
          variant="secondary" 
          onClick={onHide}
          style={{
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: '600'
          }}
        >
          <Icon name="x" size={16} className="me-1" />
          Annuler
        </Button>
        <Button 
          variant={isEdit ? "success" : "primary"}
          onClick={onSubmit}
          disabled={submitting}
          style={{
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: '600',
            background: isEdit 
              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
              : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
            border: 'none'
          }}
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="me-2" />
              {isEdit ? 'Modification en cours...' : 'Ajout en cours...'}
            </>
          ) : (
            <>
              <Icon name={isEdit ? "save" : "plus"} size={16} className="me-1" />
              {isEdit ? 'Modifier le médicament' : 'Ajouter le médicament'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicationForm;
