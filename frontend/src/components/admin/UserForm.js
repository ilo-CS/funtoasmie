import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useForm } from '../../hooks/useForm';
import { useRole } from '../../hooks/useRole';
import Icon from '../common/Icons';
import ErrorNotification from '../common/ErrorNotification';
import { ROLES, getRoleLabel } from '../../constants/roles';
import { validationRules } from '../../utils/errorHandler';

/**
 * Formulaire de ajout/édition d'utilisateur
 */
const UserForm = ({ 
  show, 
  onHide, 
  onSave, 
  user = null, 
  isEditing = false,
  loading = false 
}) => {
  const { canManageUsers } = useRole();
  const [errorNotification, setErrorNotification] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  // Configuration du formulaire
  const initialValues = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    password: '',
    confirmPassword: '',
    is_active: user?.is_active !== undefined ? user.is_active : true
  };

  const formValidationRules = {
    last_name: validationRules.lastName,
    first_name: validationRules.firstName,
    email: validationRules.email,
    phone: validationRules.phone,
    role: (value) => {
      if (!value) return 'Le rôle est requis';
      if (!Object.values(ROLES).includes(value)) return 'Rôle invalide';
      return null;
    },
    password: (value) => {
      if (!isEditing && !value) return 'Le mot de passe est requis';
      if (value && value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
      return null;
    },
    confirmPassword: (value) => {
      if (!isEditing && !value) return 'La confirmation du mot de passe est requise';
      if (value && value !== formData.password) return 'Les mots de passe ne correspondent pas';
      return null;
    }
  };

  const {
    values: formData,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleFocus,
    validateAll,
    clearErrors,
    setIsSubmitting,
    reset
  } = useForm(initialValues, formValidationRules);

  // Réinitialiser le formulaire quand l'utilisateur change
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        password: '',
        confirmPassword: '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    } else {
      reset(initialValues);
    }
    setErrorNotification({ show: false, message: '', type: 'error' });
  }, [user, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearErrors();
    setErrorNotification({ show: false, message: '', type: 'error' });

    // Validation complète du formulaire
    if (!validateAll()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Préparer les données à envoyer
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone?.trim() || null,
        role: formData.role,
        is_active: formData.is_active
      };

      // Ajouter le mot de passe seulement si fourni
      if (formData.password) {
        userData.password = formData.password;
      }

      // Appeler la fonction de sauvegarde
      const result = await onSave(userData, isEditing ? user.id : null);
      
      if (result.success) {
        onHide();
        reset(initialValues);
      } else {
        setErrorNotification({
          show: true,
          message: result.message || 'Erreur lors de la sauvegarde',
          type: 'error'
        });
      }
    } catch (error) {
      setErrorNotification({
        show: true,
        message: error.message || 'Erreur lors de la sauvegarde',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onHide();
      reset(initialValues);
      setErrorNotification({ show: false, message: '', type: 'error' });
    }
  };

  const getTitle = () => {
    return isEditing ? 'Modifier l\'utilisateur' : 'Ajout d\'un nouvel utilisateur';
  };

  const getSubmitText = () => {
    if (isSubmitting) {
      return isEditing ? 'Modification...' : 'Ajout...';
    }
    return isEditing ? 'Modifier' : 'Ajouter';
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <Icon name={isEditing ? "edit" : "plus"} size={20} className="me-2" />
          {getTitle()}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {/* Notification d'erreur */}
          <ErrorNotification
            show={errorNotification.show}
            message={errorNotification.message}
            type={errorNotification.type}
            onClose={() => setErrorNotification({ show: false, message: '', type: 'error' })}
          />

          <Row className="g-3">
            {/* Nom */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="user" size={14} className="me-1" />
                  Nom *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('last_name')}
                  placeholder="Entrez le nom"
                  className={errors.last_name ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                {errors.last_name && (
                  <div className="invalid-feedback">
                    <Icon name="exclamationCircle" size={12} className="me-1" />
                    {errors.last_name}
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Prénom */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="user" size={14} className="me-1" />
                  Prénom
                </Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('first_name')}
                  placeholder="Entrez le prénom"
                  className={errors.first_name ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                {errors.first_name && (
                  <div className="invalid-feedback">
                    <Icon name="exclamationCircle" size={12} className="me-1" />
                    {errors.first_name}
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Email */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="envelope" size={14} className="me-1" />
                  Email *
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('email')}
                  placeholder="exemple@email.com"
                  className={errors.email ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className="invalid-feedback">
                    <Icon name="exclamationCircle" size={12} className="me-1" />
                    {errors.email}
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Téléphone */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="phone" size={14} className="me-1" />
                  Téléphone
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('phone')}
                  placeholder="+261 XXX XXX XXX"
                  className={errors.phone ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <div className="invalid-feedback">
                    <Icon name="exclamationCircle" size={12} className="me-1" />
                    {errors.phone}
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Rôle */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="cog" size={14} className="me-1" />
                  Rôle *
                </Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('role')}
                  className={errors.role ? 'is-invalid' : ''}
                  disabled={isSubmitting || !canManageUsers()}
                >
                  {Object.entries(ROLES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {getRoleLabel(value)}
                    </option>
                  ))}
                </Form.Select>
                {errors.role && (
                  <div className="invalid-feedback">
                    <Icon name="exclamationCircle" size={12} className="me-1" />
                    {errors.role}
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Statut */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="checkCircle" size={14} className="me-1" />
                  Statut
                </Form.Label>
                <Form.Select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value={true}>Actif</option>
                  <option value={false}>Inactif</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Mot de passe */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="lock" size={14} className="me-1" />
                  Mot de passe {!isEditing && '*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('password')}
                  placeholder={isEditing ? "Laisser vide pour ne pas changer" : "Entrez le mot de passe"}
                  className={errors.password ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    <Icon name="exclamationCircle" size={12} className="me-1" />
                    {errors.password}
                  </div>
                )}
                {isEditing && (
                  <Form.Text className="text-muted">
                    Laisser vide pour conserver le mot de passe actuel
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            {/* Confirmation mot de passe */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Icon name="lock" size={14} className="me-1" />
                  Confirmer le mot de passe {!isEditing && '*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('confirmPassword')}
                  placeholder={isEditing ? "Confirmer le nouveau mot de passe" : "Confirmez le mot de passe"}
                  className={errors.confirmPassword ? 'is-invalid' : ''}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    <Icon name="exclamationCircle" size={12} className="me-1" />
                    {errors.confirmPassword}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting}
            className="d-flex align-items-center"
          >
            {isSubmitting && (
              <Spinner animation="border" size="sm" className="me-2" />
            )}
            <Icon name={isEditing ? "edit" : "plus"} size={14} className="me-2" />
            {getSubmitText()}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserForm;
