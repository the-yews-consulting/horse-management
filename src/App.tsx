import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomeAssistantProvider } from './contexts/HomeAssistantContext';
import { MainLayout } from './components/Layout/MainLayout';
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
            <Route path="/" element={<MainLayout />}>
              <Route index element={<StableDashboard />} />
              <Route path="horses" element={<HorsesPage />} />
              <Route path="stalls" element={<StallsPage />} />
              <Route path="owners" element={<OwnersPage />} />
              <Route path="vets-farriers" element={<VetsFarriersPage />} />
              <Route path="whiteboard" element={<WhiteboardPage />} />
              <Route path="home-assistant" element={<HomeAssistantPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HomeAssistantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
