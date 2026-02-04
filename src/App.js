import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Applications from './components/Applications/Applications';
import Customers from './components/Customers/Customers';
import Visitors from './components/Visitors/Visitors';
import Visits from './components/Visits/Visits';
import Appointments from './components/Appointments/Appointments';
import Staff from './components/Staff/Staff';
import ServiceCategories from './components/Services/ServiceCategories';
import Services from './components/Services/Services';
import UserProfile from './components/Profile/UserProfile';
import Reports from './components/Reports/Reports';
import DocumentManager from './components/Documents/DocumentManager';
import Users from './components/Users/Users';
import Settings from './components/Settings/Settings';
import WebsiteEditor from './components/Website/WebsiteEditor';
import AgentApplications from './components/AgentApplications/AgentApplications';
import PublicLayout from './components/Website/PublicLayout';
import HomePage from './components/Website/HomePage';
import AboutPage from './components/Website/AboutPage';
import ServicesPage from './components/Website/ServicesPage';
import ContactPage from './components/Website/ContactPage';
import RegisterAgentPage from './components/Website/RegisterAgentPage';

function LoginRoute() {
  const { isAuthenticated, login } = useAuth();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <Login onLogin={login} />;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="register-agent" element={<RegisterAgentPage />} />
              </Route>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/app" element={<ProtectedRoute><AppContent /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="applications" element={<Applications />} />
                <Route path="customers" element={<Customers />} />
                <Route path="visitors" element={<Visitors />} />
                <Route path="visits" element={<Visits />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="staff" element={<Staff />} />
                <Route path="service-categories" element={<ServiceCategories />} />
                <Route path="services" element={<Services />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="reports" element={<Reports />} />
                <Route path="documents" element={<DocumentManager />} />
                <Route path="users" element={<Users />} />
                <Route path="agent-applications" element={<AgentApplications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="website" element={<WebsiteEditor />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
