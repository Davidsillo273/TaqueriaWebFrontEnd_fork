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

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleForgotChange = (event) => {
    const { name, value } = event.target;
    setForgotForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // --- LOGIN ---
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError('Debes completar correo y contraseña');
      return;
    }

    setIsLoading(true);
    setError('');

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
        setError(data.message || 'Credenciales incorrectas');
        return;
      }

      // Sincronizamos el AuthContext ANTES de navegar, para que cuando
      // ProtectedRoute evalúe isAuthenticated ya tenga el usuario cargado
      // y no te rebote de vuelta al login.
      const currentUser = await checkAuth();

      if (!currentUser) {
        // La cookie se guardó pero /auth/me no pudo confirmar la sesión;
        // esto normalmente indica un problema de configuración en el backend
        // (ver checklist más abajo) en vez de un problema del formulario.
        setError('Sesión iniciada pero no se pudo verificar. Intenta de nuevo.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RECUPERACIÓN PASO 1: Enviar código ---
  const handleForgotStep1 = async (event) => {
    event.preventDefault();

    if (!forgotForm.email.trim()) {
      setError('Ingresa tu correo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/recoveryPassword/requestCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: forgotForm.email,
          userType: form.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Correo no encontrado');
        return;
      }

      setForgotStep(2);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RECUPERACIÓN PASO 2: Verificar código y nueva contraseña ---
  const handleForgotStep2 = async (event) => {
    event.preventDefault();

    if (!forgotForm.code.trim()) {
      setError('Ingresa el código de verificación');
      return;
    }
    if (!forgotForm.newPassword.trim() || !forgotForm.confirmPassword.trim()) {
      setError('Completa las nuevas contraseñas');
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verifyResponse = await fetch(`${API_URL}/auth/recoveryPassword/verifyCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          codeRequest: forgotForm.code,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.message || 'Código inválido o expirado');
        return;
      }

      const newPassResponse = await fetch(`${API_URL}/auth/recoveryPassword/newPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newPassword: forgotForm.newPassword,
          confirmNewPassword: forgotForm.confirmPassword,
        }),
      });

      const newPassData = await newPassResponse.json();

      if (!newPassResponse.ok) {
        setError(newPassData.message || 'Error al actualizar la contraseña');
        return;
      }

      setShowForgotPassword(false);
      setForgotStep(1);
      setForgotForm({ email: '', code: '', newPassword: '', confirmPassword: '' });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotForm({ email: '', code: '', newPassword: '', confirmPassword: '' });
    setError('');
  };

  return {
    form,
    setForm,
    forgotForm,
    setForgotForm,
    isLoading,
    error,
    showForgotPassword,
    setShowForgotPassword,
    forgotStep,
    setForgotStep,
    handleChange,
    handleForgotChange,
    handleLogin,
    handleForgotStep1,
    handleForgotStep2,
    goBackToLogin,
    navigate,
  };
}