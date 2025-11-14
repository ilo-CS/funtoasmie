import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import CompanyManagement from './components/admin/CompanyManagement';
import AdminPharmacistDashboard from './components/admin-pharmacist/AdminPharmacistDashboard';
import GlobalStockManagement from './components/admin-pharmacist/GlobalStockManagement';
import OrdersManagement from './components/admin-pharmacist/OrdersManagement';
import DistributionManagement from './components/admin-pharmacist/DistributionManagement';
import SiteManagement from './components/admin-pharmacist/SiteManagement';
import SiteStocksManagement from './components/admin-pharmacist/SiteStocksManagement';
import StockDashboard from './components/admin-pharmacist/StockDashboard';
import StockMovements from './components/admin-pharmacist/StockMovements';
import SiteSelection from './components/pharmacist/SiteSelection';
import PharmacistDashboard from './components/pharmacist/PharmacistDashboard';
import PharmacistInventory from './components/pharmacist/PharmacistInventory';
import PharmacistPrescriptions from './components/pharmacist/PharmacistPrescriptions';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import UserDashboard from './components/user/UserDashboard';
import UnauthorizedPage from './components/common/UnauthorizedPage';
import RoleGuard, { AdminGuard, UserManagementGuard, CompanyManagementGuard, ReportsGuard, SettingsGuard } from './components/common/RoleGuard';

// Composant pour les routes protégées
const AppRoutes = () => {
  const { user, loading, getRedirectUrl } = useAuth();

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route de connexion */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={getRedirectUrl(user.role)} replace /> : <LoginForm />} 
      />
      
      {/* Route d'erreur 403 */}
      <Route 
        path="/unauthorized" 
        element={<UnauthorizedPage />} 
      />
      
      {/* Routes protégées par rôles */}
      <Route 
        path="/admin" 
        element={
          <AdminGuard fallbackPath="/unauthorized">
            <AdminDashboard />
          </AdminGuard>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <UserManagementGuard fallbackPath="/unauthorized">
            <UserManagement />
          </UserManagementGuard>
        } 
      />
      
      <Route 
        path="/admin/company" 
        element={
          <CompanyManagementGuard fallbackPath="/unauthorized">
            <CompanyManagement />
          </CompanyManagementGuard>
        } 
      />
      
      <Route 
        path="/admin/reports" 
        element={
          <ReportsGuard fallbackPath="/unauthorized">
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
              <div className="text-center">
                <h2>Rapports</h2>
                <p>Page des rapports en cours de développement...</p>
              </div>
            </div>
          </ReportsGuard>
        } 
      />
      
      <Route 
        path="/admin/settings" 
        element={
          <SettingsGuard fallbackPath="/unauthorized">
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
              <div className="text-center">
                <h2>Paramètres</h2>
                <p>Page des paramètres en cours de développement...</p>
              </div>
            </div>
          </SettingsGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <AdminPharmacistDashboard />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist/global-stock" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <GlobalStockManagement />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist/orders" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <OrdersManagement />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist/sites" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <SiteManagement />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist/site-stocks" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <SiteStocksManagement />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist/distribution" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <DistributionManagement />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist/stock-dashboard" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <StockDashboard />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/admin-pharmacist/stock-movements" 
        element={
          <RoleGuard requiredRoles="admin pharmacist" fallbackPath="/unauthorized">
            <StockMovements />
          </RoleGuard>
        } 
      />
      
      
      <Route 
        path="/pharmacist" 
        element={
          <RoleGuard requiredRoles="pharmacist" fallbackPath="/unauthorized">
            <SiteSelection />
          </RoleGuard>
        } 
      />
      <Route 
        path="/pharmacist/dashboard" 
        element={
          <RoleGuard requiredRoles="pharmacist" fallbackPath="/unauthorized">
            <PharmacistDashboard />
          </RoleGuard>
        } 
      />
      <Route 
        path="/pharmacist/inventory" 
        element={
          <RoleGuard requiredRoles="pharmacist" fallbackPath="/unauthorized">
            <PharmacistInventory />
          </RoleGuard>
        } 
      />
      <Route 
        path="/pharmacist/prescriptions" 
        element={
          <RoleGuard requiredRoles="pharmacist" fallbackPath="/unauthorized">
            <PharmacistPrescriptions />
          </RoleGuard>
        } 
      />

      
      <Route 
        path="/doctor" 
        element={
          <RoleGuard requiredRoles="doctor" fallbackPath="/unauthorized">
            <DoctorDashboard />
          </RoleGuard>
        } 
      />
      
      <Route 
        path="/user" 
        element={
          <RoleGuard requiredRoles="user" fallbackPath="/unauthorized">
            <UserDashboard />
          </RoleGuard>
        } 
      />
      
      {/* Routes de redirection */}
      <Route 
        path="/" 
        element={<Navigate to={user ? getRedirectUrl(user.role) : "/login"} replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to={user ? getRedirectUrl(user.role) : "/login"} replace />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
