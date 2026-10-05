// Cliente HTTP de la pantalla de cocina.
//
// Toda petición lleva el token de dispositivo en "Authorization: Bearer" (no
// hay cookie de sesión: la pantalla no tiene usuario). Si el servidor
// responde 401 o 403, el token ya no sirve o pidió algo que no le toca: se
// borra y la pantalla vuelve sola al lobby (ver kitchenDeviceContext).
import axios from 'axios';
import { readDeviceToken, clearDeviceToken } from '../utils/deviceStorage';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const kitchenApi = axios.create({
  baseURL: BASE_URL,
  // Sin cookies: si en este navegador hay una sesión de admin abierta, no
  // debe viajar con las peticiones de la pantalla de cocina.
  withCredentials: false,
});

kitchenApi.interceptors.request.use((config) => {
  const token = readDeviceToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unauthorizedListeners = new Set();

// El provider de la pantalla se suscribe aquí para volver al lobby
export const onDeviceUnauthorized = (listener) => {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
};

kitchenApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      clearDeviceToken();
      unauthorizedListeners.forEach((listener) => listener(error.response?.data));
    }
    return Promise.reject(error);
  }
);

export default kitchenApi;
