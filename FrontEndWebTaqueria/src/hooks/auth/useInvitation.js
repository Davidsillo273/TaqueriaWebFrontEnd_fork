import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useInvitation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendInvitation = useCallback(async (role, formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const endpoint = role === 'admin'
        ? '/auth/admins/invite/sendInvitation'
        : '/auth/employees/invite/sendInvitation';

      const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
        withCredentials: true, // Para enviar la authCookie httpOnly del admin
      });

      setSuccess(true);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al enviar la invitación';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateInvitation = useCallback(async (token, role) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = role === 'admin'
        ? '/auth/admins/invite/checkInvitation'
        : '/auth/employees/invite/checkInvitation';

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: { token },
      });

      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Token inválido';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvitation = useCallback(async (token, password, imageFile, role) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const endpoint = role === 'admin'
        ? '/auth/admins/invite/acceptInvitation'
        : '/auth/employees/invite/acceptInvitation';

      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', password);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al completar el registro';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    sendInvitation,
    validateInvitation,
    acceptInvitation,
    reset,
  };
};