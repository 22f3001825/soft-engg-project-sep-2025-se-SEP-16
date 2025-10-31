import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Customer Portal
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { TicketsPage } from './pages/customer/TicketsPage';
import { TicketDetailsPage } from './pages/customer/TicketDetailsPage';
import { NewTicketPage } from './pages/customer/NewTicketPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { ReturnRefundPage } from './pages/customer/ReturnRefundPage';

// Other Portals
import { AgentDashboard } from './pages/agent/AgentDashboard';


import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { TeamManagement } from './pages/supervisor/TeamManagement';
import { Escalations } from './pages/supervisor/Escalations';
import { Settings } from './pages/supervisor/Settings';

import { VendorDashboard } from './pages/vendor/VendorDashboard';
import AnalyticsDashboard from './pages/vendor/AnalyticsDashboard';
import { ProductComplaintsPage } from './pages/vendor/ProductComplaintsPage';
import { ProductDetailsPage } from './pages/vendor/ProductDetailsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Customer Portal Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/tickets"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <TicketsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/tickets/new"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <NewTicketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/tickets/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <TicketDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders/track/:orderId"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrderTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders/return"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ReturnRefundPage />
                </ProtectedRoute>
              }
            />

            {/* Other Portal Routes */}
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/team_management"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <TeamManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/escalations"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <Escalations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/settings"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/analytics"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/complaints"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <ProductComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/products/:productId"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <ProductDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 - Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
