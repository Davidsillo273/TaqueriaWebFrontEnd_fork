// Los <input type="number"> del navegador aceptan "e", "+" y "-" porque
// sirven para notación científica ("1e5") y signos. En el sistema ningún
// número los necesita (precios, cantidades, capacidades, días: nunca son
// negativos ni exponenciales), y dejarlos pasar produce valores raros o
// vacíos al guardar. En vez de repetir la validación en cada formulario, se
// bloquean aquí para todos los campos numéricos, presentes y futuros.
const BLOCKED_KEYS = new Set(['e', 'E', '+', '-']);

// Solo dígitos con un punto decimal opcional.
const VALID_PASTE = /^\d*\.?\d*$/;

const isNumberInput = (el) => el instanceof HTMLInputElement && el.type === 'number';

// Campos de texto con teclado numérico (teléfono, DUI, ISSS, cuenta): sus
// formateadores ya dejan solo dígitos, pero así la letra ni aparece. El
// guion sí se permite porque el DUI y el teléfono lo llevan.
const isNumericTextInput = (el) =>
  el instanceof HTMLInputElement && el.type !== 'number' && ['numeric', 'decimal'].includes(el.inputMode);

export function installNumberInputGuard() {
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.ctrlKey || event.metaKey) return;
      if (isNumberInput(event.target) && BLOCKED_KEYS.has(event.key)) event.preventDefault();
      else if (isNumericTextInput(event.target) && /^[a-zA-Z+]$/.test(event.key)) event.preventDefault();
    },
    true,
  );

  // Pegar "1e5" o "-3" también se bloquea.
  document.addEventListener(
    'paste',
    (event) => {
      if (!isNumberInput(event.target)) return;
      const text = (event.clipboardData?.getData('text') || '').trim();
      if (!VALID_PASTE.test(text)) event.preventDefault();
    },
    true,
  );

  // Girar la rueda del mouse sobre un campo enfocado cambia el número sin
  // querer (ej. al hacer scroll por el formulario): se quita el foco.
  document.addEventListener(
    'wheel',
    (event) => {
      if (isNumberInput(event.target) && document.activeElement === event.target) event.target.blur();
    },
    { passive: true, capture: true },
  );
}

export default installNumberInputGuard;
