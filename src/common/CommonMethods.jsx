import { useNavigate } from 'react-router-dom';
import { useAuth } from '../guard/AuthProvider';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useState } from 'react';

export default function CommonMethods() {
  const router = useNavigate();
  const { logout: contextLogout } = useAuth();
  const [hasLoggedOut, setHasLoggedOut] = useState(false); 

  // Logout function
  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/users/logout`);
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      setHasLoggedOut(true);
      contextLogout();
      router('/login');
    }
  };

  // Check if call is valid, otherwise logout
  const checkValidCall = async (isValid, status) => {
    if (!isValid || status === 401) {
      if (!hasLoggedOut) {
        toast.error("Your session has expired!");
      }
      await logout();
      return false;
    }
    return true;
  };

  // Add JWT Token to Axios headers
  const addJwtToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const getMethod = async (apiUrl) => {
    try {
      addJwtToken();
      const response = await axios.get(apiUrl);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        await checkValidCall(false, 401);
      } else {
        console.error(error);
      }
      throw error;
    }
  };

  const postMethod = async (apiUrl, data) => {
    try {
      addJwtToken();
      const response = await axios.post(apiUrl, data);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        await checkValidCall(false, 401);
      } else {
        console.error(error);
      }
      throw error;
    }
  };

  const putMethod = async (apiUrl, data) => {
    try {
      addJwtToken();
      const response = await axios.put(apiUrl, data);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        await checkValidCall(false, 401);
      } else {
        console.error(error);
      }
      throw error;
    }
  };

  const deleteMethod = async (apiUrl) => {
    try {
      addJwtToken();
      const response = await axios.delete(apiUrl);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        await checkValidCall(false, 401);
      } else {
        console.error(error);
      }
      throw error;
    }
  };

  return {
    logout,
    getMethod,
    postMethod,
    putMethod,
    deleteMethod,
  };
}
