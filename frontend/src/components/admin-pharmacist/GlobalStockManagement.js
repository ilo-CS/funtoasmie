import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Alert, ProgressBar, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AdminPharmacistSidebar from './AdminPharmacistSidebar';
import AdminPharmacistHeader from './AdminPharmacistHeader';
import Icon from '../common/Icons';
import MedicationService from '../../services/medicationService';
import CategoryService from '../../services/categoryService';

const GlobalStockManagement = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    description: '',
    quantity: 0,
    min_stock: 10,
    unit_name: 'unités',
    category_id: null,
    price: null,
    supplier: ''
  });
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Options d'unités prédéfinies
  const unitOptions = [
    { value: 'comprimés', label: 'Comprimés' },
    { value: 'gélules', label: 'Gélules' },
    { value: 'flacons', label: 'Flacons' },
    { value: 'ampoules', label: 'Ampoules' },
    { value: 'seringues', label: 'Seringues' },
    { value: 'ml', label: 'Millilitres (ml)' },
    { value: 'l', label: 'Litres (l)' },
    { value: 'mg', label: 'Milligrammes (mg)' },
    { value: 'g', label: 'Grammes (g)' },
    { value: 'unités', label: 'Unités' },
    { value: 'boîtes', label: 'Boîtes' },
    { value: 'plaquettes', label: 'Plaquettes' },
    { value: 'tubes', label: 'Tubes' },
    { value: 'sachets', label: 'Sachets' },
    { value: 'pompes', label: 'Pompes' },
    { value: 'inhalateurs', label: 'Inhalateurs' }
  ];
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDiscontinueModal, setShowDiscontinueModal] = useState(false);
  const [medicationToDiscontinue, setMedicationToDiscontinue] = useState(null);
  const [discontinueConfirmation, setDiscontinueConfirmation] = useState('');
  const [showDiscontinuedMedications, setShowDiscontinuedMedications] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    unit_name: '',
    quantity: 0,
    min_stock: 10,
    price: null,
    supplier: ''
  });

  useEffect(() => {
    loadMedications();
    loadCategories();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const response = await MedicationService.getAllMedications();
      if (response.success) {
        setMedications(response.data);
      setError(null);
      } else {
        setError(response.message || 'Erreur lors du chargement des médicaments');
      }
    } catch (err) {
      setError('Erreur lors du chargement des médicaments');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await CategoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        console.error('Erreur lors du chargement des catégories:', response.message);
        // Fallback vers des catégories statiques en cas d'erreur
        setCategories([
          { id: 1, name: 'Antibiotiques', color: '#dc3545' },
          { id: 2, name: 'Analgésiques', color: '#28a745' },
          { id: 3, name: 'Vitamines', color: '#ffc107' },
          { id: 4, name: 'Antihistaminiques', color: '#17a2b8' },
          { id: 5, name: 'Autres', color: '#6c757d' }
        ]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      // Fallback vers des catégories statiques en cas d'erreur
      setCategories([
        { id: 1, name: 'Antibiotiques', color: '#dc3545' },
        { id: 2, name: 'Analgésiques', color: '#28a745' },
        { id: 3, name: 'Vitamines', color: '#ffc107' },
        { id: 4, name: 'Antihistaminiques', color: '#17a2b8' },
        { id: 5, name: 'Autres', color: '#6c757d' }
      ]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleAddMedication = () => {
    setShowAddModal(true);
    setNewMedication({
      name: '',
      description: '',
      quantity: 0,
      min_stock: 10,
      unit_name: 'unités',
      category_id: null,
      price: null,
      supplier: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'min_stock' || name === 'price' ? 
        (value === '' ? null : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await MedicationService.createMedication(newMedication);
      if (response.success) {
        setShowAddModal(false);
        loadMedications(); // Recharger la liste
        setNewMedication({
          name: '',
          description: '',
          quantity: 0,
          min_stock: 10,
          unit_name: 'unités',
          category_id: null,
          price: null,
          supplier: ''
        });
      } else {
        setError(response.message || 'Erreur lors de l\'ajout du médicament');
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du médicament');
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const response = await MedicationService.deactivateMedication(id);
      if (response.success) {
        loadMedications(); // Recharger la liste
      } else {
        setError(response.message || 'Erreur lors de la désactivation');
      }
    } catch (err) {
      setError('Erreur lors de la désactivation');
      console.error('Erreur:', err);
    }
  };

  const handleReactivate = async (id) => {
    try {
      const response = await MedicationService.reactivateMedication(id);
      if (response.success) {
        loadMedications(); // Recharger la liste
      } else {
        setError(response.message || 'Erreur lors de la réactivation');
      }
    } catch (err) {
      setError('Erreur lors de la réactivation');
      console.error('Erreur:', err);
    }
  };

  const handleDiscontinue = (id) => {
    // Trouver le médicament pour afficher son nom dans la confirmation
    const medication = medications.find(med => med.id === id);
    setMedicationToDiscontinue(medication);
    setDiscontinueConfirmation('');
    setShowDiscontinueModal(true);
  };

  const confirmDiscontinue = async () => {
    // Vérifier que l'utilisateur a tapé "ARRETER" exactement
    if (discontinueConfirmation.trim() !== 'ARRETER') {
      setError('❌ Confirmation incorrecte ! Vous devez taper exactement "ARRETER" pour confirmer cette action irréversible.');
      return;
    }

    try {
      const response = await MedicationService.discontinueMedication(medicationToDiscontinue.id);
      if (response.success) {
        loadMedications(); // Recharger la liste
        setShowDiscontinueModal(false);
        setMedicationToDiscontinue(null);
        setDiscontinueConfirmation('');
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de l\'arrêt définitif');
      }
    } catch (err) {
      setError('Erreur lors de l\'arrêt définitif');
      console.error('Erreur:', err);
    }
  };

  const cancelDiscontinue = () => {
    setShowDiscontinueModal(false);
    setMedicationToDiscontinue(null);
    setDiscontinueConfirmation('');
    setError(null);
  };

  // Gestion de la modification
  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setEditFormData({
      name: medication.name || '',
      description: medication.description || '',
      category_id: medication.category_id || '',
      unit_name: medication.unit_name || '',
      quantity: medication.quantity || 0,
      min_stock: medication.min_stock || 10,
      price: medication.price || null,
      supplier: medication.supplier || ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Vérifier si seule la quantité a changé
      const onlyQuantityChanged = 
        editFormData.name === editingMedication.name &&
        editFormData.description === (editingMedication.description || '') &&
        editFormData.category_id === editingMedication.category_id &&
        editFormData.unit_name === editingMedication.unit_name &&
        editFormData.min_stock === editingMedication.min_stock &&
        editFormData.price === (editingMedication.price || null) &&
        editFormData.supplier === (editingMedication.supplier || '') &&
        editFormData.quantity !== editingMedication.quantity;

      let response;
      
      if (onlyQuantityChanged) {
        // Utiliser la route spécifique pour la quantité
        response = await MedicationService.updateQuantity(
          editingMedication.id, 
          editFormData.quantity, 
          'Modification via interface'
        );
      } else {
        // Utiliser la route générale de mise à jour
        response = await MedicationService.updateMedication(editingMedication.id, editFormData);
      }

      if (response.success) {
        loadMedications();
        setShowEditModal(false);
        setEditingMedication(null);
        setEditFormData({
          name: '',
          description: '',
          category_id: '',
          unit_name: '',
          quantity: 0,
          min_stock: 10,
          price: null,
          supplier: ''
        });
        setError(null);
      } else {
        setError(response.message || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur lors de la modification');
      console.error('Erreur:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingMedication(null);
    setEditFormData({
      name: '',
      description: '',
      category_id: '',
      unit_name: '',
      quantity: 0,
      min_stock: 10,
      price: null,
      supplier: ''
    });
    setError(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Si on veut voir les médicaments arrêtés, afficher seulement ceux-là
    if (showDiscontinuedMedications) {
      return med.status === 'DISCONTINUED' && matchesSearch;
    }
    
    // Sinon, exclure les médicaments DISCONTINUED de l'affichage principal
    if (med.status === 'DISCONTINUED') {
      return false;
    }
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && med.status !== 'ACTIVE') return false;
      if (statusFilter === 'inactive' && med.status !== 'INACTIVE') return false;
      if (statusFilter === 'discontinued' && med.status !== 'DISCONTINUED') return false;
    }
    
    // Filtre par stock
    if (filterStatus === 'low-stock') {
      return matchesSearch && med.quantity <= med.min_stock;
    }
    if (filterStatus === 'out-of-stock') {
      return matchesSearch && med.quantity === 0;
    }
    
    return matchesSearch;
  });

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


  return (
    <div className="admin-pharmacist-dashboard">
      {/* Styles CSS personnalisés pour la responsivité */}
      <style>{`
        @media (max-width: 768px) {
          .stats-card {
            margin-bottom: 1rem !important;
          }
          .modern-table {
            font-size: 0.8rem;
          }
          .modern-table th,
          .modern-table td {
            padding: 0.5rem !important;
          }
          .action-btn {
            padding: 0.25rem 0.5rem !important;
            font-size: 0.7rem;
          }
          .table-responsive {
            border-radius: 8px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .mobile-stack {
            flex-direction: column !important;
          }
          .mobile-full-width {
            width: 100% !important;
            margin-bottom: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .stats-card .card-body {
            padding: 1rem !important;
          }
          .stats-card h3 {
            font-size: 1.5rem !important;
          }
          .modern-table {
            font-size: 0.75rem;
          }
          .modern-table th,
          .modern-table td {
            padding: 0.375rem !important;
          }
          .action-btn {
            padding: 0.2rem 0.4rem !important;
            font-size: 0.65rem;
          }
        }
        
      `}</style>

      {/* Sidebar */}
      <AdminPharmacistSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <AdminPharmacistHeader 
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <Container fluid className="py-4">
          <Row>
            <Col>
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-1 text-primary">
                        <Icon name={showDiscontinuedMedications ? "archive" : "warehouse"} size={24} className="me-2" />
                        {showDiscontinuedMedications ? "Médicaments Arrêtés Définitivement" : "Gestion du Stock Global"}
                      </h4>
                      <p className="text-muted mb-0">
                        {showDiscontinuedMedications 
                          ? "Médicaments arrêtés définitivement - Action irréversible" 
                          : "Gérer l'inventaire global de la pharmacie"
                        }
                      </p>
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                  {/* Alertes critiques */}
                  {medications.filter(m => m.quantity === 0).length > 0 && (
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
                            {medications.filter(m => m.quantity === 0).length} rupture(s) de stock
                          </p>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Filtres et recherche modernes */}
                  <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                    <Card.Body className="p-4">
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
                            onClick={handleAddMedication}
                          >
                        <Icon name="plus" size={16} className="me-2" />
                            Nouveau Médicament
                          </Button>
                          <Button 
                            variant="outline-primary"
                            onClick={loadMedications}
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
                            onClick={() => {
                              setFilterStatus('all');
                              setStatusFilter('all');
                            }}
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
                    </Card.Body>
                  </Card>


                  {/* Tableau des médicaments */}
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <Icon name="exclamation-triangle" size={16} className="me-2" />
                      {error}
                    </Alert>
                  )}

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <Spinner animation="border" variant="primary" size="lg" className="mb-3" />
                        <h5 className="text-primary mb-2">Chargement en cours...</h5>
                        <p className="text-muted">Récupération des données de stock</p>
                        <div className="mt-3">
                          <ProgressBar 
                            animated 
                            variant="primary" 
                            now={100} 
                            style={{ width: '200px', height: '4px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="medications-grid">
                      {filteredMedications.length > 0 ? (
                        <Row className="g-4">
                          {filteredMedications.map((med, index) => {
                            const stockStatus = getStockStatus(med);
                            const stockPercentage = med.min_stock > 0 ? (med.quantity / (med.min_stock * 2)) * 100 : 100;
                            const isLowStock = med.quantity <= med.min_stock;
                            const isOutOfStock = med.quantity === 0;
                            
                            return (
                              <Col key={med.id} className="mb-2">
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
                                          {med.name.charAt(0).toUpperCase()}
                                        </div>
                                  <div>
                                          <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.8rem' }}>{med.name}</h6>
                                          <small className="opacity-75" style={{ fontSize: '0.6rem' }}>
                                            {med.category_name || 'Non classé'}
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
                                          bg={getStatusInfo(med.status).variant}
                                          className="px-1 py-0 rounded-pill"
                                          style={{ fontSize: '0.5rem', fontWeight: '600' }}
                                        >
                                          <Icon name={getStatusInfo(med.status).icon} size={8} className="me-1" />
                                          {getStatusInfo(med.status).text}
                                    </Badge>
                                      </div>
                                    </div>
                                    
                                    {/* Indicateur de stock */}
                                    <div className="mt-1">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{med.quantity} {med.unit_name || 'unités'}</span>
                                        <small className="opacity-75" style={{ fontSize: '0.6rem' }}>Min: {med.min_stock}</small>
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
                                      {med.price && (
                                        <div className="col-6">
                                          <div className="d-flex align-items-center">
                                            <Icon name="dollar-sign" size={10} className="text-success me-1" />
                                            <small className="text-muted" style={{ fontSize: '0.6rem' }}>Prix:</small>
                                            <span className="fw-bold ms-1" style={{ fontSize: '0.7rem' }}>{med.price} Ar</span>
                                          </div>
                                        </div>
                                      )}
                                      {med.supplier && (
                                        <div className="col-6">
                                          <div className="d-flex align-items-center">
                                            <Icon name="truck" size={10} className="text-info me-1" />
                                            <small className="text-muted" style={{ fontSize: '0.6rem' }}>Fourn:</small>
                                            <span className="fw-bold ms-1" style={{ fontSize: '0.7rem' }}>{med.supplier}</span>
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
                                        onClick={() => handleEditMedication(med)}
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
                                      {med.status === 'ACTIVE' && (
                                        <Button 
                                          variant="outline-warning" 
                                          size="sm"
                                          className="flex-fill"
                                          onClick={() => handleDeactivate(med.id)}
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
                                      
                                      {med.status === 'INACTIVE' && (
                                        <Button 
                                          variant="outline-success" 
                                          size="sm"
                                          className="flex-fill"
                                          onClick={() => handleReactivate(med.id)}
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
                                      
                                      {(med.status === 'ACTIVE' || med.status === 'INACTIVE') && (
                                        <Button 
                                          variant="outline-danger" 
                                          size="sm"
                                          className="flex-fill"
                                          onClick={() => handleDiscontinue(med.id)}
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
                          })}
                        </Row>
                      ) : (
                        <div className="text-center py-5">
                          <div className="empty-state">
                            <div style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 20px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                              <Icon name="inbox" size={32} className="text-muted" />
                            </div>
                            <h5 className="text-muted mb-2">
                              {showDiscontinuedMedications ? "Aucun médicament arrêté" : "Aucun médicament trouvé"}
                            </h5>
                            <p className="text-muted mb-4">
                              {showDiscontinuedMedications 
                                ? "Aucun médicament n'a été arrêté définitivement." 
                                : "Ajustez vos critères de recherche ou ajoutez de nouveaux médicaments."
                              }
                            </p>
                            {!showDiscontinuedMedications && (
                              <Button variant="primary" className="px-4 py-2" onClick={handleAddMedication}>
                                <Icon name="plus" size={16} className="me-2" />
                                Ajouter le premier médicament
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

      </div>

      {/* Modal d'ajout de médicament */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ 
          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
          color: 'white',
          border: 'none'
        }}>
          <Modal.Title className="d-flex align-items-center">
            <Icon name="plus" size={20} className="me-2" />
            Ajouter un nouveau médicament
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ padding: '2rem' }}>
          <Form onSubmit={handleSubmit}>
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
                    value={newMedication.name}
                    onChange={handleInputChange}
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
                    value={newMedication.category_id || ''}
                    onChange={handleInputChange}
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
                    value={newMedication.description}
                    onChange={handleInputChange}
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
                    value={newMedication.quantity || ''}
                    onChange={handleInputChange}
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
                    value={newMedication.min_stock || ''}
                    onChange={handleInputChange}
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
                    value={newMedication.unit_name}
                    onChange={handleInputChange}
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
                    value={newMedication.price || ''}
                    onChange={handleInputChange}
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
                    value={newMedication.supplier}
                    onChange={handleInputChange}
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
          </Form>
        </Modal.Body>
        
        <Modal.Footer style={{ 
          border: 'none',
          padding: '1rem 2rem',
          background: '#f8f9fa'
        }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowAddModal(false)}
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
            variant="primary" 
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              borderRadius: '8px',
              padding: '8px 20px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              border: 'none'
            }}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Icon name="plus" size={16} className="me-1" />
                Ajouter le médicament
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de modification de médicament */}
      <Modal show={showEditModal} onHide={cancelEdit} size="lg" centered>
        <Modal.Header closeButton style={{ 
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          border: 'none'
        }}>
          <Modal.Title className="d-flex align-items-center">
            <Icon name="edit" size={20} className="me-2" />
            Modifier le médicament
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ padding: '2rem' }}>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                    Nom du médicament *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#28a745';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                    Catégorie *
                  </Form.Label>
                  <Form.Select
                    name="category_id"
                    value={editFormData.category_id}
                    onChange={handleEditInputChange}
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#28a745';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                style={{
                  borderRadius: '8px',
                  border: '2px solid #e9ecef',
                  padding: '12px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#28a745';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                    Unité *
                  </Form.Label>
                  <Form.Select
                    name="unit_name"
                    value={editFormData.unit_name}
                    onChange={handleEditInputChange}
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#28a745';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
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
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                    Quantité actuelle *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditInputChange}
                    min="0"
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#28a745';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                    Stock minimum *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="min_stock"
                    value={editFormData.min_stock}
                    onChange={handleEditInputChange}
                    min="0"
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#28a745';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                    Prix (Ar)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={editFormData.price || ''}
                    onChange={handleEditInputChange}
                    min="0"
                    step="0.01"
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#28a745';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333' }}>
                    Fournisseur
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={editFormData.supplier}
                    onChange={handleEditInputChange}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#28a745';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)';
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
        
        <Modal.Footer style={{ border: 'none', padding: '1rem 2rem 2rem' }}>
          <Button 
            variant="outline-secondary" 
            onClick={cancelEdit}
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
            variant="success" 
            onClick={handleEditSubmit}
            disabled={submitting}
            style={{
              borderRadius: '8px',
              padding: '8px 20px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none'
            }}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Modification en cours...
              </>
            ) : (
              <>
                <Icon name="save" size={16} className="me-1" />
                Modifier le médicament
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation pour l'arrêt définitif */}
      <Modal 
        show={showDiscontinueModal} 
        onHide={cancelDiscontinue}
        centered
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header 
          closeButton={false}
          style={{
            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <Modal.Title className="d-flex align-items-center">
            <Icon name="alert-triangle" size={24} className="me-2" />
            <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>
              ⚠️ ARRÊT DÉFINITIF
            </span>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ padding: '2rem' }}>
          <div className="text-center mb-4">
            <div 
              style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}
            >
              🚨
            </div>
            <h4 style={{ color: '#dc3545', fontWeight: '700', marginBottom: '1rem' }}>
              ATTENTION - ACTION IRRÉVERSIBLE
            </h4>
          </div>

          <div 
            style={{
              background: '#fff3cd',
              border: '2px solid #ffeaa7',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <p style={{ margin: 0, fontWeight: '600', color: '#856404' }}>
              Vous êtes sur le point d'arrêter définitivement :
            </p>
            <h5 style={{ 
              color: '#dc3545', 
              fontWeight: '700', 
              margin: '0.5rem 0',
              textAlign: 'center'
            }}>
              "{medicationToDiscontinue?.name}"
            </h5>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h6 style={{ fontWeight: '700', color: '#dc3545', marginBottom: '1rem' }}>
              🚨 CETTE ACTION EST IRRÉVERSIBLE ! 🚨
            </h6>
            <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                Le médicament ne pourra plus être réactivé
              </li>
              <li style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                Il sera marqué comme "Arrêté définitivement"
              </li>
              <li style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                Cette décision ne peut pas être annulée
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="discontinueConfirmation"
              style={{ 
                fontWeight: '700', 
                color: '#dc3545',
                marginBottom: '0.5rem',
                display: 'block'
              }}
            >
              Pour confirmer, tapez exactement : <strong>ARRETER</strong>
            </label>
            <Form.Control
              id="discontinueConfirmation"
              type="text"
              value={discontinueConfirmation}
              onChange={(e) => setDiscontinueConfirmation(e.target.value)}
              placeholder="Tapez ARRETER ici..."
              style={{
                border: '2px solid #dc3545',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                textAlign: 'center',
                textTransform: 'uppercase'
              }}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="danger" style={{ marginTop: '1rem' }}>
              {error}
            </Alert>
          )}
        </Modal.Body>
        
        <Modal.Footer 
          style={{ 
            border: 'none', 
            padding: '1rem 2rem 2rem',
            justifyContent: 'center',
            gap: '1rem'
          }}
        >
          <Button 
            variant="outline-secondary" 
            onClick={cancelDiscontinue}
            size="lg"
            style={{
              borderRadius: '8px',
              padding: '10px 30px',
              fontWeight: '600',
              border: '2px solid #6c757d'
            }}
          >
            <Icon name="x" size={16} className="me-2" />
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDiscontinue}
            size="lg"
            disabled={discontinueConfirmation.trim() !== 'ARRETER'}
            style={{
              borderRadius: '8px',
              padding: '10px 30px',
              fontWeight: '700',
              background: discontinueConfirmation.trim() === 'ARRETER' 
                ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' 
                : '#6c757d',
              border: 'none',
              opacity: discontinueConfirmation.trim() === 'ARRETER' ? 1 : 0.6
            }}
          >
            <Icon name="alert-triangle" size={16} className="me-2" />
            Arrêter Définitivement
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GlobalStockManagement;
