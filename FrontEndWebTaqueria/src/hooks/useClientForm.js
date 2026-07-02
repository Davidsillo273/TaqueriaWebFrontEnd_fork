import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://syscor.onrender.com/api';

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
      // Tu backend solo tiene método PUT para el ID
      const response = await fetch(`${API_URL}/customers/${editingClient._id || editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Envía { name, lastname } directo en la raíz
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Error al actualizar el cliente');
      }

      await onSuccess(); 
      onClose(); 
    } catch (err) {
      console.error(err);
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