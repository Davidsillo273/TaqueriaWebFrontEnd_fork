// components/kitchen/KitchenDevicesList.jsx
// Pantallas de cocina emparejadas, con la opción de desvincular cada una
// (kill switch individual: su token deja de valer al instante).
import FAIcon from '@syscor/web-shared/src/components/FAIcon';

const formatDate = (date) =>
  date ? new Date(date).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// "Mozilla/5.0 (Windows NT 10.0; ...) Chrome/..." -> "Chrome · Windows"
const describeBrowser = (userAgent = '') => {
  const browser = /Edg\//.test(userAgent) ? 'Edge' : /Chrome\//.test(userAgent) ? 'Chrome' : /Firefox\//.test(userAgent) ? 'Firefox' : /Safari\//.test(userAgent) ? 'Safari' : 'Navegador';
  const os = /Android/.test(userAgent) ? 'Android' : /iPhone|iPad/.test(userAgent) ? 'iOS' : /Windows/.test(userAgent) ? 'Windows' : /Mac OS/.test(userAgent) ? 'macOS' : /Linux/.test(userAgent) ? 'Linux' : '';
  return [browser, os].filter(Boolean).join(' · ');
};

export default function KitchenDevicesList({ devices, loading, busy, isAdmin, onUnpair, onPairAnother, systemEnabled }) {
  const active = devices.filter((device) => device.active);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="kick text-ink">PANTALLAS EMPAREJADAS · <span className="num">{active.length}</span></p>
        {isAdmin && systemEnabled && (
          <button
            type="button"
            onClick={onPairAnother}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ac text-ac text-[12.5px] font-medium hover:bg-ac hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
          >
            <FAIcon icon="plus" size="xs" />
            Emparejar otra pantalla
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Cargando pantallas...</p>
      ) : active.length === 0 ? (
        <p className="text-sm text-muted border border-dashed border-line px-4 py-3">
          Ninguna pantalla emparejada. Abre la pantalla de cocina y usa el código que muestra.
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line">
          {active.map((device) => (
            <li key={device.deviceId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="shrink-0 w-9 h-9 border border-ok text-ok flex items-center justify-center">
                  <FAIcon icon="shield-halved" size="sm" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink font-medium">
                    {device.label} <span className="num text-muted text-[12px]">· {device.shortId}</span>
                  </p>
                  <p className="text-[12px] text-muted truncate">
                    {describeBrowser(device.userAgent)} · Emparejada por {device.pairedBy || 'un administrador'} el {formatDate(device.pairedAt)}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onUnpair(device)}
                  disabled={busy}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 border border-line text-inkalt text-[12.5px] hover:border-ac hover:text-ac transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <FAIcon icon="ban" size="xs" />
                  Desvincular
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
