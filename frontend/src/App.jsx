import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import DiaryPage from './pages/DiaryPage';
import SettingsPage from './pages/SettingsPage';
import BindCouplePage from './pages/BindCouplePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="text-4xl mb-4">💕</div>
          <div className="text-xl text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { user, isBound, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="text-6xl mb-4 heart-pulse">💕</div>
          <div className="text-xl text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={isBound ? "/" : "/bind"} replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        user ? <Navigate to={isBound ? "/" : "/bind"} replace /> : <RegisterPage />
      } />
      <Route path="/bind" element={
        <ProtectedRoute>
          {!isBound ? <BindCouplePage /> : <Navigate to="/" replace />}
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          {isBound ? <CalendarPage /> : <Navigate to="/bind" replace />}
        </ProtectedRoute>
      } />
      <Route path="/diary/:date" element={
        <ProtectedRoute>
          {isBound ? <DiaryPage /> : <Navigate to="/bind" replace />}
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
