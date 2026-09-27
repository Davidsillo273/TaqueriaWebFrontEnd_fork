// src/utils/employeeFields.js
//
// Reglas de los datos de un empleado (Invitar staff y la ficha del
// empleado). Son un espejo de utils/users/employeeFieldValidations.js en el
// backend: si cambian allá, hay que cambiarlas aquí.
//
// Cada campo tiene dos piezas:
// - format*/sanitize*: se aplica mientras se escribe, para que el campo
//   nunca contenga caracteres que no van (letras en el DUI, números en el
//   nombre...) y ponga los guiones solo.
// - validate*: se usa al avanzar o guardar; devuelve el mensaje de error o
//   null si está bien.

const onlyDigits = (value = '') => String(value).replace(/\D/g, '');

// --- Nombres y apellidos ---------------------------------------------------
// Letras (con tildes, ñ y ü), espacios, apóstrofo y guion. Nada de números.
const NAME_ALLOWED = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g;

export const sanitizeName = (value = '') => value.replace(NAME_ALLOWED, '').replace(/\s{2,}/g, ' ');

export const validateName = (value = '', label = 'El nombre') => {
  const v = value.trim();
  if (!v) return `${label} es requerido`;
  if (/\d/.test(v)) return `${label} no puede llevar números`;
  if (v.length < 2) return `${label} debe tener al menos 2 letras`;
  if (v.length > 50) return `${label} no puede superar los 50 caracteres`;
  return null;
};

// --- DUI: 9 dígitos, el sistema pone el guion (########-#) -----------------
export const formatDui = (value = '') => {
  const d = onlyDigits(value).slice(0, 9);
  return d.length > 8 ? `${d.slice(0, 8)}-${d.slice(8)}` : d;
};

export const validateDui = (value = '') => {
  const d = onlyDigits(value);
  if (!d) return 'El DUI es requerido';
  if (d.length !== 9) return 'El DUI debe tener exactamente 9 dígitos';
  return null;
};

// --- Teléfono: 8 dígitos de El Salvador, guion automático (####-####) ------
// El código de país (+503) va fijo delante del campo, así que no se escribe.
// Los números locales empiezan en 2 (fijo) o en 6/7 (celular).
export const PHONE_PREFIX = '+503';

export const formatPhone = (value = '') => {
  let d = onlyDigits(value);
  // Si se pega un número con el código de país, se descarta el 503.
  if (d.length > 8 && d.startsWith('503')) d = d.slice(3);
  d = d.slice(0, 8);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
};

export const validatePhone = (value = '') => {
  const d = onlyDigits(value);
  if (!d) return 'El teléfono es requerido';
  if (d.length !== 8) return 'El teléfono debe tener los 8 dígitos';
  if (!/^[267]/.test(d)) return 'El teléfono debe empezar con 2 (fijo), 6 o 7 (celular)';
  return null;
};

// --- ISSS: exactamente 9 dígitos -------------------------------------------
export const formatIsss = (value = '') => onlyDigits(value).slice(0, 9);

export const validateIsss = (value = '', { required = false } = {}) => {
  const d = onlyDigits(value);
  if (!d) return required ? 'El número de ISSS es requerido' : null;
  if (d.length !== 9) return 'El número de ISSS debe tener exactamente 9 dígitos';
  return null;
};

// --- AFP: solo existen Crecer y Confía. El número de afiliación ya no se
// pide: va vinculado al DUI.
export const AFP_INSTITUTIONS = [
  { value: 'crecer', label: 'AFP Crecer' },
  { value: 'confia', label: 'AFP Confía' },
];

// --- Bancos y cuenta -------------------------------------------------------
// El banco se elige de la lista (se guarda su nombre, igual que antes, para
// que los registros viejos escritos a mano sigan leyéndose). La cuenta es
// solo de dígitos, sin guiones ni espacios, y su largo permitido depende del
// banco. Mientras no se confirme el largo exacto de cada banco, todos usan
// el rango general de 8 a 20 dígitos: para ajustar uno, basta con cambiar
// su min/max aquí y en el backend.
const ACCOUNT_DEFAULT = { min: 8, max: 20 };

export const BANKS = [
  { value: 'Banco Agrícola', ...ACCOUNT_DEFAULT },
  { value: 'Banco Cuscatlán', ...ACCOUNT_DEFAULT },
  { value: 'Banco Davivienda', ...ACCOUNT_DEFAULT },
  { value: 'BAC Credomatic', ...ACCOUNT_DEFAULT },
  { value: 'Banco Promerica', ...ACCOUNT_DEFAULT },
  { value: 'Banco Hipotecario', ...ACCOUNT_DEFAULT },
  { value: 'Banco Atlántida', ...ACCOUNT_DEFAULT },
  { value: 'Banco Azul', ...ACCOUNT_DEFAULT },
  { value: 'Banco Industrial', ...ACCOUNT_DEFAULT },
  { value: 'Banco de Fomento Agropecuario', ...ACCOUNT_DEFAULT },
  { value: 'Banco Abank', ...ACCOUNT_DEFAULT },
  { value: 'Fedecrédito', ...ACCOUNT_DEFAULT },
];

export const findBank = (name) => BANKS.find((b) => b.value === name) || null;

export const formatBankAccount = (value = '', bankName) => {
  const bank = findBank(bankName);
  return onlyDigits(value).slice(0, bank ? bank.max : ACCOUNT_DEFAULT.max);
};

export const bankAccountHint = (bankName) => {
  const bank = findBank(bankName);
  if (!bank) return 'Elige primero el banco.';
  return bank.min === bank.max
    ? `Solo dígitos, sin guiones ni espacios: ${bank.min} dígitos.`
    : `Solo dígitos, sin guiones ni espacios: de ${bank.min} a ${bank.max} dígitos.`;
};

// Banco y cuenta van juntos: o los dos o ninguno.
export const validateBankAccount = (bankName = '', account = '') => {
  const d = onlyDigits(account);
  if (!bankName && !d) return null;
  if (!bankName) return 'Elige el banco de la cuenta';
  const bank = findBank(bankName);
  if (!bank) return 'Elige un banco de la lista';
  if (!d) return 'Escribe el número de cuenta';
  if (d.length < bank.min || d.length > bank.max) {
    return bank.min === bank.max
      ? `La cuenta de ${bank.value} debe tener ${bank.min} dígitos`
      : `La cuenta de ${bank.value} debe tener entre ${bank.min} y ${bank.max} dígitos`;
  }
  return null;
};

// --- Horario legal (Código de Trabajo de El Salvador) ----------------------
// - Art. 161: jornada diurna (06:00 a 19:00) de máximo 8 horas diarias y 44
//   semanales; nocturna (19:00 a 06:00) de máximo 7 horas diarias y 39
//   semanales. Una jornada con más de 4 horas nocturnas cuenta como
//   nocturna.
// - Art. 171: al menos un día de descanso por semana, así que se trabaja
//   como máximo 6 días.
// El turno se toma de corrido de la entrada a la salida (el horario no
// registra pausas), y puede cruzar la medianoche (ej. 22:00 a 05:00).
export const LEGAL_LIMITS = {
  day: { daily: 8, weekly: 44 },
  night: { daily: 7, weekly: 39 },
  maxWorkDays: 6,
};

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

// Minutos del turno y cuántos caen entre las 19:00 y las 06:00.
export const shiftMinutes = (start, end) => {
  const s = toMinutes(start);
  let e = toMinutes(end);
  if (e <= s) e += 24 * 60; // cruza la medianoche
  let night = 0;
  for (let t = s; t < e; t += 1) {
    const minuteOfDay = t % (24 * 60);
    if (minuteOfDay >= 19 * 60 || minuteOfDay < 6 * 60) night += 1;
  }
  return { total: e - s, night };
};

const formatHours = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

// Devuelve { error, summary }: error es el primer incumplimiento (o null) y
// summary describe el horario para mostrarlo en pantalla.
export const checkLegalSchedule = ({
  workDays = [],
  scheduleStart,
  scheduleEnd,
  weekendScheduleEnabled = false,
  weekendScheduleStart,
  weekendScheduleEnd,
}) => {
  if (!scheduleStart && !scheduleEnd) return { error: null, summary: null };
  if (!scheduleStart || !scheduleEnd) {
    return { error: 'Indica la hora de entrada y la de salida', summary: null };
  }
  if (scheduleStart === scheduleEnd) {
    return { error: 'La hora de entrada y la de salida no pueden ser iguales', summary: null };
  }
  if (workDays.length > LEGAL_LIMITS.maxWorkDays) {
    return { error: 'Por ley, el empleado debe tener al menos un día de descanso a la semana (máximo 6 días de trabajo)', summary: null };
  }

  const weekday = shiftMinutes(scheduleStart, scheduleEnd);
  const useWeekend = weekendScheduleEnabled && weekendScheduleStart && weekendScheduleEnd;
  const weekend = useWeekend ? shiftMinutes(weekendScheduleStart, weekendScheduleEnd) : weekday;

  const shifts = [
    { label: 'El turno', ...weekday },
    ...(useWeekend ? [{ label: 'El turno de fin de semana', ...weekend }] : []),
  ];

  let nightShift = false;
  for (const shift of shifts) {
    const isNight = shift.night > 4 * 60;
    nightShift = nightShift || isNight;
    const limit = isNight ? LEGAL_LIMITS.night : LEGAL_LIMITS.day;
    if (shift.total > limit.daily * 60) {
      return {
        error: `${shift.label} dura ${formatHours(shift.total)}: la jornada ${isNight ? 'nocturna' : 'diurna'} es de máximo ${limit.daily} horas diarias`,
        summary: null,
      };
    }
  }

  const weekendDays = ['sabado', 'domingo'];
  const weeklyMinutes = workDays.reduce(
    (sum, day) => sum + (useWeekend && weekendDays.includes(day) ? weekend.total : weekday.total),
    0
  );
  const weeklyLimit = nightShift ? LEGAL_LIMITS.night.weekly : LEGAL_LIMITS.day.weekly;
  if (weeklyMinutes > weeklyLimit * 60) {
    return {
      error: `Suma ${formatHours(weeklyMinutes)} a la semana: la jornada ${nightShift ? 'nocturna' : 'diurna'} es de máximo ${weeklyLimit} horas semanales. Reduce el horario o los días de trabajo`,
      summary: null,
    };
  }

  return {
    error: null,
    summary: `Jornada ${nightShift ? 'nocturna' : 'diurna'}: ${formatHours(weekday.total)} por día · ${formatHours(weeklyMinutes)} a la semana (máximo ${weeklyLimit} h)`,
  };
};
