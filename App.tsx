
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Payments from './pages/Payments';
import Staff from './pages/Staff';
import Inventory from './pages/Inventory';
import Measurements from './pages/Measurements';
import SystemDesign from './pages/SystemDesign';
import Login from './pages/Login';
import UsersPage from './pages/UsersPage';
import { GymProvider, useGym } from './context/GymContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useGym();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// Admin Only Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useGym();
    if (currentUser?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/*" element={
                <ProtectedRoute>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/clients" element={<Members />} />
                            <Route path="/measurements" element={<Measurements />} />
                            <Route path="/payments" element={<Payments />} />
                            <Route path="/staff" element={<Staff />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/docs" element={<SystemDesign />} />
                            
                            {/* Admin Only Route */}
                            <Route path="/users" element={
                                <AdminRoute>
                                    <UsersPage />
                                </AdminRoute>
                            } />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <GymProvider>
      <Router>
        <AppRoutes />
      </Router>
    </GymProvider>
  );
};

export default App;