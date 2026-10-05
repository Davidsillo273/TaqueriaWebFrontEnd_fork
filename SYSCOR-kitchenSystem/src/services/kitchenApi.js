// Cliente HTTP de la pantalla de cocina.
//
// Toda petición lleva el token de dispositivo en "Authorization: Bearer" (no
// hay cookie de sesión: la pantalla no tiene usuario). Si el servidor
// responde 401 o 403, el token ya no sirve o pidió algo que no le toca: se
// borra y la pantalla vuelve sola al lobby (ver kitchenDeviceContext).
import axios from 'axios';
import { readDeviceToken, clearDeviceToken } from '../utils/deviceStorage';

// La URL de la API siempre termina en /api. Si VITE_API_URL se configuró
// solo con el dominio del backend ("https://x.onrender.com"), se agrega: sin
// eso las peticiones irían a /kitchen/... en vez de /api/kitchen/..., el
// backend las rechaza con 403 y la pantalla vuelve al lobby en cada intento.
// (El socket no tenía el problema porque usa la raíz del backend.)
const normalizeApiUrl = (raw) => {
  const url = String(raw || '').trim().replace(/\/+$/, '');
  if (!url) return '/api';
  return /\/api$/i.test(url) ? url : `${url}/api`;
};

const BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

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
