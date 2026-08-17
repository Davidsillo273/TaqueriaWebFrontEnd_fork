// hooks/useProfile.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './auth/useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Cada rol se actualiza contra su propio endpoint
const ENDPOINT_BY_ROLE = {
  admin: 'users/admins',
  employee: 'users/employees',
  customer: 'users/customers',
};

// Maneja los datos de la cuenta del usuario que tiene la sesión abierta:
// su perfil (nombre, apellido, foto) y el cambio de contraseña.
export function useProfile() {
  const { user, checkAuth } = useAuth();
  // Estados separados: actualizar el perfil y cambiar la contraseña son
  // acciones independientes, así que un botón no debe mostrarse "guardando"
  // por lo que está haciendo el otro.
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState(null);

  // Actualiza nombre, apellido y opcionalmente la foto de perfil.
  // Si hay imagen se manda como formulario (multipart) porque el backend la
  // sube a Cloudinary con multer; si no, basta con JSON.
  const updateProfile = useCallback(
    async ({ name, lastname, image }) => {
      if (!user?.id || !user?.role) {
        return { success: false, message: 'No hay una sesión activa' };
      }

      const resource = ENDPOINT_BY_ROLE[user.role];
      if (!resource) {
        return { success: false, message: 'Rol de usuario no soportado' };
      }

      setSavingProfile(true);
      setError(null);

      try {
        let payload;
        let headers;

        if (image) {
          payload = new FormData();
          payload.append('name', name);
          payload.append('lastname', lastname);
          payload.append('image', image);
          headers = { 'Content-Type': 'multipart/form-data' };
        } else {
          payload = { name, lastname };
          headers = { 'Content-Type': 'application/json' };
        }

        await axios.patch(`${BASE_URL}/${resource}/${user.id}`, payload, {
          withCredentials: true,
          headers,
        });

        // Recargamos la sesión para que el nombre y la foto del TopBar se actualicen
        await checkAuth();

        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || 'No se pudo actualizar el perfil';
        setError(message);
        return { success: false, message };
      } finally {
        setSavingProfile(false);
      }
    },
    [user, checkAuth]
  );

  // Cambia la contraseña pidiendo la actual como prueba de identidad
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    setSavingPassword(true);
    setError(null);

    try {
      await axios.patch(
        `${BASE_URL}/auth/update-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo cambiar la contraseña';
      setError(message);
      return { success: false, message };
    } finally {
      setSavingPassword(false);
    }
  }, []);

  return { savingProfile, savingPassword, error, updateProfile, changePassword };
}

export default useProfile;
