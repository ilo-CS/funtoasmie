import React from 'react';
import { Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import Icon from '../common/Icons';
import './MedicationFilters.css';

const MedicationFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  statusFilter,
  setStatusFilter,
  showDiscontinuedMedications,
  setShowDiscontinuedMedications,
  medications,
  onAddMedication,
  onRefresh,
  onResetFilters
}) => {
  return (
    <div className="filters-container">
      {/* Barre de recherche principale */}
      <Row className="mb-4">
        <Col lg={8} md={12}>
          <div className="search-container">
            <InputGroup style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <InputGroup.Text style={{ 
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                border: 'none',
                color: 'white'
              }}>
                <Icon name="search" size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={showDiscontinuedMedications ? "Rechercher parmi les médicaments arrêtés..." : "Rechercher un médicament par nom, description ou fournisseur..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={showDiscontinuedMedications}
                style={{ 
                  border: 'none',
                  fontSize: '1rem',
                  padding: '12px 16px',
                  opacity: showDiscontinuedMedications ? 0.7 : 1
                }}
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <Icon name="times" size={16} />
                </Button>
              )}
            </InputGroup>
          </div>
        </Col>
        <Col lg={4} md={12} className="d-flex gap-2">
          <Button 
            variant="success" 
            className="flex-fill"
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              fontWeight: '600',
              padding: '12px 20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(40,167,69,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={onAddMedication}
          >
            <Icon name="plus" size={16} className="me-2" />
            Nouveau Médicament
          </Button>
          <Button 
            variant="outline-primary"
            onClick={onRefresh}
            style={{
              borderRadius: '12px',
              border: '2px solid #007bff',
              fontWeight: '600',
              padding: '12px 16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#007bff';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Icon name="refresh" size={16} />
          </Button>
        </Col>
      </Row>

      {/* Chips de filtres */}
      <div className="filters-chips">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="fw-bold text-muted me-3">
            <Icon name="filter" size={16} className="me-2" />
            Filtres:
          </span>
          
          {/* Chip Tous */}
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'outline-secondary'}
            size="sm"
            className="rounded-pill px-3 py-2"
            onClick={() => setFilterStatus('all')}
            disabled={showDiscontinuedMedications}
            style={{
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: filterStatus === 'all' ? 'none' : '2px solid #6c757d',
              opacity: showDiscontinuedMedications ? 0.5 : 1
            }}
          >
            <Icon name="boxes" size={14} className="me-1" />
            Tous ({medications.length})
          </Button>

          {/* Chip Stock Faible */}
          <Button
            variant={filterStatus === 'low-stock' ? 'warning' : 'outline-warning'}
            size="sm"
            className="rounded-pill px-3 py-2"
            onClick={() => setFilterStatus('low-stock')}
            disabled={showDiscontinuedMedications}
            style={{
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: filterStatus === 'low-stock' ? 'none' : '2px solid #ffc107',
              opacity: showDiscontinuedMedications ? 0.5 : 1
            }}
          >
            <Icon name="exclamation-triangle" size={14} className="me-1" />
            Stock Faible ({medications.filter(m => m.quantity <= m.min_stock).length})
          </Button>

          {/* Chip Rupture */}
          <Button
            variant={filterStatus === 'out-of-stock' ? 'danger' : 'outline-danger'}
            size="sm"
            className="rounded-pill px-3 py-2"
            onClick={() => setFilterStatus('out-of-stock')}
            disabled={showDiscontinuedMedications}
            style={{
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: filterStatus === 'out-of-stock' ? 'none' : '2px solid #dc3545',
              opacity: showDiscontinuedMedications ? 0.5 : 1
            }}
          >
            <Icon name="times-circle" size={14} className="me-1" />
            Rupture ({medications.filter(m => m.quantity === 0).length})
          </Button>

          {/* Séparateur */}
          <div className="vr mx-2"></div>

          {/* Chip Actifs */}
          <Button
            variant={statusFilter === 'active' ? 'success' : 'outline-success'}
            size="sm"
            className="rounded-pill px-3 py-2"
            onClick={() => setStatusFilter('active')}
            disabled={showDiscontinuedMedications}
            style={{
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: statusFilter === 'active' ? 'none' : '2px solid #28a745',
              opacity: showDiscontinuedMedications ? 0.5 : 1
            }}
          >
            <Icon name="check-circle" size={14} className="me-1" />
            Actifs ({medications.filter(m => m.status === 'ACTIVE').length})
          </Button>

          {/* Chip Inactifs */}
          <Button
            variant={statusFilter === 'inactive' ? 'warning' : 'outline-warning'}
            size="sm"
            className="rounded-pill px-3 py-2"
            onClick={() => setStatusFilter('inactive')}
            disabled={showDiscontinuedMedications}
            style={{
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: statusFilter === 'inactive' ? 'none' : '2px solid #ffc107',
              opacity: showDiscontinuedMedications ? 0.5 : 1
            }}
          >
            <Icon name="pause-circle" size={14} className="me-1" />
            Inactifs ({medications.filter(m => m.status === 'INACTIVE').length})
          </Button>

          {/* Bouton pour voir les médicaments arrêtés */}
          <Button
            variant={showDiscontinuedMedications ? 'danger' : 'outline-danger'}
            size="sm"
            className="rounded-pill px-3 py-2"
            onClick={() => {
              setShowDiscontinuedMedications(!showDiscontinuedMedications);
              // Réinitialiser les autres filtres quand on affiche les arrêtés
              if (!showDiscontinuedMedications) {
                setFilterStatus('all');
                setStatusFilter('all');
                setSearchTerm('');
              }
            }}
            style={{
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: showDiscontinuedMedications ? 'none' : '2px solid #dc3545'
            }}
          >
            <Icon name="archive" size={14} className="me-1" />
            {showDiscontinuedMedications ? 'Masquer Arrêtés' : 'Voir Arrêtés'} ({medications.filter(m => m.status === 'DISCONTINUED').length})
          </Button>

          {/* Bouton Reset */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-pill px-3 py-2"
            onClick={onResetFilters}
            style={{
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            <Icon name="refresh-cw" size={14} className="me-1" />
            Reset
          </Button>

          {/* Actions rapides */}
          <div className="ms-auto d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              className="rounded-pill px-3 py-2"
              style={{
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon name="download" size={14} className="me-1" />
              Export
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill px-3 py-2"
              style={{
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon name="settings" size={14} className="me-1" />
              Config
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationFilters;
