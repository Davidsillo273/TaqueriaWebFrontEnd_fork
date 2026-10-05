// src/components/commons/PasswordFields.jsx
//
// Piezas para cualquier formulario que pida una contraseña nueva:
// - PasswordInput: campo con el ojo para mostrar u ocultar lo que se escribe.
// - PasswordChecklist: qué debe llevar la contraseña, marcando cada regla en
//   cuanto se cumple, y un medidor de qué tan segura es.
// - PasswordMatch: compara la confirmación con la contraseña nueva mientras
//   se escribe.
import { useState } from 'react';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import { PASSWORD_RULES, getPasswordStrength } from '../../utils/passwordRules';

const TONE_TEXT = { ac: 'text-ac', warn: 'text-warn', ok: 'text-ok', muted: 'text-muted' };
const TONE_BG = { ac: 'bg-ac', warn: 'bg-warn', ok: 'bg-ok', muted: 'bg-line' };

export const PasswordInput = ({ id, value, onChange, className = '', autoComplete, ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`${className} pr-11`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer"
      >
        <FAIcon icon={visible ? 'eye-slash' : 'eye'} size="sm" />
      </button>
    </div>
  );
};

export const PasswordChecklist = ({ password = '' }) => {
  const strength = getPasswordStrength(password);

  return (
    <div className="space-y-3">
      {/* Medidor: cinco tramos, se llenan según el nivel alcanzado */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-muted tracking-wide uppercase">Seguridad</span>
          <span className={`text-xs font-medium ${TONE_TEXT[strength.tone]}`}>
            {password ? strength.label : 'Sin escribir'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-colors ${
                password && i <= strength.level ? TONE_BG[strength.tone] : 'bg-line'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Reglas: cada una se marca en cuanto se cumple */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5" aria-label="Requisitos de la contraseña">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-ok' : 'text-muted'}`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                  ok ? 'bg-ok border-ok text-white' : 'border-linealt text-transparent'
                }`}
              >
                <FAIcon icon="check" size="xs" />
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const PasswordMatch = ({ password = '', confirm = '' }) => {
  if (!confirm) return null;
  const matches = password === confirm;

  return (
    <p className={`mt-1.5 text-xs flex items-center gap-1.5 ${matches ? 'text-ok' : 'text-ac'}`} aria-live="polite">
      <FAIcon icon={matches ? 'circle-check' : 'times-circle'} size="xs" />
      {matches ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
    </p>
  );
};
