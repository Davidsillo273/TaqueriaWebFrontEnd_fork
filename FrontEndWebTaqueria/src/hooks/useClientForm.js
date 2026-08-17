import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api';

export function useClientForm(onClose, editingClient, onSuccess) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      lastname: ''
    }
  });

  useEffect(() => {
    if (editingClient) {
      reset({
        name: editingClient.personalInfo?.name || '',
        lastname: editingClient.personalInfo?.lastname || ''
      });
    } else {
      reset({ name: '', lastname: '' });
    }
  }, [editingClient, reset]);

  const onSubmitClient = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Validar que tengamos un ID válido para actualizar
      if (!editingClient?._id && !editingClient?.id) {
        throw new Error('ID de cliente no válido');
      }

      const clientId = editingClient._id || editingClient.id;
      
      // Tu backend solo tiene método PUT para el ID
      const response = await fetch(`${API_URL}/users/customers/${clientId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Envía { name, lastname } directo en la raíz
      });

      // Intentamos parsear la respuesta como JSON
      let resData;
      try {
        resData = await response.json();
      } catch (parseError) {
        // Si no es JSON válido, creamos un objeto con el texto
        const textResponse = await response.text();
        resData = { message: textResponse || 'Respuesta del servidor' };
      }

      if (!response.ok) {
        throw new Error(resData.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Verificar que la actualización fue exitosa
      if (onSuccess) {
        await onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error en onSubmitClient:', err);
      setSubmitError(err.message || 'Error de conexión con el servidor');
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