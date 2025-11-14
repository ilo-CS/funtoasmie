import React from 'react';
import { Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import Icon from '../common/Icons';
import './MedicationCard.css';

const MedicationCard = ({ 
  medication, 
  showDiscontinuedMedications, 
  onEdit, 
  onDeactivate, 
  onReactivate, 
  onDiscontinue 
}) => {
  const getStockStatus = (med) => {
    if (med.quantity === 0) return { variant: 'danger', text: 'Rupture de stock' };
    if (med.quantity <= med.min_stock) return { variant: 'warning', text: 'Stock faible' };
    return { variant: 'success', text: 'En stock' };
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'Actif', variant: 'success', icon: 'check-circle' };
      case 'INACTIVE':
        return { text: 'Inactif', variant: 'warning', icon: 'pause-circle' };
      case 'DISCONTINUED':
        return { text: 'Arrêté', variant: 'danger', icon: 'x-circle' };
      default:
        return { text: 'Inconnu', variant: 'secondary', icon: 'help-circle' };
    }
  };

  const stockStatus = getStockStatus(medication);
  const stockPercentage = medication.min_stock > 0 ? (medication.quantity / (medication.min_stock * 2)) * 100 : 100;
  const isLowStock = medication.quantity <= medication.min_stock;
  const isOutOfStock = medication.quantity === 0;

  return (
    <Col key={medication.id} lg={2} md={3} sm={4} className="mb-2">
      <Card className="h-100 medication-card" style={{
        border: showDiscontinuedMedications ? '2px solid #dc3545' : 'none',
        borderRadius: '16px',
        boxShadow: showDiscontinuedMedications ? '0 4px 20px rgba(220,53,69,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        background: showDiscontinuedMedications ? 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)' : 'white'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
      }}>
        {/* Header avec statut */}
        <div style={{
          background: showDiscontinuedMedications ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' :
                     isOutOfStock ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' :
                     isLowStock ? 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)' :
                     'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
          padding: '0.5rem',
          color: 'white',
          position: 'relative'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '6px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {medication.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.8rem' }}>{medication.name}</h6>
                <small className="opacity-75" style={{ fontSize: '0.6rem' }}>
                  {medication.category_name || 'Non classé'}
                </small>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end gap-1">
              <Badge 
                bg={stockStatus.variant}
                className="px-1 py-0 rounded-pill"
                style={{ fontSize: '0.5rem', fontWeight: '600' }}
              >
                {stockStatus.text}
              </Badge>
              <Badge 
                bg={getStatusInfo(medication.status).variant}
                className="px-1 py-0 rounded-pill"
                style={{ fontSize: '0.5rem', fontWeight: '600' }}
              >
                <Icon name={getStatusInfo(medication.status).icon} size={8} className="me-1" />
                {getStatusInfo(medication.status).text}
              </Badge>
            </div>
          </div>
          
          {/* Indicateur de stock */}
          <div className="mt-1">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{medication.quantity} {medication.unit_name || 'unités'}</span>
              <small className="opacity-75" style={{ fontSize: '0.6rem' }}>Min: {medication.min_stock}</small>
            </div>
            <ProgressBar 
              variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}
              now={Math.min(stockPercentage, 100)}
              style={{ 
                height: '4px', 
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.2)'
              }}
            />
          </div>
        </div>

        {/* Body avec informations */}
        <Card.Body className="p-2">
          {/* Informations ultra-compactes */}
          <div className="row g-1 mb-1">
            {medication.price && (
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <Icon name="dollar-sign" size={10} className="text-success me-1" />
                  <small className="text-muted" style={{ fontSize: '0.6rem' }}>Prix:</small>
                  <span className="fw-bold ms-1" style={{ fontSize: '0.7rem' }}>{medication.price} Ar</span>
                </div>
              </div>
            )}
            {medication.supplier && (
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <Icon name="truck" size={10} className="text-info me-1" />
                  <small className="text-muted" style={{ fontSize: '0.6rem' }}>Fourn:</small>
                  <span className="fw-bold ms-1" style={{ fontSize: '0.7rem' }}>{medication.supplier}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions ultra-compactes */}
          {!showDiscontinuedMedications && (
            <div className="d-flex gap-1 flex-wrap">
              <Button 
                variant="outline-primary" 
                size="sm"
                className="flex-fill"
                onClick={() => onEdit(medication)}
                style={{
                  borderRadius: '4px',
                  border: '1px solid #007bff',
                  fontWeight: '600',
                  fontSize: '0.6rem',
                  padding: '2px 6px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#007bff';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#007bff';
                }}
              >
                <Icon name="edit" size={10} className="me-1" />
                Modifier
              </Button>
              
              {/* Boutons de statut */}
              {medication.status === 'ACTIVE' && (
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  className="flex-fill"
                  onClick={() => onDeactivate(medication.id)}
                  style={{
                    borderRadius: '4px',
                    border: '1px solid #ffc107',
                    fontWeight: '600',
                    fontSize: '0.6rem',
                    padding: '2px 6px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon name="pause" size={10} className="me-1" />
                  Désactiver
                </Button>
              )}
              
              {medication.status === 'INACTIVE' && (
                <Button 
                  variant="outline-success" 
                  size="sm"
                  className="flex-fill"
                  onClick={() => onReactivate(medication.id)}
                  style={{
                    borderRadius: '4px',
                    border: '1px solid #28a745',
                    fontWeight: '600',
                    fontSize: '0.6rem',
                    padding: '2px 6px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon name="play" size={10} className="me-1" />
                  Réactiver
                </Button>
              )}
              
              {(medication.status === 'ACTIVE' || medication.status === 'INACTIVE') && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="flex-fill"
                  onClick={() => onDiscontinue(medication.id)}
                  style={{
                    borderRadius: '4px',
                    border: '1px solid #dc3545',
                    fontWeight: '600',
                    fontSize: '0.6rem',
                    padding: '2px 6px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon name="x" size={10} className="me-1" />
                  Arrêter
                </Button>
              )}
            </div>
          )}
          
          {/* Message spécial pour les médicaments arrêtés */}
          {showDiscontinuedMedications && (
            <div style={{
              background: '#dc3545',
              color: 'white',
              textAlign: 'center',
              padding: '8px',
              fontSize: '0.7rem',
              fontWeight: '600',
              borderRadius: '0 0 14px 14px'
            }}>
              <Icon name="lock" size={12} className="me-1" />
              Arrêté définitivement
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default MedicationCard;
