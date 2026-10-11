// Cliente HTTP de la página de la mesa. No hay sesión: la mesa se identifica
// por el token de su QR (ver /table-service en el backend).
import axios from 'axios';

// La URL de la API siempre termina en /api (mismo arreglo que cocina y caja).
const normalizeApiUrl = (raw) => {
  const url = String(raw || '').trim().replace(/\/+$/, '');
  if (!url) return '/api';
  return /\/api$/i.test(url) ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: normalizeApiUrl(import.meta.env.VITE_API_URL),
  withCredentials: false,
  // Render puede tardar en despertar.
  timeout: 30000,
});

// { title, message, status, data } a partir de un error de axios.
export const apiError = (error, fallback = 'No pudimos conectar. Revisa tu internet.') => ({
  status: error?.response?.status || 0,
  title: error?.response?.data?.title || 'Algo salió mal',
  message: error?.response?.data?.message || fallback,
  data: error?.response?.data || null,
});

export const getTable = async (token) => {
  const { data } = await api.get(`/table-service/${encodeURIComponent(token)}`);
  return data;
};

// { type: 'bill', payMethod } o { type: 'waiter', reason }
export const createRequest = async (token, body) => {
  const { data } = await api.post(`/table-service/${encodeURIComponent(token)}/requests`, body);
  return data;
};

export const cancelRequest = async (token, id) => {
  const { data } = await api.delete(`/table-service/${encodeURIComponent(token)}/requests/${id}`);
  return data;
};
