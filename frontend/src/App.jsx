import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import LandingPage from './pages/LandingPage';

// Customer Portal
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { TicketsPage } from './pages/customer/TicketsPage';
import { TicketDetailsPage } from './pages/customer/TicketDetailsPage';
import { NewTicketPage } from './pages/customer/NewTicketPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { ReturnRefundPage } from './pages/customer/ReturnRefundPage';
import { ProfilePage as CustomerProfilePage } from './pages/customer/ProfilePage';
import { SettingsPage as CustomerSettingsPage } from './pages/customer/SettingsPage';

// Agent Portal
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { ResponseTemplates } from './pages/agent/ResponseTemplates';
import { CustomerProfile } from './pages/agent/CustomerProfile';
import { TicketDetails } from './pages/agent/TicketDetails';
import { CommunicationTools } from './pages/agent/CommunicationTools';
import { Settings as AgentSettings } from './pages/agent/Settings';

// Other Portals


import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { TeamManagement } from './pages/supervisor/TeamManagement';
import { TicketManagement } from './pages/supervisor/TicketManagement';
import { SupervisorCustomers } from './pages/supervisor/SupervisorCustomers';
import { SupervisorProfile } from './pages/supervisor/SupervisorProfile';
import { Settings } from './pages/supervisor/Settings';


import { VendorDashboard } from './pages/vendor/VendorDashboard';
import AnalyticsDashboard from './pages/vendor/AnalyticsDashboard';
import AICopilotPage from './pages/vendor/AICopilotPage';
import { ProductComplaintsPage } from './pages/vendor/ProductComplaintsPage';
import { ProductDetailsPage } from './pages/vendor/ProductDetailsPage';
import { ProfilePage as VendorProfilePage } from './pages/vendor/ProfilePage';
import { SettingsPage as VendorSettingsPage } from './pages/vendor/SettingsPage';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />

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
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/settings"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Agent Portal Routes */}
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/ticket"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/response_templates"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <ResponseTemplates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/active_customers"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/tickets/:ticket_id"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <TicketDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/ticket/:ticket_id/communication"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <CommunicationTools />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/settings"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentSettings />
                </ProtectedRoute>
              }
            />


            {/* Other Portal Routes */}
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
              path="/supervisor/ticket_management"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <TicketManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/all_customers"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <SupervisorCustomers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/profile"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <SupervisorProfile />
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
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/ai-copilot"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <AICopilotPage />
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
            <Route
              path="/vendor/profile"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/settings"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorSettingsPage />
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
    </ThemeProvider>
  );
}

export default App;
