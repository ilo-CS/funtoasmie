import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import StockService from '../../services/stockService';
import PharmacistHeader from './PharmacistHeader';
import PharmacistSidebar from './PharmacistSidebar';

const PharmacistInventory = () => {
  const { logout } = useAuth();
  const currentSiteId = localStorage.getItem('currentSiteId');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!currentSiteId);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleRequestSupply = (medication) => {
    // Pour l'instant, on affiche une alerte avec les détails
    // Plus tard, on pourra créer une vraie demande d'approvisionnement
    const message = `
Demande d'approvisionnement :
• Médicament : ${medication.medication_name || medication.name}
• Stock actuel : ${medication.quantity} ${medication.medication_unit || 'unités'}
• Stock minimum : ${medication.min_stock} ${medication.medication_unit || 'unités'}
• Site : ${currentSiteId}

Cette demande sera transmise à l'administrateur pharmacie.
    `;
    
    if (window.confirm(message)) {
      // TODO: Implémenter la vraie logique de demande
      alert('Demande d\'approvisionnement enregistrée !');
    }
  };

  useEffect(() => {
    const loadInventory = async () => {
      if (!currentSiteId) {
        setItems([]);
        setLoading(false);
        return;
      }
      
      try {
        setError('');
        setLoading(true);
        
        const resp = await StockService.getSiteStocks(currentSiteId);
        
        if (resp.success) {
          const siteStocks = resp.data || [];
          setItems(siteStocks);
        } else {
          console.error('❌ Erreur de réponse:', resp.message);
          setError(resp.message || 'Erreur lors du chargement de l\'inventaire');
          setItems([]);
        }
      } catch (e) {
        console.error('❌ Erreur lors du chargement de l\'inventaire:', e);
        
        let errorMessage = "Impossible de charger l'inventaire du site";
        if (e.message.includes('DATABASE_TABLE_MISSING')) {
          errorMessage = 'Table des stocks non initialisée. Contactez l\'administrateur.';
        } else if (e.message.includes('DATABASE_CONNECTION_ERROR')) {
          errorMessage = 'Erreur de connexion à la base de données.';
        } else if (e.message.includes('fetch')) {
          errorMessage = 'Erreur de connexion au serveur.';
        } else if (e.message.includes('401')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (e.message.includes('403')) {
          errorMessage = 'Accès refusé. Vérifiez vos permissions pour ce site.';
        } else {
          errorMessage = e.message || 'Erreur inconnue';
        }
        
        setError(errorMessage);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadInventory();
  }, [currentSiteId]);

  const [filterStatus, setFilterStatus] = useState('all'); // all, low_stock, out_of_stock

  const filtered = items.filter((it) => {
    const name = (it.medication_name || it.name || '').toLowerCase();
    const matchesQuery = !query || name.includes(query.toLowerCase());
    
    if (filterStatus === 'all') return matchesQuery;
    if (filterStatus === 'low_stock') return matchesQuery && it.is_low_stock;
    if (filterStatus === 'out_of_stock') return matchesQuery && it.is_out_of_stock;
    
    return matchesQuery;
  });

  return (
    <div className="pharmacist-dashboard">
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

        {/* Inventory Content */}
        <Container fluid className="py-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-success">Inventaire du site</h5>
                <button 
                  className="btn btn-outline-success btn-sm"
                  onClick={() => {
                    // Recharger l'inventaire
                    const loadInventory = async () => {
                      if (!currentSiteId) return;
                      try {
                        setError('');
                        setLoading(true);
                        const resp = await StockService.getSiteStocks(currentSiteId);
                        if (resp.success) {
                          setItems(resp.data || []);
                        } else {
                          setError(resp.message || 'Erreur lors du rechargement');
                        }
                      } catch (e) {
                        setError("Impossible de recharger l'inventaire");
                      } finally {
                        setLoading(false);
                      }
                    };
                    loadInventory();
                  }}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Actualiser
                </button>
              </div>
            </Card.Header>
          <Card.Body>
            {!currentSiteId && (
              <Alert variant="warning" className="mb-3">Aucun site sélectionné.</Alert>
            )}

            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Control 
                  placeholder="Rechercher un médicament..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les stocks</option>
                  <option value="low_stock">Bas stock</option>
                  <option value="out_of_stock">Rupture</option>
                </Form.Select>
              </Col>
              <Col md={5} className="d-flex align-items-center">
                <small className="text-muted">
                  {filtered.length} médicament(s) trouvé(s)
                </small>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="success" />
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Médicament</th>
                      <th className="text-center">Statut</th>
                      <th className="text-end">Quantité</th>
                      <th className="text-end">Stock min</th>
                      <th className="text-end">Stock max</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">Aucun résultat</td>
                      </tr>
                    ) : (
                      filtered.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <div>
                              <div className="fw-semibold">{row.medication_name || row.name || `Médicament #${row.medication_id || ''}`}</div>
                              {row.medication_unit && (
                                <small className="text-muted">{row.medication_unit}</small>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            {row.is_out_of_stock ? (
                              <span className="badge bg-danger">Rupture</span>
                            ) : row.is_low_stock ? (
                              <span className="badge bg-warning">Bas stock</span>
                            ) : (
                              <span className="badge bg-success">Normal</span>
                            )}
                          </td>
                          <td className="text-end">
                            <span className={`fw-bold ${row.is_out_of_stock ? 'text-danger' : row.is_low_stock ? 'text-warning' : 'text-success'}`}>
                              {row.quantity ?? 0}
                            </span>
                          </td>
                          <td className="text-end">{row.min_stock ?? '--'}</td>
                          <td className="text-end">{row.max_stock ?? '--'}</td>
                          <td className="text-center">
                            {(row.is_low_stock || row.is_out_of_stock) && (
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  handleRequestSupply(row);
                                }}
                                title={`Demander ${row.medication_name}`}
                              >
                                <i className="fas fa-plus me-1"></i>
                                Demander
                              </button>
                            )}
                            {!row.is_low_stock && !row.is_out_of_stock && (
                              <span className="text-muted small">
                                <i className="fas fa-check text-success me-1"></i>
                                Stock OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default PharmacistInventory;


