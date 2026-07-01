// src/hooks/useClientForm.js
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://syscor.onrender.com/api';

export function useClientForm(onClose, editingClient, onSuccess) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      personalInfo: {
        name: '', lastname: '', birthdate: '', card: '',
        phones: { main: '' },
        addresses: [{ details: '' }]
      },
      loginInfo: { email: '', password: 'PasswordDefault123*' } // Contraseña genérica por si la pide el backend
    }
  });

  // Si se va a editar un cliente, rellenamos el formulario con sus datos existentes
  useEffect(() => {
    if (editingClient) {
      reset({
        personalInfo: {
          name: editingClient.personalInfo?.name || '',
          lastname: editingClient.personalInfo?.lastname || '',
          birthdate: editingClient.personalInfo?.birthdate ? editingClient.personalInfo.birthdate.substring(0, 10) : '',
          card: editingClient.personalInfo?.card || '',
          phones: {
            main: editingClient.personalInfo?.phones?.main || ''
          },
          addresses: [
            { details: editingClient.personalInfo?.addresses?.[0]?.details || '' }
          ]
        },
        loginInfo: {
          email: editingClient.loginInfo?.email || '',
          password: 'PasswordDefault123*'
        }
      });
    } else {
      reset({
        personalInfo: { name: '', lastname: '', birthdate: '', card: '', phones: { main: '' }, addresses: [{ details: '' }] },
        loginInfo: { email: '', password: 'PasswordDefault123*' }
      });
    }
  }, [editingClient, reset]);

  // --- GUARDAR (POST O PUT) ---
  const onSubmitClient = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    const isEdit = !!editingClient;
    const url = isEdit 
      ? `${API_URL}/customers/${editingClient._id || editingClient.id}`
      : `${API_URL}/customers`;
    
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Error al procesar la solicitud');
      }

      await onSuccess(); // Refresca la tabla
      onClose(); // Cierra el modal
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Error al guardar en el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmitClient,
    isSubmitting,
    submitError
  };
}