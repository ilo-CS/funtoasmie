import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import AdminHeader from './AdminHeader';
import CompanyService from '../../services/companyService';
import './CompanyManagement.css';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    mail: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await CompanyService.getAllCompanies();
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      setError(error.message || 'Impossible de charger les entreprises');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      mail: ''
    });
    setShowModal(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      address: company.address || '',
      city: company.city || '',
      phone: company.phone || '',
      mail: company.mail || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider les données avant envoi
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Le nom de la société est obligatoire et doit contenir au moins 2 caractères');
      return;
    }
    
    try {
      console.log('Données à envoyer:', formData);
      
      if (editingCompany) {
        await CompanyService.updateCompany(editingCompany.id, formData);
      } else {
        await CompanyService.createCompany(formData);
      }
      setShowModal(false);
      setError('');
      loadCompanies();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      try {
        await CompanyService.deleteCompany(id);
        loadCompanies();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await CompanyService.deactivateCompany(id);
      loadCompanies();
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      setError(error.message || 'Erreur lors de la désactivation');
    }
  };

  return (
    <div className="company-management">
      <AdminHeader />
      <Container fluid className="py-4">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-building me-3"></i>
            Gestion des Sociétés
          </h1>
          <button className="btn-primary btn-create" onClick={handleCreate}>
            <i className="fas fa-plus me-2"></i>
            Nouvelle société
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement des sociétés...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-building"></i>
            <h3>Aucune société enregistrée</h3>
            <p>Commencez par créer votre première société</p>
            <button className="btn-primary" onClick={handleCreate}>
              Créer une société
            </button>
          </div>
        ) : (
          <div className="companies-grid">
            {companies.map((company) => (
              <div key={company.id} className="company-card">
                <div className="company-header">
                  <div className="company-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="company-status">
                    {company.is_active ? (
                      <span className="status-badge active">Actif</span>
                    ) : (
                      <span className="status-badge inactive">Inactif</span>
                    )}
                  </div>
                </div>
                <div className="company-body">
                  <h3 className="company-name">{company.name}</h3>
                  {company.address && (
                    <div className="company-info">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{company.address}</span>
                    </div>
                  )}
                  {company.city && (
                    <div className="company-info">
                      <i className="fas fa-city"></i>
                      <span>{company.city}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="company-info">
                      <i className="fas fa-phone"></i>
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.mail && (
                    <div className="company-info">
                      <i className="fas fa-envelope"></i>
                      <span>{company.mail}</span>
                    </div>
                  )}
                </div>
                <div className="company-actions">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => handleEdit(company)}
                    title="Modifier"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  {company.is_active && (
                    <button
                      className="btn-action btn-deactivate"
                      onClick={() => handleDeactivate(company.id)}
                      title="Désactiver"
                    >
                      <i className="fas fa-eye-slash"></i>
                    </button>
                  )}
                  <button
                    className="btn-action btn-delete"
                    onClick={() => handleDelete(company.id)}
                    title="Supprimer"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCompany ? 'Modifier la société' : 'Nouvelle société'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="name">
                  <i className="fas fa-building me-2"></i>
                  Nom de la société *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Entrez le nom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Entrez l'adresse"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">
                  <i className="fas fa-city me-2"></i>
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Entrez la ville"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <i className="fas fa-phone me-2"></i>
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Entrez le téléphone"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mail">
                  <i className="fas fa-envelope me-2"></i>
                  Email
                </label>
                <input
                  type="email"
                  id="mail"
                  value={formData.mail}
                  onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                  placeholder="Entrez l'email"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  {editingCompany ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
