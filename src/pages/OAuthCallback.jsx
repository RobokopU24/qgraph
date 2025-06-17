import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
// import { Loader2 } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';

import routes from '../API/authRoutes';

function OAuthCallback() {
  const history = useHistory();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          // TODO: Handle the case where no token is provided
          history.push('/');
          return;
        }

        const response = await axios.post(
          routes.authRoutes.validateToken,
          { token },
          { headers: { 'Content-Type': 'application/json' } },
        );

        if (response.status === 200 && response.data.message === 'Token is valid') {
          login(response.data.user, token);
          history.push('/dashboard');
        } else {
          // TODO: Handle invalid token case
          history.push('/');
        }
      } catch (error) {
        // TODO: Handle errors, such as network issues or server errors
        history.push('/');
      }
    };

    validateToken();
  }, [history, location, login]);

  return (
    <div>
      <h2>Validating your login</h2>
    </div>
  );
}

export default OAuthCallback;
