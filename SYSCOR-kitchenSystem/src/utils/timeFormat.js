// Formatos de tiempo de la pantalla de cocina.

const pad = (value) => String(value).padStart(2, '0');

// Cronómetro: "4:05", "12:34" o "1:02:10" pasada la hora.
export const formatElapsed = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
};

// Hora de reloj "19:30"
export const formatClock = (time) => {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return '--:--';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Duración para decirla en voz alta: "12 minutos y 30 segundos", "1 hora y 5 minutos".
export const spokenDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const unit = (value, singular, plural) => `${value} ${value === 1 ? singular : plural}`;

  if (hours > 0) {
    return minutes > 0
      ? `${unit(hours, 'hora', 'horas')} y ${unit(minutes, 'minuto', 'minutos')}`
      : unit(hours, 'hora', 'horas');
  }
  if (minutes > 0) {
    return seconds > 0 && minutes < 10
      ? `${unit(minutes, 'minuto', 'minutos')} y ${unit(seconds, 'segundo', 'segundos')}`
      : unit(minutes, 'minuto', 'minutos');
  }
  return unit(seconds, 'segundo', 'segundos');
};
