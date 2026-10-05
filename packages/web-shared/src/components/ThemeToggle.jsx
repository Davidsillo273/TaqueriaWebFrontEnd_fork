import FAIcon from './FAIcon';

// Interruptor de tema: dos mitades en una píldora, con la activa en el rojo
// del sistema. Nació en el login del panel (la única pantalla a la que se
// llega sin sesión, sin menú de perfil); la pantalla de cocina lo usa en su
// barra superior, porque no tiene pantalla de ajustes.
const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    type="button"
    onClick={toggleTheme}
    aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    className="flex border border-line rounded-full overflow-hidden shrink-0"
  >
    <span className={`w-[30px] h-[26px] flex items-center justify-center transition-colors ${
      theme === 'light' ? 'bg-ac text-white' : 'text-muted'
    }`}>
      <FAIcon icon="sun" size="xs" />
    </span>
    <span className={`w-[30px] h-[26px] flex items-center justify-center transition-colors ${
      theme === 'dark' ? 'bg-ac text-white' : 'text-muted'
    }`}>
      <FAIcon icon="moon" size="xs" />
    </span>
  </button>
);

export default ThemeToggle;
