// Reglas de contraseña del sistema. Son un espejo exacto de validatePassword
// en el backend (utils/auth/validationsUsersUtils.js): si aquí se marcan
// todas, el servidor la acepta. Si cambian allá, hay que cambiarlas aquí.
export const PASSWORD_RULES = [
  { id: 'len', label: 'Al menos 8 caracteres', test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'Una letra mayúscula', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'Una letra minúscula', test: (pw) => /[a-z]/.test(pw) },
  { id: 'digit', label: 'Un número', test: (pw) => /[0-9]/.test(pw) },
  {
    id: 'symbol',
    label: 'Un carácter especial (!@#$%…)',
    test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  },
];

export const passwordMeetsRules = (pw = '') => PASSWORD_RULES.every((r) => r.test(pw));

// Qué tan segura es: cada regla cumplida suma un punto, y la longitud suma
// uno más a partir de 12 caracteres y otro a partir de 16. Una contraseña que
// no cumple las reglas nunca pasa de "Débil", aunque sea larga, porque el
// servidor la va a rechazar igual.
const LEVELS = [
  { label: 'Muy débil', tone: 'ac' },
  { label: 'Débil', tone: 'ac' },
  { label: 'Aceptable', tone: 'warn' },
  { label: 'Segura', tone: 'ok' },
  { label: 'Muy segura', tone: 'ok' },
];

export const getPasswordStrength = (pw = '') => {
  if (!pw) return { level: 0, percent: 0, label: '', tone: 'muted' };

  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  const bonus = (pw.length >= 12 ? 1 : 0) + (pw.length >= 16 ? 1 : 0);

  let level;
  if (passed < PASSWORD_RULES.length) {
    level = passed <= 2 ? 0 : 1;
  } else {
    level = 2 + bonus; // 2 = cumple lo mínimo, 3 = 12+, 4 = 16+
  }

  return { level, percent: ((level + 1) / LEVELS.length) * 100, ...LEVELS[level] };
};
