// src/hooks/useLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://syscor.onrender.com/api';

// Mapeo de roles a endpoints de login
const LOGIN_ENDPOINTS = {
  admin: '/auth/admins/login',
  employee: '/auth/employees/login',
  customer: '/auth/customers/login',
};

export default function useLogin() {
  const navigate = useNavigate();

  // Estados del formulario de login
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'admin', // por defecto admin
  });

  // Estados para recuperación de contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: solicitar código, 2: verificar y nueva contraseña
  const [forgotForm, setForgotForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manejar cambios en el formulario de login
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error al escribir
    if (error) setError('');
  };

  // Manejar cambios en el formulario de recuperación
  const handleForgotChange = (event) => {
    const { name, value } = event.target;
    setForgotForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  // --- LOGIN ---
  const handleLogin = async (event) => {
    event.preventDefault();

    // Validaciones básicas
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
        credentials: 'include', // importante para cookies
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

      // Guardar usuario en localStorage (solo email y rol)
      const userData = { email: form.email, role: form.role };
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirigir al dashboard
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
          userType: form.role, // usamos el rol seleccionado
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Correo no encontrado');
        return;
      }

      // Paso al siguiente paso
      setForgotStep(2);
      setError(''); // Limpiar error
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

    // Validaciones
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
      // 1. Verificar el código
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

      // 2. Establecer nueva contraseña
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

      // Éxito: volver al login
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

  // Volver al login desde recuperación
  const goBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotForm({ email: '', code: '', newPassword: '', confirmPassword: '' });
    setError('');
  };

  return {
    // Estados
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
    // Manejadores
    handleChange,
    handleForgotChange,
    handleLogin,
    handleForgotStep1,
    handleForgotStep2,
    goBackToLogin,
    navigate,
  };
}