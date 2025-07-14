import { useNavigate } from 'react-router-dom';
import { useAuth } from '../guard/AuthProvider';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function CommonMethods() {

  let router = useNavigate();
  const { logout: contextLogout } = useAuth();

  // Check if its valid call
  const checkValidCall = (isValid) => {
    if (typeof isValid !== 'boolean') return;
    if(!isValid){
      toast.error("Your session is expired!");
      logout();
      return false;
    }
    return true;
  }
  
  // Logout function
  const logout = () =>{
    contextLogout();
    router('/login');
  }

  // Add JWT Token if exist
  const addJwtToken = () =>{
    const token = localStorage.getItem('token');
    if(token){
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  const getMethod = async (apiUrl) => {
    try {
      addJwtToken();
      const response = await axios.get(apiUrl);
      if(response.status !== 200 || response.status !== 500){
        checkValidCall(response.data.success);
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  const postMethod = async (apiUrl, data) => {
    try {
      addJwtToken();
      const response = await axios.post(apiUrl, data);
      if(response.status !== 200 || response.status !== 500){
        checkValidCall(response.data.success);
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  const putMethod = async (apiUrl, data) => {
    try {
      addJwtToken();
      const response = await axios.put(apiUrl, data);
      if(response.status !== 200 || response.status !== 500){
        checkValidCall(response.data.success);
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  const deleteMethod = async (apiUrl) => {
    try {
      addJwtToken();
      const response = await axios.delete(apiUrl);
      if(response.status !== 200 || response.status !== 500){
        checkValidCall(response.data.success);
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  

  return{
    logout,
    getMethod,
    postMethod,
    putMethod,
    deleteMethod
  }
}
