import { useForm } from 'react-hook-form';

// Este gancho (hook) maneja toda la data del formulario de clientes
export const useClientForm = (onClose) => {
  
  // Sacamos los métodos de react-hook-form para validar sin dar tanta vuelta
  const {
    register,          // Para amarrar los inputs del HTML
    handleSubmit,      // El que revisa que todo esté lleno antes de activar el submit
    formState: { errors }, // El saquito donde caen los errores si meten la pata
    reset              // Para vaciar las cajas después de guardar
  } = useForm({
    // Estructura idéntica al objeto de Miro y la base de datos
    defaultValues: {
      personalInfo: {
        name: '',
        lastname: '',
        image: '',
        birthdate: '',
        addresses: [
          { tag: 'Casa', details: '', isDefault: true } // Dirección base
        ],
        phones: { main: '' },
        card: ''
      },
      loginInfo: {
        email: '',
        password: 'PasswordDefecto123!', // Contraseña temporal por obligación del modelo
        isVerified: true,
        loginAttempts: 0,
        timeOut: null
      },
      favorites: []
    }
  });

  // Esto corre solo si la validación pasa limpia
  const onSubmitClient = (data) => {
    try {
      // Mandamos la info estructurada a la consola para probar antes de meter Axios
      console.log('Objeto estructurado para Mongo:', data);
      
      // Alerta para avisar que sí funcionó 
      alert(`Cliente ${data.personalInfo.name} registrado con éxito`);
      
      reset();   // Limpiamos todo
      onClose(); // Cerramos la ventana flotante
    } catch (error) {
      console.error('Tronó al guardar:', error);
      alert('Error raro al guardar el cliente');
    }
  };

  // Soltamos las funciones para que el modal las agarre
  return {
    register,
    handleSubmit,
    errors,
    onSubmitClient
  };
};