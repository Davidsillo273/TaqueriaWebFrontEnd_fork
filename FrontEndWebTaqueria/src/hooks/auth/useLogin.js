import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const API_URL = 'http://localhost:4000/api';

const LOGIN_ENDPOINTS = {
  admin: '/auth/admins/login',
  employee: '/auth/employees/login',
  customer: '/auth/customers/login',
};

export default function useLogin() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'admin',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError({
        title: 'Campos incompletos',
        message: 'Debes completar correo y contraseña.'
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = LOGIN_ENDPOINTS[form.role];
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          title: data.title || 'Error al iniciar sesión',
          message: data.message || 'Credenciales incorrectas'
        });
        return;
      }

      const currentUser = await checkAuth();

      if (!currentUser) {
        setError({
          title: 'Error de verificación',
          message: 'Sesión iniciada pero no se pudo verificar. Intenta de nuevo.'
        });
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError({
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    setForm,
    isLoading,
    error,
    handleChange,
    handleLogin,
    navigate,
  };
}