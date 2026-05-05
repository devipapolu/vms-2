import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import Status from './pages/Status';
import Logs from './pages/Logs';
import Booking from './pages/Booking';
import VisitorPass from './pages/VisitorPass';
import Layout from './components/Layout';
import { useGeofence } from './hooks/useGeofence';

function App() {
  const GeofenceTracker = () => {
    const activeVisitId = localStorage.getItem('activeVisitLogId');
    useGeofence(activeVisitId, !!activeVisitId);
    return null;
  };

  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="min-h-screen">
        <GeofenceTracker />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/register-visitor" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
          <Route path="/status" element={<ProtectedRoute><Status /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/visitor-pass/:qrToken" element={<ProtectedRoute><VisitorPass /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
