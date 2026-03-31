import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TodayDiaryRedirect() {
  const { isBound } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  if (!isBound) {
    return <Navigate to="/bind" replace />;
  }
  
  return <Navigate to={`/diary/${today}`} replace />;
}

export default TodayDiaryRedirect;
