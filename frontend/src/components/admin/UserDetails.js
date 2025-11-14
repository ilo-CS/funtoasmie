import React from 'react';
import { Modal, Row, Col, Badge, Button } from 'react-bootstrap';
import { useRole } from '../../hooks/useRole';
import Icon from '../common/Icons';
import { getRoleLabel, getRoleColor } from '../../constants/roles';
import { formatDate } from '../../utils/dateFormatter';

/**
 * Composant pour afficher les détails d'un utilisateur
 */
const UserDetails = ({ 
  show, 
  onHide, 
  user, 
  onEdit, 
  onDelete,
  onToggleStatus 
}) => {
  const { canManageUsers } = useRole();

  if (!user) return null;

  const handleEdit = () => {
    onEdit(user);
    onHide();
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.last_name}${user.first_name ? ` ${user.first_name}` : ''} ?`)) {
      onDelete(user.id);
      onHide();
    }
  };

  const handleToggleStatus = () => {
    const action = user.is_active ? 'désactiver' : 'activer';
    if (window.confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.last_name}${user.first_name ? ` ${user.first_name}` : ''} ?`)) {
      onToggleStatus(user.id, !user.is_active);
      onHide();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <Icon name="user" size={20} className="me-2" />
          Détails de l'utilisateur
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Row className="g-4">
          {/* Avatar et informations principales */}
          <Col md={12}>
            <div className="d-flex align-items-center mb-4">
              <div 
                className="user-avatar-large me-4"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '24px'
                }}
              >
                {user.last_name?.charAt(0)?.toUpperCase()}
                {user.first_name?.charAt(0)?.toUpperCase() || ''}
              </div>
              <div>
                <h4 className="mb-1">
                  {user.last_name}{user.first_name ? ` ${user.first_name}` : ''}
                </h4>
                <p className="text-muted mb-2">ID: {user.id}</p>
                <div className="d-flex gap-2">
                  <Badge 
                    bg={getRoleColor(user.role)} 
                    className="px-3 py-2"
                  >
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge 
                    bg={user.is_active ? 'success' : 'secondary'}
                    className="px-3 py-2"
                  >
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </div>
          </Col>

          {/* Informations détaillées */}
          <Col md={6}>
            <div className="info-section">
              <h6 className="fw-bold text-primary mb-3">
                <Icon name="envelope" size={16} className="me-2" />
                Informations de contact
              </h6>
              <div className="mb-3">
                <strong>Email :</strong>
                <div className="text-muted">{user.email}</div>
              </div>
              <div className="mb-3">
                <strong>Téléphone :</strong>
                <div className="text-muted">
                  {user.phone || <span className="text-muted">Non renseigné</span>}
                </div>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="info-section">
              <h6 className="fw-bold text-primary mb-3">
                <Icon name="cog" size={16} className="me-2" />
                Informations système
              </h6>
              <div className="mb-3">
                <strong>Rôle :</strong>
                <div>
                  <Badge bg={getRoleColor(user.role)} className="px-2 py-1">
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <strong>Statut :</strong>
                <div>
                  <Badge 
                    bg={user.is_active ? 'success' : 'secondary'}
                    className="px-2 py-1"
                  >
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </div>
          </Col>

          {/* Dates */}
          <Col md={6}>
            <div className="info-section">
              <h6 className="fw-bold text-primary mb-3">
                <Icon name="calendar" size={16} className="me-2" />
                Dates importantes
              </h6>
              <div className="mb-3">
                <strong>Créé le :</strong>
                <div className="text-muted">{formatDate(user.created_at)}</div>
              </div>
              <div className="mb-3">
                <strong>Dernière modification :</strong>
                <div className="text-muted">{formatDate(user.updated_at)}</div>
              </div>
            </div>
          </Col>

          {/* Statistiques (si disponibles) */}
          <Col md={6}>
            <div className="info-section">
              <h6 className="fw-bold text-primary mb-3">
                <Icon name="chartBar" size={16} className="me-2" />
                Statistiques
              </h6>
              <div className="mb-3">
                <strong>Dernière connexion :</strong>
                <div className="text-muted">
                  {user.last_login ? formatDate(user.last_login) : 'Jamais connecté'}
                </div>
              </div>
              <div className="mb-3">
                <strong>Nombre de connexions :</strong>
                <div className="text-muted">
                  {user.login_count || 0}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button 
          variant="secondary" 
          onClick={onHide}
        >
          Fermer
        </Button>
        
        {canManageUsers() && (
          <>
            <Button 
              variant="warning" 
              onClick={handleEdit}
              className="d-flex align-items-center"
            >
              <Icon name="edit" size={14} className="me-2" />
              Modifier
            </Button>
            
            <Button 
              variant={user.is_active ? "outline-warning" : "outline-success"}
              onClick={handleToggleStatus}
              className="d-flex align-items-center"
            >
              <Icon name={user.is_active ? "pause" : "play"} size={14} className="me-2" />
              {user.is_active ? 'Désactiver' : 'Activer'}
            </Button>
            
            <Button 
              variant="outline-danger" 
              onClick={handleDelete}
              className="d-flex align-items-center"
            >
              <Icon name="trash" size={14} className="me-2" />
              Supprimer
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetails;
