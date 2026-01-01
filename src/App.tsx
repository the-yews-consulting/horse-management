import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomeAssistantProvider } from './contexts/HomeAssistantContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { StableDashboard } from './pages/StableDashboard';
import { HorsesPage } from './pages/HorsesPage';
import { StallsPage } from './pages/StallsPage';
import { OwnersPage } from './pages/OwnersPage';
import { VetsFarriersPage } from './pages/VetsFarriersPage';
import { WhiteboardPage } from './pages/WhiteboardPage';
import { HomeAssistantPage } from './pages/HomeAssistantPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <HomeAssistantProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StableDashboard />} />
              <Route path="horses" element={<HorsesPage />} />
              <Route path="stalls" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><StallsPage /></ProtectedRoute>} />
              <Route path="owners" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><OwnersPage /></ProtectedRoute>} />
              <Route path="vets-farriers" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><VetsFarriersPage /></ProtectedRoute>} />
              <Route path="whiteboard" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><WhiteboardPage /></ProtectedRoute>} />
              <Route path="home-assistant" element={<ProtectedRoute requiredRoles={['admin', 'staff']}><HomeAssistantPage /></ProtectedRoute>} />
              <Route path="admin" element={<ProtectedRoute requiredRoles={['admin']}><AdminPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HomeAssistantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
