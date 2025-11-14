import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import Icon from '../common/Icons';

/**
 * Composant de confirmation pour les actions en lot
 */
const BulkActionConfirmation = ({
  show,
  onHide,
  onConfirm,
  action,
  selectedCount,
  loading = false
}) => {
  const getActionDetails = () => {
    switch (action) {
      case 'activate':
        return {
          title: 'Activer les utilisateurs',
          message: `Êtes-vous sûr de vouloir activer ${selectedCount} utilisateur${selectedCount > 1 ? 's' : ''} ?`,
          icon: 'play',
          variant: 'success',
          confirmText: 'Activer'
        };
      case 'deactivate':
        return {
          title: 'Désactiver les utilisateurs',
          message: `Êtes-vous sûr de vouloir désactiver ${selectedCount} utilisateur${selectedCount > 1 ? 's' : ''} ?`,
          icon: 'pause',
          variant: 'warning',
          confirmText: 'Désactiver'
        };
      case 'delete':
        return {
          title: 'Supprimer les utilisateurs',
          message: `Êtes-vous sûr de vouloir supprimer définitivement ${selectedCount} utilisateur${selectedCount > 1 ? 's' : ''} ? Cette action est irréversible.`,
          icon: 'trash',
          variant: 'danger',
          confirmText: 'Supprimer'
        };
      default:
        return {
          title: 'Action en lot',
          message: `Confirmer l'action pour ${selectedCount} utilisateur${selectedCount > 1 ? 's' : ''} ?`,
          icon: 'exclamationTriangle',
          variant: 'primary',
          confirmText: 'Confirmer'
        };
    }
  };

  const actionDetails = getActionDetails();

  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className={`bg-${actionDetails.variant} text-white`}>
        <Modal.Title className="d-flex align-items-center">
          <Icon name={actionDetails.icon} size={20} className="me-2" />
          {actionDetails.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <div 
            className="mx-auto d-flex align-items-center justify-content-center mb-3"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, var(--bs-${actionDetails.variant}), var(--bs-${actionDetails.variant}-light)`,
              color: 'white',
              fontSize: '2rem'
            }}
          >
            <Icon name={actionDetails.icon} size={40} />
          </div>
          
          <h5 className="mb-3">{actionDetails.title}</h5>
          <p className="text-muted mb-4">{actionDetails.message}</p>
        </div>

        {action === 'delete' && (
          <Alert variant="danger" className="mb-0">
            <Icon name="exclamationTriangle" size={16} className="me-2" />
            <strong>Attention :</strong> Cette action supprimera définitivement les utilisateurs sélectionnés. 
            Cette action ne peut pas être annulée.
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button 
          variant={actionDetails.variant}
          onClick={handleConfirm}
          disabled={loading}
          className="d-flex align-items-center"
        >
          {loading && (
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          )}
          <Icon name={actionDetails.icon} size={14} className="me-2" />
          {actionDetails.confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkActionConfirmation;
