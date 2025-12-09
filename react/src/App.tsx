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

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivateStudentPage />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute >
            <DashboardLayout />
          </ProtectedRoute>
        }> 
          
          {/* Accessible to both students and admins */}
          <Route path="absences" element={<AbsencesPage />} />
          <Route path="justifications" element={<JustificationsPage />} />

          {/* Admin-only routes */}
            <Route path='/' element={
            <ProtectedRoute requireAdmin>
              <Dashboard />
            </ProtectedRoute>
          } />
            <Route path='dashboard' element={
            <ProtectedRoute requireAdmin>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="seances" element={
            <ProtectedRoute requireAdmin>
              <SeancesPage />
            </ProtectedRoute>
          } />
          <Route path="etudiants" element={
            <ProtectedRoute requireAdmin>
              <EtudiantsPage />
            </ProtectedRoute>
          } />
          <Route path="classes" element={
            <ProtectedRoute requireAdmin>
              <ClassesPage />
            </ProtectedRoute>
          } />
          <Route path="enseignants" element={
            <ProtectedRoute requireAdmin>
              <EnseignantsPage />
            </ProtectedRoute>
          } />
          <Route path="modules" element={
            <ProtectedRoute requireAdmin>
              <ModulesPage />
            </ProtectedRoute>
          } /> 
        </Route>

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

