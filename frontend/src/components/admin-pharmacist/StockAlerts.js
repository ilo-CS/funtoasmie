import React from 'react';
import { Alert } from 'react-bootstrap';
import Icon from '../common/Icons';
import './StockAlerts.css';

const StockAlerts = ({ medications }) => {
  const outOfStockCount = medications.filter(m => m.quantity === 0).length;
  const lowStockCount = medications.filter(m => m.quantity > 0 && m.quantity <= m.min_stock).length;

  if (outOfStockCount === 0 && lowStockCount === 0) {
    return null;
  }

  return (
    <div className="stock-alerts">
      {/* Alertes de rupture de stock */}
      {outOfStockCount > 0 && (
        <Alert variant="danger" className="mb-4 border-0" style={{
          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(220,53,69,0.3)'
        }}>
          <div className="d-flex align-items-center">
            <Icon name="exclamation-triangle" size={24} className="me-3" />
            <div>
              <h6 className="mb-1 fw-bold">Alertes Critiques Détectées !</h6>
              <p className="mb-0">
                {outOfStockCount} rupture(s) de stock détectée(s)
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Alertes de stock faible */}
      {lowStockCount > 0 && outOfStockCount === 0 && (
        <Alert variant="warning" className="mb-4 border-0" style={{
          background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(255,193,7,0.3)'
        }}>
          <div className="d-flex align-items-center">
            <Icon name="exclamation-triangle" size={24} className="me-3" />
            <div>
              <h6 className="mb-1 fw-bold">Stock Faible Détecté !</h6>
              <p className="mb-0">
                {lowStockCount} médicament(s) avec stock faible
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Alertes mixtes */}
      {outOfStockCount > 0 && lowStockCount > 0 && (
        <Alert variant="danger" className="mb-4 border-0" style={{
          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(220,53,69,0.3)'
        }}>
          <div className="d-flex align-items-center">
            <Icon name="exclamation-triangle" size={24} className="me-3" />
            <div>
              <h6 className="mb-1 fw-bold">Alertes Multiples Détectées !</h6>
              <p className="mb-0">
                {outOfStockCount} rupture(s) de stock et {lowStockCount} stock(s) faible(s)
              </p>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default StockAlerts;
