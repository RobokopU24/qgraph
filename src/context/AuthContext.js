import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { useHistory } from 'react-router-dom';
import AlertContext from '~/context/alert';
import axios from 'axios';
import routes from '../API/authRoutes';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const history = useHistory();
  const displayAlert = useContext(AlertContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(routes.authRoutes.validateToken, {
          token,
        });
        setUser(response.data.user);
      } catch (error) {
        // TODO: Handle token validation errors
        // console.error('Token validation failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('authToken', token);
    displayAlert('success', 'You have successfully logged in.');
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('authToken');
    await new Promise((resolve) => setTimeout(resolve, 0));
    displayAlert('success', 'You have successfully logged out.');
    history.push('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      setUser,
      login,
      logout,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
