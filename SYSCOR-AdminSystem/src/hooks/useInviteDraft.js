// src/hooks/useInviteDraft.js
//
// Borrador de la invitación en curso. Si el admin sale de "Invitar staff" a
// mitad del alta, lo que ya llenó (rol, paso, datos y fotos del DUI) queda
// pendiente durante 30 minutos desde el último cambio: si vuelve antes, la
// invitación se retoma donde la dejó; si no, se descarta.
//
// Vive en localStorage (solo en este navegador), así que no sobrevive a
// otro equipo ni a un borrado de datos del navegador. Todas las lecturas y
// escrituras van en try/catch porque el almacenamiento puede estar
// bloqueado (modo privado, permisos) y eso no debe romper la pantalla.
const STORAGE_KEY = 'syscor.inviteDraft';

export const INVITE_DRAFT_TTL_MS = 30 * 60 * 1000;

export const loadInviteDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft?.savedAt || Date.now() - draft.savedAt > INVITE_DRAFT_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
};

export const saveInviteDraft = (data) => {
  try {
    const draft = { ...data, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return draft;
  } catch {
    return null;
  }
};

export const clearInviteDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sin almacenamiento no hay nada que borrar
  }
};

// Hora local (HH:MM) a la que se guardó un borrador.
export const draftSavedTime = (savedAt) =>
  new Date(savedAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
