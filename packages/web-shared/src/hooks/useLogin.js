import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LOGIN_ENDPOINTS = {
  admin: '/auth/admins/login',
  employee: '/auth/employees/login',
  customer: '/auth/customers/login',
};

// Lo comparten el panel de administración y la pantalla de cocina; cada uno
// dice a dónde entrar tras iniciar sesión y qué tipo de cuenta viene
// marcada de entrada (cocina entra casi siempre como empleado).
export default function useLogin({ redirectTo = '/dashboard', defaultRole = 'admin' } = {}) {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: defaultRole,
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

      navigate(redirectTo);
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