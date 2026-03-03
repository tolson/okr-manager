import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OKRProvider } from './context/OKRContext';
import { Navbar } from './components/Layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CompanyOKRs } from './pages/CompanyOKRs';
import { TeamOKRs } from './pages/TeamOKRs';
import { IndividualOKRs } from './pages/IndividualOKRs';
import { AlignmentView } from './pages/AlignmentView';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <OKRProvider>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/company" element={<CompanyOKRs />} />
                    <Route path="/team" element={<TeamOKRs />} />
                    <Route path="/individual" element={<IndividualOKRs />} />
                    <Route path="/alignment" element={<AlignmentView />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </OKRProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/okr-manager">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
