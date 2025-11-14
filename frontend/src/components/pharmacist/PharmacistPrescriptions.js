
import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Row, Col, Form, Modal, Spinner, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import PharmacistHeader from './PharmacistHeader';
import PharmacistSidebar from './PharmacistSidebar';
import Icon from '../common/Icons';
import PrescriptionService from '../../services/prescriptionService';
import medicationService from '../../services/medicationService';
import StockService from '../../services/stockService';
import './PharmacistPrescriptions.css';
import './PharmacistPrescriptionsFullscreen.css';

const PharmacistPrescriptions = () => {
  const { logout, user } = useAuth();
  const currentSiteId = localStorage.getItem('currentSiteId');
  const [prescriptions, setPrescriptions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(!!currentSiteId);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patient_name: '',
    patient_phone: '',
    items: [{
      medication_id: '',
      quantity: 1,
      dosage: '',
      notes: ''
    }],
    notes: ''
  });
  const [availableStock, setAvailableStock] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [notifications, setNotifications] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchMedication, setSearchMedication] = useState('');
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [showStockAlert, setShowStockAlert] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentSiteId');
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddPrescription = () => {
    setShowAddModal(true);
    setAvailableStock({});
    setCurrentStep(1);
    setSearchMedication('');
    setFilteredMedications([]);
    setShowStockAlert(false);
  };

  const handleMedicationChange = async (medicationId, itemIndex) => {
    if (!medicationId || !currentSiteId) {
      return;
    }

    try {
      const stockResponse = await StockService.getSiteStocks(currentSiteId);
      if (stockResponse.success) {
        const siteStocks = stockResponse.data || [];
        const medicationStock = siteStocks.find(stock => 
          stock.medication_id == medicationId
        );
        
        setAvailableStock(prev => ({
          ...prev,
          [itemIndex]: medicationStock ? medicationStock.quantity : 0
        }));
        
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du stock:', error);
      setAvailableStock(prev => ({
        ...prev,
        [itemIndex]: 0
      }));
    }
  };

  const addMedicationItem = () => {
    setNewPrescription(prev => ({
      ...prev,
      items: [...prev.items, {
        medication_id: '',
        quantity: 1,
        dosage: '',
        notes: ''
      }]
    }));
  };

  const removeMedicationItem = (index) => {
    if (newPrescription.items.length > 1) {
      setNewPrescription(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      
      setAvailableStock(prev => {
        const newStock = { ...prev };
        delete newStock[index];
        return newStock;
      });
    }
  };

  const updateMedicationItem = (index, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getValidationErrors = () => {
    const errors = [];
    
    if (!newPrescription.patient_name) {
      errors.push('Le nom du patient est obligatoire');
    }
    
    if (!newPrescription.items || newPrescription.items.length === 0) {
      errors.push('Au moins un médicament est obligatoire');
    } else {
      newPrescription.items.forEach((item, index) => {
        if (!item.medication_id) {
          errors.push(`Le médicament ${index + 1} est obligatoire`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`La quantité du médicament ${index + 1} est obligatoire`);
        }
        // Validation du stock en temps réel
        if (item.medication_id && availableStock[index] !== undefined) {
          if (availableStock[index] === 0) {
            errors.push(`Le médicament ${index + 1} est en rupture de stock`);
          } else if (item.quantity > availableStock[index]) {
            errors.push(`Quantité insuffisante pour le médicament ${index + 1} (${availableStock[index]} disponible)`);
          }
        }
      });
    }
    
    return errors;
  };

  // Nouvelle fonction pour obtenir le statut de validation d'un item
  const getItemValidationStatus = (item, index) => {
    if (!item.medication_id) return 'empty';
    if (availableStock[index] === undefined) return 'loading';
    if (availableStock[index] === 0) return 'out-of-stock';
    if (item.quantity > availableStock[index]) return 'insufficient';
    if (item.quantity <= availableStock[index] && item.quantity > 0) return 'valid';
    return 'invalid';
  };

  // Nouvelle fonction pour obtenir le message de validation d'un item
  const getItemValidationMessage = (item, index) => {
    const status = getItemValidationStatus(item, index);
    switch (status) {
      case 'empty':
        return 'Sélectionnez un médicament';
      case 'loading':
        return 'Vérification du stock...';
      case 'out-of-stock':
        return 'Rupture de stock';
      case 'insufficient':
        return `Stock insuffisant (${availableStock[index]} disponible)`;
      case 'valid':
        return `${availableStock[index]} unités disponibles`;
      case 'invalid':
        return 'Quantité invalide';
      default:
        return '';
    }
  };

  const isFormValid = () => {
    return getValidationErrors().length === 0;
  };

  // Fonctions de filtrage et tri
  const getFilteredPrescriptions = () => {
    let filtered = [...prescriptions];

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prescription => 
        prescription.patient_name?.toLowerCase().includes(query) ||
        prescription.patient_phone?.includes(query) ||
        prescription.notes?.toLowerCase().includes(query) ||
        prescription.items?.some(item => 
          item.medication_name?.toLowerCase().includes(query)
        )
      );
    }

    // Filtrage par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter);
    }

    // Filtrage par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(prescription => {
        const prescriptionDate = new Date(prescription.created_at);
        return prescriptionDate.toDateString() === filterDate.toDateString();
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PREPARING': return 'info';
      case 'PREPARED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PREPARING': return 'En préparation';
      case 'PREPARED': return 'Préparée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  // Fonction pour afficher des notifications
  const showNotification = (message, type = 'success') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Fonctions pour améliorer l'UX
  const handleMedicationSearch = (query) => {
    setSearchMedication(query);
    if (query.trim()) {
      const filtered = medications.filter(med => 
        med.name.toLowerCase().includes(query.toLowerCase()) ||
        med.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedications(filtered);
    } else {
      setFilteredMedications([]);
    }
  };

  const getStepStatus = (step) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  const canProceedToStep = (step) => {
    switch (step) {
      case 1:
        return newPrescription.patient_name.trim() !== '';
      case 2:
        return newPrescription.items.length > 0 && 
               newPrescription.items.every(item => item.medication_id && item.quantity > 0);
      case 3:
        return isFormValid();
      default:
        return false;
    }
  };

  const handleStepNavigation = (step) => {
    if (canProceedToStep(step - 1) || step === 1) {
      setCurrentStep(step);
    }
  };

  const getQuickStats = () => {
    const totalItems = newPrescription.items.length;
    const validItems = newPrescription.items.filter(item => 
      item.medication_id && item.quantity > 0
    ).length;
    const stockIssues = newPrescription.items.filter((item, index) => 
      item.medication_id && availableStock[index] !== undefined && 
      (availableStock[index] === 0 || item.quantity > availableStock[index])
    ).length;

    return { totalItems, validItems, stockIssues };
  };

  const handleSavePrescription = async () => {
    try {
      setSaving(true);
      setError('');
      
      // 1. Vérifier le stock disponible du site pour tous les médicaments
      
      const stockResponse = await StockService.getSiteStocks(currentSiteId);
      if (!stockResponse.success) {
        throw new Error('Impossible de vérifier le stock disponible');
      }
      
      const siteStocks = stockResponse.data || [];
      
      // Vérifier chaque médicament
      for (const item of newPrescription.items) {
        const medicationStock = siteStocks.find(stock => 
          stock.medication_id == item.medication_id
        );
        
        if (!medicationStock) {
          throw new Error(`Le médicament ${item.medication_id} n'est pas disponible dans ce site`);
        }
        
        if (medicationStock.quantity < item.quantity) {
          throw new Error(
            `Stock insuffisant pour ${medicationStock.medication_name}. Disponible : ${medicationStock.quantity} ${medicationStock.medication_unit || 'unités'}, Demandé : ${item.quantity}`
          );
        }
        
        if (medicationStock.is_out_of_stock) {
          throw new Error(`${medicationStock.medication_name} est en rupture de stock`);
        }
      }
      
      // 2. Créer la prescription
      const prescriptionData = {
        ...newPrescription,
        pharmacist_id: user.id // Ajouter l'ID du pharmacien connecté
      };
      
      await PrescriptionService.createPrescriptionForCurrentSite(prescriptionData);
      
      // 3. Recharger la liste des prescriptions
      await loadPrescriptions();
      
      setShowAddModal(false);
      setNewPrescription({
        patient_name: '',
        patient_phone: '',
        items: [{
          medication_id: '',
          quantity: 1,
          dosage: '',
          notes: ''
        }],
        notes: ''
      });
      
      showNotification('Ordonnance créée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la création de la prescription:', error);
      setError(error.message || error.response?.data?.message || 'Erreur lors de la création de la prescription');
    } finally {
      setSaving(false);
    }
  };

  const handlePrepare = async (prescriptionId) => {
    try {
      setError('');
      
      // Trouver la prescription dans la liste
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) {
        throw new Error('Prescription non trouvée');
      }
      
      // Vérifier à nouveau le stock avant préparation pour tous les médicaments
      const stockResponse = await StockService.getSiteStocks(currentSiteId);
      if (!stockResponse.success) {
        throw new Error('Impossible de vérifier le stock');
      }
      
      const siteStocks = stockResponse.data || [];
      
      // Vérifier chaque médicament de la prescription
      for (const item of prescription.items || []) {
        const medicationStock = siteStocks.find(stock => 
          stock.medication_id == item.medication_id
        );
        
        if (!medicationStock || medicationStock.quantity < item.quantity) {
          throw new Error(`Stock insuffisant pour ${item.medication_name || 'un médicament'}`);
        }
      }
      
      // Marquer comme en préparation
      await PrescriptionService.markAsPreparing(prescriptionId);
      await loadPrescriptions(); // Recharger la liste
      
      showNotification(`Prescription #${prescriptionId} mise en préparation !`, 'info');
    } catch (error) {
      console.error('Erreur lors de la préparation:', error);
      setError(error.message || error.response?.data?.message || 'Erreur lors de la préparation');
    }
  };

  const handleMarkAsPrepared = async (prescriptionId) => {
    try {
      setError('');
      
      // Trouver la prescription dans la liste
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) {
        throw new Error('Prescription non trouvée');
      }
      
      // Vérifier le stock une dernière fois pour tous les médicaments
      const stockResponse = await StockService.getSiteStocks(currentSiteId);
      if (!stockResponse.success) {
        throw new Error('Impossible de vérifier le stock');
      }
      
      const siteStocks = stockResponse.data || [];
      
      // Vérifier chaque médicament de la prescription
      for (const item of prescription.items || []) {
        const medicationStock = siteStocks.find(stock => 
          stock.medication_id == item.medication_id
        );
        
        if (!medicationStock || medicationStock.quantity < item.quantity) {
          throw new Error(`Stock insuffisant pour finaliser ${item.medication_name || 'un médicament'}`);
        }
      }
      
      // Marquer comme préparée (cela devrait automatiquement déduire le stock côté serveur)
      await PrescriptionService.markAsPrepared(prescriptionId);
      
      // Recharger les prescriptions
      await loadPrescriptions();
      
      showNotification(`Prescription #${prescriptionId} finalisée ! Stock mis à jour.`, 'success');
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      setError(error.message || error.response?.data?.message || 'Erreur lors de la finalisation');
    }
  };

  const loadPrescriptions = async () => {
    if (!currentSiteId) return;
    
    try {
      setError('');
      setLoading(true);
      const response = await PrescriptionService.getCurrentSitePrescriptions();
      const data = response?.data || response;
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des prescriptions:", error);
      setError("Impossible de charger les prescriptions.");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async () => {
    try {
      setLoadingMedications(true);
      const response = await medicationService.getAllMedications();
      const data = response?.data || response;
      setMedications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des médicaments:", error);
    } finally {
      setLoadingMedications(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
    loadMedications();
  }, [currentSiteId]);

  // Raccourcis clavier pour améliorer l'UX
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showAddModal) return;
      
      // Ctrl + S pour sauvegarder
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (isFormValid() && !saving) {
          handleSavePrescription();
        }
      }
      
      // Ctrl + N pour nouveau médicament
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        addMedicationItem();
      }
      
      // Échap pour fermer
      if (e.key === 'Escape') {
        setShowAddModal(false);
      }
      
      // Tab pour navigation entre étapes
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
        }
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (currentStep < 3 && canProceedToStep(currentStep)) {
          setCurrentStep(currentStep + 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, isFormValid, saving, currentStep]);

  return (
    <div className="pharmacist-dashboard pharmacist-prescriptions">
      {/* Sidebar */}
      <PharmacistSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <PharmacistHeader 
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />

        {/* Prescriptions Content */}
        <Container fluid className="py-4">
          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="notification-container">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-toast ${notification.type}`}
                  onClick={() => removeNotification(notification.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`notification-icon ${notification.type}`}>
                    <i className={`fas ${
                      notification.type === 'success' ? 'fa-check-circle' :
                      notification.type === 'info' ? 'fa-info-circle' :
                      notification.type === 'warning' ? 'fa-exclamation-triangle' :
                      'fa-times-circle'
                    }`}></i>
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistiques rapides */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon pending">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-value">{prescriptions.filter(p => p.status === 'PENDING').length}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon preparing">
                <i className="fas fa-cogs"></i>
              </div>
              <div className="stat-value">{prescriptions.filter(p => p.status === 'PREPARING').length}</div>
              <div className="stat-label">En préparation</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon prepared">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-value">{prescriptions.filter(p => p.status === 'PREPARED').length}</div>
              <div className="stat-label">Préparées</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon total">
                <i className="fas fa-list"></i>
              </div>
              <div className="stat-value">{prescriptions.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>

          <div className="main-content-card">
            <div className="content-card-header">
              <h5 className="content-card-title">
                Ordonnances
              </h5>
              <button className="btn-modern btn-success" onClick={handleAddPrescription}>
                <i className="fas fa-plus"></i>
                Nouvelle ordonnance
              </button>
            </div>
            <div className="content-card-body">
              {!currentSiteId && (
                <div style={{ 
                  padding: '1rem', 
                  background: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '8px', 
                  marginBottom: '1.5rem',
                  color: '#92400e'
                }}>
                  ⚠️ Aucun site sélectionné.
                </div>
              )}

              {/* Barre de recherche et filtres */}
              <div className="filter-bar">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Rechercher</label>
                    <input
                      type="text"
                      className="filter-input"
                      placeholder="Patient, téléphone, médicament..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Statut</label>
                    <select
                      className="filter-input"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Tous</option>
                      <option value="PENDING">En attente</option>
                      <option value="PREPARING">En préparation</option>
                      <option value="PREPARED">Préparée</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Date</label>
                    <input
                      type="date"
                      className="filter-input"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Trier par</label>
                    <select
                      className="filter-input"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="created_at">Date</option>
                      <option value="patient_name">Patient</option>
                      <option value="status">Statut</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Ordre</label>
                    <select
                      className="filter-input"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="DESC">↓</option>
                      <option value="ASC">↑</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <button
                      className="filter-reset-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        setDateFilter('');
                        setSortBy('created_at');
                        setSortOrder('DESC');
                      }}
                      title="Réinitialiser les filtres"
                    >
                      <i className="fas fa-undo"></i>
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>

              {/* Compteur de résultats */}
              <div className="results-counter">
                <span>{getFilteredPrescriptions().length} ordonnance(s) sur {prescriptions.length} total</span>
                {(searchQuery || statusFilter !== 'ALL' || dateFilter) && (
                  <a
                    href="#"
                    className="clear-filters-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setDateFilter('');
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Effacer les filtres
                  </a>
                )}
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                </div>
              ) : error ? (
                <div style={{
                  padding: '1rem',
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#dc2626'
                }}>
                  ⚠️ {error}
                </div>
              ) : getFilteredPrescriptions().length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-file-prescription"></i>
                  </div>
                  <h6 className="empty-title">
                    {prescriptions.length === 0 ? 'Aucune ordonnance' : 'Aucun résultat trouvé'}
                  </h6>
                  <p className="empty-description">
                    {prescriptions.length === 0 
                      ? 'Commencez par créer votre première ordonnance'
                      : 'Essayez de modifier vos critères de recherche'}
                  </p>
                </div>
              ) : (
                <table className="prescriptions-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Téléphone</th>
                      <th>Médicaments</th>
                      <th className="text-center">Statut</th>
                      <th className="text-center">Date</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredPrescriptions().map((prescription) => (
                      <tr key={prescription.id}>
                        <td className="patient-name">{prescription.patient_name}</td>
                        <td>{prescription.patient_phone || '--'}</td>
                        <td>
                          <div className="medications-list">
                            {prescription.items && prescription.items.length > 0 ? (
                              prescription.items.map((item, index) => (
                                <div key={index} className="medication-item">
                                  <span className="medication-badge">{item.quantity}x</span>
                                  <span className="medication-name">{item.medication_name}</span>
                                  {item.dosage && (
                                    <span className="medication-dosage">({item.dosage})</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span style={{ color: '#9ca3af' }}>Aucun médicament</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {prescription.status === 'PENDING' ? (
                            <span className="status-badge pending">En attente</span>
                          ) : prescription.status === 'PREPARING' ? (
                            <span className="status-badge preparing">En préparation</span>
                          ) : prescription.status === 'PREPARED' ? (
                            <span className="status-badge prepared">Préparée</span>
                          ) : (
                            <span className="status-badge cancelled">Annulée</span>
                          )}
                        </td>
                        <td className="date-cell">
                          {new Date(prescription.prescribed_date || prescription.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="action-cell">
                          {prescription.status === 'PENDING' && (
                            <button 
                              className="btn-modern btn-outline-primary btn-sm"
                              onClick={() => handlePrepare(prescription.id)}
                            >
                              Préparer
                            </button>
                          )}
                          {prescription.status === 'PREPARING' && (
                            <button 
                              className="btn-modern btn-outline-success btn-sm"
                              onClick={() => handleMarkAsPrepared(prescription.id)}
                            >
                              Finaliser
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Modal d'ajout - Design Professionnel Plein Écran */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        size="xl"
        className="prescription-modal-fullscreen"
        backdrop={true}
        keyboard={true}
        centered
      >
        <Modal.Header className="prescription-header border-0">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center">
                  <div className="prescription-logo me-4">
                    <div className="logo-circle">
                      <i className="fas fa-prescription-bottle-alt"></i>
                    </div>
                  </div>
                  <div>
                    <Modal.Title className="prescription-title mb-1">
                      Nouvelle Ordonnance Médicale
                    </Modal.Title>
                    <div className="prescription-subtitle">
                      <i className="fas fa-calendar-alt me-2"></i>
                      {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <span className="mx-3">•</span>
                      <i className="fas fa-clock me-2"></i>
                      {new Date().toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-end">
                <div className="prescription-pharmacist">
                  <div className="pharmacist-badge">
                    <div className="pharmacist-avatar">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <div className="pharmacist-info">
                      <div className="pharmacist-name">
                        Dr. {user?.first_name} {user?.last_name}
                      </div>
                      <div className="pharmacist-role">
                        Pharmacien Responsable
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Header>
        
        <Modal.Body className="prescription-body p-0">
          <div className="container-fluid h-100">
            <div className="row h-100 g-0">
              
              {/* PARTIE GAUCHE - Informations Patient */}
              <div className="col-md-6 patient-section">
                <div className="section-content h-100 p-4">
                  <div className="section-header mb-4">
                    <div className="section-title">
                      <h5 className="text-primary mb-2">
                        <i className="fas fa-user me-2"></i>
                        Informations Patient
                      </h5>
                      <p className="text-muted mb-0">Données personnelles du patient</p>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger border-0 mb-4">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle me-3 text-danger"></i>
                        <div>
                          <strong>Erreur de validation</strong>
                          <div className="small mt-1">{error}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="patient-form">
                    <div className="form-group mb-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-user me-2 text-primary"></i>
                        Nom complet du patient *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${!newPrescription.patient_name ? 'is-invalid' : 'is-valid'}`}
                        value={newPrescription.patient_name}
                        onChange={(e) => setNewPrescription({...newPrescription, patient_name: e.target.value})}
                        placeholder="Ex: Jean Dupont"
                        required
                      />
                      {!newPrescription.patient_name && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          Le nom du patient est obligatoire
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group mb-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-phone me-2 text-primary"></i>
                        Téléphone (optionnel)
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        value={newPrescription.patient_phone}
                        onChange={(e) => setNewPrescription({...newPrescription, patient_phone: e.target.value})}
                        placeholder="Ex: 06 12 34 56 78"
                      />
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-sticky-note me-2 text-primary"></i>
                        Notes et recommandations
                      </label>
                      <textarea
                        className="form-control"
                        rows={6}
                        value={newPrescription.notes}
                        onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                        placeholder="Instructions particulières pour le patient (allergies, interactions, conseils d'usage, précautions spéciales...)"
                      />
                      <div className="form-text">
                        Ces notes seront visibles sur l'ordonnance finale.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PARTIE DROITE - Médicaments */}
              <div className="col-md-6 medications-section">
                <div className="section-content h-100 p-4">
                  <div className="section-header mb-4">
                    <div className="section-title">
                      <h5 className="text-success mb-2">
                        <i className="fas fa-pills me-2"></i>
                        Médicaments Prescrits
                      </h5>
                      <p className="text-muted mb-0">{newPrescription.items.length} médicament(s) dans la prescription</p>
                    </div>
                  </div>

                  <div className="medications-container">
                    {newPrescription.items.length === 0 ? (
                      <div className="empty-medications text-center py-5">
                        <div className="empty-icon mb-3">
                          <i className="fas fa-pills text-muted" style={{fontSize: '3rem'}}></i>
                        </div>
                        <h6 className="text-muted mb-3">Aucun médicament ajouté</h6>
                        <p className="text-muted mb-4">Commencez par ajouter le premier médicament à la prescription</p>
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={addMedicationItem}
                          disabled={loadingMedications}
                        >
                          <i className="fas fa-plus me-2"></i>
                          Ajouter le premier médicament
                        </button>
                      </div>
                    ) : (
                      <div className="medications-list">
                        {newPrescription.items.map((item, index) => {
                          const selectedMedication = medications.find(med => med.id == item.medication_id);
                          const validationStatus = getItemValidationStatus(item, index);
                          const hasIssues = validationStatus === 'out-of-stock' || validationStatus === 'insufficient';
                          const isValid = validationStatus === 'valid';
                          
                          return (
                            <div key={index} className={`medication-item mb-3 p-3 border rounded ${hasIssues ? 'border-danger bg-danger bg-opacity-10' : isValid ? 'border-success bg-success bg-opacity-10' : 'border-secondary'}`}>
                              <div className="d-flex align-items-start justify-content-between">
                                <div className="medication-info flex-grow-1">
                                  <div className="d-flex align-items-center mb-2">
                                    <span className="badge bg-primary me-2">#{index + 1}</span>
                                    <h6 className="mb-0 fw-semibold">
                                      {selectedMedication ? selectedMedication.name : 'Médicament non sélectionné'}
                                    </h6>
                                  </div>
                                  <div className="medication-details text-muted small">
                                    <div>Quantité: <span className="fw-semibold">{item.quantity}</span></div>
                                    {item.dosage && <div>Dosage: <span className="fw-semibold">{item.dosage}</span></div>}
                                    {item.notes && <div>Notes: <span className="fw-semibold">{item.notes}</span></div>}
                                  </div>
                                </div>
                                <div className="medication-actions d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                                    title="Modifier ce médicament"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  {newPrescription.items.length > 1 && (
                                    <button 
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeMedicationItem(index)}
                                      title="Supprimer ce médicament"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Indicateur de stock */}
                              {item.medication_id && (
                                <div className="stock-status mt-2">
                                  {(() => {
                                    const status = getItemValidationStatus(item, index);
                                    const message = getItemValidationMessage(item, index);
                                    
                                    switch (status) {
                                      case 'loading':
                                        return (
                                          <div className="d-flex align-items-center text-info">
                                            <Spinner size="sm" className="me-2" />
                                            <small>Vérification du stock...</small>
                                          </div>
                                        );
                                      case 'valid':
                                        return (
                                          <div className="d-flex align-items-center text-success">
                                            <i className="fas fa-check-circle me-2"></i>
                                            <small>{message}</small>
                                          </div>
                                        );
                                      case 'out-of-stock':
                                        return (
                                          <div className="d-flex align-items-center text-danger">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <small>{message}</small>
                                          </div>
                                        );
                                      case 'insufficient':
                                        return (
                                          <div className="d-flex align-items-center text-warning">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <small>{message}</small>
                                          </div>
                                        );
                                      default:
                                        return (
                                          <div className="d-flex align-items-center text-info">
                                            <i className="fas fa-info-circle me-2"></i>
                                            <small>{message}</small>
                                          </div>
                                        );
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Bouton d'ajout */}
                        <div className="text-center mt-4">
                          <button 
                            className="btn btn-outline-success"
                            onClick={addMedicationItem}
                            disabled={loadingMedications}
                          >
                            <i className="fas fa-plus me-2"></i>
                            Ajouter un autre médicament
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer className="prescription-footer border-0">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="prescription-status">
                  <div className="status-indicator">
                    <div className={`status-icon ${isFormValid() ? 'valid' : 'invalid'}`}>
                      <i className={`fas ${isFormValid() ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                    </div>
                    <div className="status-content">
                      <div className="status-title">
                        {isFormValid() ? 'Ordonnance prête' : 'Validation requise'}
                      </div>
                      <div className="status-description">
                        {isFormValid() ? 'Tous les champs sont valides' : `${getValidationErrors().length} erreur(s) à corriger`}
                      </div>
                    </div>
                  </div>
                  
                  {!isFormValid() && !saving && (
                    <div className="validation-errors">
                      <div className="error-list">
                        {getValidationErrors().slice(0, 3).map((error, index) => (
                          <div key={index} className="error-item">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            <span>{error}</span>
                          </div>
                        ))}
                        {getValidationErrors().length > 3 && (
                          <div className="error-item">
                            <span className="text-muted">... et {getValidationErrors().length - 3} autre(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="prescription-actions">
                  <button 
                    className="btn btn-outline-secondary me-3"
                    onClick={() => setShowAddModal(false)}
                    disabled={saving}
                  >
                    <i className="fas fa-times me-2"></i>
                    Annuler
                  </button>
                  <button 
                    className={`btn ${isFormValid() ? 'btn-success' : 'btn-secondary'} btn-lg`}
                    onClick={handleSavePrescription}
                    disabled={saving || !isFormValid()}
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Créer l'ordonnance
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PharmacistPrescriptions;
