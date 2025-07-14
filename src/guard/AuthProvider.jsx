// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import CommonMethods from '../common/CommonMethods';

const AuthContext = createContext();
const {getMethod} = CommonMethods();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Read from localStorage on load
    const storedUser = localStorage.getItem('token');
    return storedUser ? storedUser : null;
  });

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('token', user);
    } else {
      localStorage.removeItem('token');
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token'); 
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    getMethod(`${process.env.REACT_APP_API_URL}/users/logout`);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
