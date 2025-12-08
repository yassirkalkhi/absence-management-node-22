import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AbsencesPage from './pages/AbsencesPage';
import ClassesPage from './pages/ClassesPage';
import ModulesPage from './pages/ModulesPage';
import EnseignantsPage from './pages/EnseignantsPage';
import EtudiantsPage from './pages/EtudiantsPage';
import SeancesPage from './pages/SeancesPage';
import JustificationsPage from './pages/JustificationsPage';
import LoginPage from './pages/LoginPage';
import ActivateStudentPage from './pages/ActivateStudentPage';
import Test from './pages/Test';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivateStudentPage />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="absences" element={<AbsencesPage />} />
          <Route path="seances" element={<SeancesPage />} />
          <Route path="etudiants" element={<EtudiantsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="enseignants" element={<EnseignantsPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="justifications" element={<JustificationsPage />} />
          <Route path="test" element={<Test />} />
        </Route>

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

