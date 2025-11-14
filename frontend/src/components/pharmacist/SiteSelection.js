import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import SiteService from '../../services/siteService';

const STORAGE_KEY = 'currentSiteId';

const SiteSelection = ({ onSelected }) => {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const loadSites = async () => {
      try {
        setError('');
        // 1) Tenter depuis le user en mémoire
        let allowedSites = Array.isArray(user?.sites) ? user.sites : [];

        // 2) Si vide, tenter depuis le profil backend (user + sites)
        if (!allowedSites.length) {
          try {
            const profile = await authService.getProfile();
            if (profile?.sites && Array.isArray(profile.sites)) {
              allowedSites = profile.sites;
            }
          } catch (_) {
            // Ignorer ici, on tentera une autre option
          }
        }

        // 3) Si toujours vide et que l'utilisateur a des droits globaux, charger les sites actifs
        const role = (user?.role || '').toLowerCase();
        const hasGlobalScope = role === 'admin' || role === 'admin_pharmacist' || role === 'admin-pharmacist';
        if (!allowedSites.length && hasGlobalScope) {
          try {
            const resp = await SiteService.getActiveSites();
            // Attendu: resp.data ou resp?.data?.sites selon votre API; on gère les deux
            const list = resp?.data?.sites || resp?.data || resp || [];
            allowedSites = Array.isArray(list) ? list : [];
          } catch (e) {
            // Laisser l'erreur gérée en dessous si aucune source
          }
        }

        setSites(allowedSites);

        if (allowedSites.length === 1) {
          const only = String(allowedSites[0]?.id || allowedSites[0]);
          setSelected(only);
        } else {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) setSelected(saved);
        }
      } catch (e) {
        setError("Impossible de charger les sites autorisés");
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    localStorage.setItem(STORAGE_KEY, selected);
    if (onSelected) {
      onSelected(selected);
    } else {
      // Rediriger simplement vers le dashboard pharmacien
      window.location.href = '/pharmacist/dashboard';
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <Container>
        <div className="d-flex justify-content-center">
          <Card className="shadow-sm" style={{ maxWidth: 520, width: '100%' }}>
            <Card.Header className="bg-white">
              <h5 className="mb-0 text-success">Choisir le site de travail</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Site</Form.Label>
                    <Form.Select value={selected} onChange={(e) => setSelected(e.target.value)} disabled={sites.length === 1}>
                      <option value="">Sélectionnez un site</option>
                      {sites.map((s) => {
                        const id = String(s.id || s);
                        const name = s.name || `Site ${id}`;
                        return <option key={id} value={id}>{name}</option>;
                      })}
                    </Form.Select>
                  </Form.Group>
                  <div className="d-grid">
                    <Button type="submit" variant="success" disabled={!selected}>Continuer</Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default SiteSelection;


