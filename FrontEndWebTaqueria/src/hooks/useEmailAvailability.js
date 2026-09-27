// src/hooks/useEmailAvailability.js
//
// Comprueba, mientras se escribe, si ya existe una cuenta con un correo del
// tipo de usuario que se está invitando (endpoint
// /auth/invitations/check-email, solo admins): al invitar un empleado solo se
// busca entre empleados, y al invitar un admin, solo entre administradores.
// Espera a que el usuario deje de teclear y descarta respuestas viejas, para
// que un correo escrito rápido no muestre el resultado de uno anterior.
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEBOUNCE_MS = 500;

// status: 'idle' (vacío, incompleto o sin rol) | 'checking' | 'done' | 'error'
// exists / name: solo tienen sentido con status 'done'.
export default function useEmailAvailability(email, role) {
  const [result, setResult] = useState({ key: '', status: 'idle', exists: false, name: null });
  const normalized = (email || '').trim().toLowerCase();
  const valid = !!role && EMAIL_REGEX.test(normalized);
  const key = `${role}|${normalized}`;

  useEffect(() => {
    if (!valid) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setResult({ key, status: 'checking', exists: false, name: null });
      try {
        const params = new URLSearchParams({ email: normalized, role });
        const res = await fetch(`${API_URL}/auth/invitations/check-email?${params}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setResult({ key, status: 'done', exists: !!data.exists, name: data.name || null });
      } catch {
        if (!cancelled) setResult({ key, status: 'error', exists: false, name: null });
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, normalized, role, valid]);

  // Mientras el resultado guardado sea de otro correo o rol (o el actual no
  // sea válido), no hay nada que mostrar todavía.
  if (!valid) return { status: 'idle', exists: false, name: null };
  if (result.key !== key) return { status: 'checking', exists: false, name: null };
  return result;
}
