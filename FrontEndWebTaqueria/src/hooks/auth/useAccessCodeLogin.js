import { useState } from 'react';

const API_URL = 'http://localhost:4000/api';

// Login alterno para empleados con permisos: primero validan su código de
// acceso (mandado por correo cuando se les otorgó el primer permiso), y
// luego escriben su contraseña para entrar, sin necesidad de tipear su correo.
export default function useAccessCodeLogin() {
  const [verifying, setVerifying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const verifyCode = async (code) => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/auth/employees/login/verify-access-code`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, message: data.message || 'Código inválido' };
      return { success: true, name: data.name };
    } catch {
      return { success: false, message: 'Error de conexión al verificar el código' };
    } finally {
      setVerifying(false);
    }
  };

  const loginWithCode = async (code, password) => {
    setLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/auth/employees/login/login-with-code`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, message: data.message || 'No se pudo iniciar sesión' };
      return { success: true };
    } catch {
      return { success: false, message: 'Error de conexión al iniciar sesión' };
    } finally {
      setLoggingIn(false);
    }
  };

  return { verifying, loggingIn, verifyCode, loginWithCode };
}
