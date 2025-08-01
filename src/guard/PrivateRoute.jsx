import { Navigate } from 'react-router-dom';
import { useAuth } from '../guard/AuthProvider';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" replace />;
}