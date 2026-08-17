// src/components/commons/Logo.jsx
// Logo de SYSCOR: cambia automáticamente según el tema (claro/oscuro) y según
// el contexto ("nav" = solo el ícono, usado en la sidebar; "auth" = ícono +
// letras, usado en las pantallas de inicio de sesión / recuperación).
//
// El chile se anima por separado del resto del logo: el arte original es un
// PNG plano (sin capas), así que se preprocesó una sola vez para extraer el
// chile en un archivo aparte y "recortar" ese hueco del logo base (ver
// scripts en el historial de esta sesión). Aquí simplemente se superponen
// ambos, alineados con el offset exacto en el que se separaron, y solo la
// capa del chile lleva la animación.
import { useTheme } from '../../context/themeContext';

const VARIANTS = {
  // Ícono solo (arco + chile + "cerca"), usado en la sidebar
  nav: {
    baseSize: [541, 302],
    chiliSize: [227, 280],
    offset: [148, 35],
    chiliOrigin: '48% 12%',
    light: { base: '/logos/nav-light-base.png', chili: '/logos/nav-light-chili.png' },
    dark: { base: '/logos/nav-dark-base.png', chili: '/logos/nav-dark-chili.png' },
  },
  // Ícono + "Taquería El Corral", usado en las pantallas de autenticación
  auth: {
    baseSize: [513, 477],
    chiliSize: [199, 266],
    offset: [158, 32],
    chiliOrigin: '46% 11%',
    light: { base: '/logos/login-light-base.png', chili: '/logos/login-light-chili.png' },
    dark: { base: '/logos/login-dark-base.png', chili: '/logos/login-dark-chili.png' },
  },
};

const Logo = ({ variant = 'nav', height = 64, className = '' }) => {
  const { theme } = useTheme();
  const cfg = VARIANTS[variant] || VARIANTS.nav;
  const mode = theme === 'dark' ? 'dark' : 'light';
  const { base, chili } = cfg[mode];
  const [baseW, baseH] = cfg.baseSize;
  const [chiliW, chiliH] = cfg.chiliSize;
  const [offX, offY] = cfg.offset;

  const scale = height / baseH;
  const width = baseW * scale;

  return (
    <div
      role="img"
      aria-label="SYSCOR - Taquería El Corral"
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width, height }}
    >
      <img
        src={base}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
      />
      <img
        src={chili}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute select-none pointer-events-none logo-chili-wiggle"
        style={{
          left: offX * scale,
          top: offY * scale,
          width: chiliW * scale,
          height: chiliH * scale,
          transformOrigin: cfg.chiliOrigin,
        }}
      />
    </div>
  );
};

export default Logo;
