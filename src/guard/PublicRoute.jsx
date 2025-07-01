import { Navigate } from 'react-router-dom';
import { useAuth } from '../guard/AuthProvider';

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  return user ? <Navigate to="/" replace /> : children;
}
