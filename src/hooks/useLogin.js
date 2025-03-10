 import { useState } from 'react';
import { useAuthContext } from '../context/auth';
import axios from '../api/axios';
import jwt_decode from 'jwt-decode';

export const useLogin = () => {
  const { dispatch } = useAuthContext();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const login = async (email, password, persist) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/login', { email, password, persist });
      const decoded = jwt_decode(response.data);
      dispatch({ type: 'LOGIN', payload: { ...decoded.userInfo, accessToken: response.data } });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.error || 'Something went wrong');
    }
  };

  return { login, isLoading, error };
};
