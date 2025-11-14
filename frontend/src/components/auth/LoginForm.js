import React, { useState, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icons';
import { useForm } from '../../hooks/useForm';
import { useAnimation, useFocusAnimation } from '../../hooks/useAnimation';
import { getErrorMessage, getErrorType, validationRules } from '../../utils/errorHandler';
import ErrorNotification from '../common/ErrorNotification';
import { LOGIN_CONSTANTS } from '../../constants/login';

const LoginForm = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorNotification, setErrorNotification] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  
  // Hooks personnalisés
  const { isVisible } = useAnimation(LOGIN_CONSTANTS.ANIMATION.DELAY);
  const { handleFocus, handleBlur, isFocused } = useFocusAnimation();
  
  // Configuration du formulaire
  const initialValues = useMemo(() => ({
    email: '',
    password: ''
  }), []);
  
  const formValidationRules = useMemo(() => ({
    email: validationRules.email,
    password: validationRules.password
  }), []);
  
  // Hook de formulaire
  const {
    values: formData,
    errors,
    isSubmitting,
    handleChange,
    handleBlur: handleFormBlur,
    handleFocus: handleFormFocus,
    validateAll,
    clearErrors,
    setIsSubmitting
  } = useForm(initialValues, formValidationRules);

  // Gestionnaires d'événements optimisés
  const handleFieldChange = useCallback((e) => {
    handleChange(e);
    handleFormFocus(e.target.name);
  }, [handleChange, handleFormFocus]);

  const handleFieldBlur = useCallback((e) => {
    handleFormBlur(e);
    handleBlur();
  }, [handleFormBlur, handleBlur]);

  const handleFieldFocus = useCallback((fieldName) => {
    handleFormFocus(fieldName);
    handleFocus(fieldName);
  }, [handleFormFocus, handleFocus]);

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
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        const errorMessage = getErrorMessage({ message: result.message });
        const errorType = getErrorType({ message: result.message });
        
        setErrorNotification({
          show: true,
          message: errorMessage,
          type: errorType
        });
      }
      // La redirection se fait automatiquement via le contexte d'authentification
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const errorType = getErrorType(error);
      
      setErrorNotification({
        show: true,
        message: errorMessage,
        type: errorType
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour basculer la visibilité du mot de passe
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Fonction pour fermer la notification d'erreur
  const handleCloseError = useCallback(() => {
    setErrorNotification({ show: false, message: '', type: 'error' });
  }, []);


  return (
    <div className="login-page">
      <div className="login-background"></div>

      <Container fluid className="vh-100 d-flex align-items-center justify-content-center position-relative">
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={4}>
            <div className={`login-container ${isVisible ? 'animate-in' : ''}`}>
              <Card className="login-card shadow-lg border-0">
                <Card.Body className="p-5">
                  {/* Logo et titre avec animation */}
                  <div className="text-center mb-5">
                    <div className="logo-container mb-4">
                      <img 
                        src="/logo.jpg" 
                        alt="FUNTOA SMIE" 
                        className="login-logo"
                      />
                    </div>
                    <h1 className="login-title mb-3">FUNTOA SMIE</h1>
                    <p className="login-subtitle">Système d'Information et de Gestion de services médicales</p>
                  </div>
                  
                  {/* Formulaire de connexion */}
                  <Form onSubmit={handleSubmit} className="login-form">
                    {/* Notification d'erreur améliorée */}
                    <ErrorNotification
                      show={errorNotification.show}
                      message={errorNotification.message}
                      type={errorNotification.type}
                      onClose={handleCloseError}
                    />
                    
                    {/* Champ Email */}
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">
                        <Icon name="envelope" size={16} className="me-2" />
                        Adresse email
                      </Form.Label>
                      <div className="input-group-custom">
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFieldChange}
                          onFocus={() => handleFieldFocus('email')}
                          onBlur={handleFieldBlur}
                          placeholder={LOGIN_CONSTANTS.PLACEHOLDERS.EMAIL}
                          size="lg"
                          className={`form-control-custom ${errors.email ? 'is-invalid' : ''} ${isFocused('email') ? 'focused' : ''}`}
                          required
                        />
                      </div>
                      {errors.email && (
                        <div className="invalid-feedback d-block">
                          <Icon name="exclamationCircle" size={14} className="me-1" />
                          {errors.email}
                        </div>
                      )}
                    </Form.Group>
                    
                    {/* Champ Mot de passe */}
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">
                        <Icon name="lock" size={16} className="me-2" />
                        Mot de passe
                      </Form.Label>
                      <div className="input-group-custom">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleFieldChange}
                          onFocus={() => handleFieldFocus('password')}
                          onBlur={handleFieldBlur}
                          placeholder={LOGIN_CONSTANTS.PLACEHOLDERS.PASSWORD}
                          size="lg"
                          className={`form-control-custom ${errors.password ? 'is-invalid' : ''} ${isFocused('password') ? 'focused' : ''}`}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          <Icon name={showPassword ? "eyeSlash" : "eye"} size={16} />
                        </button>
                      </div>
                      {errors.password && (
                        <div className="invalid-feedback d-block">
                          <Icon name="exclamationCircle" size={14} className="me-1" />
                          {errors.password}
                        </div>
                      )}
                    </Form.Group>


                    
                    {/* Bouton de connexion */}
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      className="login-button w-100 py-3 fw-bold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          <Icon name="signIn" size={16} className="me-2" />
                          Se connecter
                        </>
                      )}
                    </Button>
                  </Form>

                  {/* Footer */}
                  <div className="text-center mt-4">
                    <small className="text-muted">
                      © 2025 FUNTOA SMIE. Tous droits réservés.
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginForm;
