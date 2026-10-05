// Respuestas de conversación de Chef Panchita (saludos, gracias, despedidas...).
//
// No son comandos de cocina, pero una persona espera que le contesten como
// persona: "Panchita, hola" no puede recibir un "no te entendí". Para que no
// suene a grabación, cada intención tiene varias frases y, cuando aporta, se
// menciona cómo va la cocina en ese momento.
import { TIMED_PHASES } from '../orderPhase';
import { formatClock } from '../timeFormat';

const pick = (options) => options[Math.floor(Math.random() * options.length)];

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

// "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora local
export const timeOfDayGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

// Una frase corta de cómo está la cocina ahora
export const boardSummary = (entries = []) => {
  const cooking = entries.filter((entry) => entry.phase === 'cooking').length;
  const queued = entries.filter((entry) => TIMED_PHASES.includes(entry.phase) && entry.phase !== 'cooking').length;
  if (cooking === 0 && queued === 0) return 'La cocina está tranquila: no hay comandas por ahora.';
  if (queued === 0) return `Ahorita hay ${plural(cooking, 'comanda', 'comandas')} en cocina y nada en cola.`;
  return `Ahorita hay ${plural(cooking, 'comanda', 'comandas')} en cocina y ${plural(queued, 'pendiente', 'pendientes')}.`;
};

/**
 * @param {string} intent greeting | howAreYou | thanks | goodbye | whoAreYou | time | praise | acknowledge
 * @param {{ entries: Array, now?: Date }} context
 * @returns {{ text: string } | null} null si la intención no es de conversación
 */
export const smallTalkReply = (intent, { entries = [], now = new Date() } = {}) => {
  const summary = boardSummary(entries);

  switch (intent) {
    case 'greeting':
      return {
        text: `${pick(['¡Hola!', `¡${timeOfDayGreeting(now)}!`, `¡Hola, ${timeOfDayGreeting(now).toLowerCase()}!`])} ${summary} ${pick([
          '¿En qué te ayudo?',
          '¿Qué necesitas?',
          'Aquí estoy para lo que necesites.',
        ])}`,
      };

    case 'howAreYou':
      return {
        text: `${pick(['¡Muy bien, gracias por preguntar!', '¡Lista para trabajar!', 'Bien, con ganas de sacar las comandas.'])} ${summary}`,
      };

    case 'thanks':
      return { text: pick(['¡Con gusto!', '¡Para eso estoy!', 'De nada, aquí sigo.', '¡A la orden!']) };

    case 'goodbye':
      return { text: pick(['¡Hasta luego! Buen trabajo hoy.', '¡Nos vemos! Que les vaya bien.', '¡Adiós! Aquí me quedo cuidando las comandas.']) };

    case 'whoAreYou':
      return {
        text: 'Soy Chef Panchita, la asistente de la cocina. Te digo cuánto lleva cada orden, cuál sigue o cuál es la más pesada, y marco las órdenes como listas cuando me lo pides. Por ejemplo: Panchita, marca la orden tres como lista.',
      };

    case 'time':
      return { text: `Son las ${formatClock(now)}. ${summary}` };

    case 'praise':
      return { text: pick(['¡Gracias! Ustedes son los que cocinan.', '¡Qué amable! Hacemos buen equipo.', '¡Gracias! Seguimos así.']) };

    case 'acknowledge':
      return { text: pick(['Va.', 'Perfecto.', 'Entendido.', 'Listo, aquí estoy si me necesitas.']) };

    default:
      return null;
  }
};

export default smallTalkReply;
