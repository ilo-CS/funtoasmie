import React from 'react';
import { Alert } from 'react-bootstrap';
import Icon from './Icons';

const ErrorNotification = ({ 
  show, 
  message, 
  type = 'error', 
  onClose,
  duration = 0 // 0 = pas d'auto-hide
}) => {
  if (!show || !message) return null;

  const getIconName = () => {
    switch (type) {
      case 'error': return 'exclamationCircle';
      case 'warning': return 'exclamationTriangle';
      case 'info': return 'infoCircle';
      case 'success': return 'checkCircle';
      default: return 'exclamationCircle';
    }
  };

  const getAlertVariant = () => {
    switch (type) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'danger';
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'error': return 'error-notification';
      case 'warning': return 'warning-notification';
      case 'info': return 'info-notification';
      case 'success': return 'success-notification';
      default: return 'error-notification';
    }
  };

  return (
    <Alert 
      variant={getAlertVariant()} 
      className={`notification-alert ${getAlertClass()} mb-4`}
      dismissible={!!onClose}
      onClose={onClose}
    >
      <div className="d-flex align-items-start">
        <div className="notification-icon me-3">
          <Icon name={getIconName()} size={20} />
        </div>
        
        <div className="notification-content flex-grow-1">
          <div className="notification-message">
            {message}
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default ErrorNotification;
