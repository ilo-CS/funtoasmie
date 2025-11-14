import React, { useState, useEffect } from 'react';
import { Alert, Toast, ToastContainer } from 'react-bootstrap';
import Icon from './Icons';

const Notification = ({ show, message, type = 'info', onClose, duration = 5000 }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <ToastContainer position="top-center" className="notification-container">
      <Toast 
        show={visible} 
        onClose={handleClose}
        className={`notification-toast notification-${type}`}
        delay={duration}
        autohide={duration > 0}
      >
        <Toast.Header closeButton={false}>
          <Icon name={getIconName(type)} size={16} className="me-2" />
          <strong className="me-auto">{getTitle(type)}</strong>
        </Toast.Header>
        <Toast.Body>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

const getIconName = (type) => {
  switch (type) {
    case 'success': return 'checkCircle';
    case 'error': return 'exclamationCircle';
    case 'warning': return 'exclamationTriangle';
    case 'info': return 'infoCircle';
    default: return 'infoCircle';
  }
};

const getTitle = (type) => {
  switch (type) {
    case 'success': return 'Succès';
    case 'error': return 'Erreur';
    case 'warning': return 'Attention';
    case 'info': return 'Information';
    default: return 'Notification';
  }
};

export default Notification;
