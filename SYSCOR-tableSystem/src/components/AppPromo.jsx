// "Descarga nuestra app". Por ahora la app no está en las tiendas: el botón
// baja el APK (VITE_APP_DOWNLOAD_URL). Sin enlace configurado no se muestra.
const DOWNLOAD_URL = import.meta.env.VITE_APP_DOWNLOAD_URL || '';

const PERKS = [
  { icon: 'ph-moped', text: 'Pide a domicilio o para llevar' },
  { icon: 'ph-calendar-check', text: 'Reserva tu mesa y pide antes de llegar' },
  { icon: 'ph-wallet', text: 'Guarda tus direcciones y tarjetas' },
];

export default function AppPromo() {
  if (!DOWNLOAD_URL) return null;
  return (
    <section className="overflow-hidden border border-line bg-surface rounded-md">
      <div className="bg-ac px-4 py-5 text-white">
        <p className="kick opacity-80">App de Taquería El Corral</p>
        <h2 className="mt-1 text-2xl leading-tight">El Corral, ahora en tu teléfono</h2>
      </div>
      <ul className="grid gap-2 px-4 py-4">
        {PERKS.map((perk) => (
          <li key={perk.text} className="flex items-center gap-3 text-sm text-ink">
            <i className={`ph ${perk.icon} text-xl text-ac`} aria-hidden="true" />
            {perk.text}
          </li>
        ))}
      </ul>
      <div className="px-4 pb-4">
        <a
          href={DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 font-medium text-bg rounded-md"
        >
          <i className="ph-fill ph-android-logo text-xl" aria-hidden="true" />
          Descargar para Android
        </a>
        <p className="mt-2 text-center text-xs text-muted">
          Al instalarla, tu teléfono puede pedirte permitir apps de esta fuente.
        </p>
      </div>
    </section>
  );
}
