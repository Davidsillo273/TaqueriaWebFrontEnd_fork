import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, useTheme } from '@syscor/web-shared/src/context/themeContext';
import Logo from '@syscor/web-shared/src/components/Logo';
import useTablePage, { tokenFromPath } from './hooks/useTablePage';
import RequestStatus from './components/RequestStatus';
import ChoiceSheet from './components/ChoiceSheet';
import BillCard from './components/BillCard';
import AppPromo from './components/AppPromo';
import { PAY_METHODS, REASONS } from './constants/options';

// Página de la mesa: se abre al escanear el QR pegado en la mesa
// (https://<sitio>/mesa/<token>). Sin cuenta ni app: el cliente pide la
// cuenta o llama a su mesero, y ve en vivo quién viene.
export default function App() {
  return (
    <ThemeProvider>
      <SystemTheme />
      <TablePage />
    </ThemeProvider>
  );
}

// El cliente no tiene botón de tema: se sigue el del teléfono.
function SystemTheme() {
  const { setTheme } = useTheme();
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setTheme(query.matches ? 'dark' : 'light');
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, [setTheme]);
  return null;
}

const pad = (n) => String(n).padStart(2, '0');

function TablePage() {
  const token = useMemo(() => tokenFromPath(), []);
  const { data, loading, error, sending, cooldown, active, send, cancel, reload } = useTablePage(token);
  const [sheet, setSheet] = useState(null); // 'bill' | 'waiter' | null
  const [notice, setNotice] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeSheet = useCallback(() => setSheet(null), []);

  const choose = async (key) => {
    const body = sheet === 'bill' ? { type: 'bill', payMethod: key } : { type: 'waiter', reason: key };
    const failure = await send(body);
    setSheet(null);
    if (failure) setNotice(failure);
  };

  const onCancel = async () => {
    setCanceling(true);
    const failure = await cancel();
    setCanceling(false);
    if (failure) setNotice(failure);
  };

  if (loading && !data) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ac" aria-hidden="true" />
          <p className="text-ink">Buscando tu mesa…</p>
          <p className="text-sm text-muted">Puede tardar unos segundos.</p>
        </div>
      </Shell>
    );
  }

  if (error && !data) {
    const notFound = error.status === 404;
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <i className={`ph ${notFound ? 'ph-qr-code' : 'ph-wifi-slash'} text-5xl text-muted`} aria-hidden="true" />
          <h1 className="text-2xl text-ink">{notFound ? 'Este código no es de una mesa' : 'No pudimos conectar'}</h1>
          <p className="max-w-xs text-sm text-muted">
            {notFound
              ? 'Vuelve a escanear el código de tu mesa o pídele ayuda a un mesero.'
              : error.message}
          </p>
          {!notFound ? (
            <button type="button" onClick={reload} className="mt-2 bg-ac px-5 py-3 font-medium text-white rounded-md">
              Reintentar
            </button>
          ) : null}
        </div>
      </Shell>
    );
  }

  const { table, open, waiter, bill, request } = data;
  const busy = active && request?.status !== 'acknowledged';
  const blocked = busy || cooldown > 0 || sending;
  const waiterName = waiter?.name;

  return (
    <Shell>
      <header className="pt-2">
        <p className="kick text-muted">{table.floor || 'Taquería El Corral'}</p>
        <h1 className="mt-1 text-5xl leading-none text-ink">
          Mesa <span className="num">{pad(table.number)}</span>
        </h1>
        {open ? (
          <p className="mt-2 text-inkalt">
            {waiterName ? (
              <>
                Te atiende <span className="font-medium text-ink">{waiterName}</span>
              </>
            ) : (
              'Bienvenido. Aquí puedes llamar a un mesero cuando lo necesites.'
            )}
          </p>
        ) : null}
      </header>

      {notice ? (
        <div className="border border-warn bg-warnsoft p-3 text-sm rounded-md" role="alert">
          <p className="font-medium text-ink">{notice.title}</p>
          <p className="text-inkalt">{notice.message}</p>
        </div>
      ) : null}

      {!open ? (
        <section className="border border-line bg-surface p-5 rounded-md">
          <i className="ph ph-clock text-3xl text-muted" aria-hidden="true" />
          <h2 className="mt-2 text-xl text-ink">Tu mesa todavía no está abierta</h2>
          <p className="mt-1 text-sm text-muted">
            Cuando un mesero te asigne esta mesa podrás pedir la cuenta o llamarlo desde aquí, sin levantar la mano.
          </p>
        </section>
      ) : (
        <>
          {active ? <RequestStatus request={request} onCancel={onCancel} canceling={canceling} /> : null}

          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              icon="ph-receipt"
              title="Pedir la cuenta"
              subtitle="Sin levantar la mano"
              disabled={blocked}
              onClick={() => setSheet('bill')}
            />
            <ActionButton
              icon="ph-hand-waving"
              title={waiterName ? `Llamar a ${waiterName}` : 'Llamar al mesero'}
              subtitle="Viene a tu mesa"
              disabled={blocked}
              onClick={() => setSheet('waiter')}
            />
          </div>
          {!busy && cooldown > 0 ? (
            <p className="-mt-2 text-center text-xs text-muted">Podrás pedir otra cosa en {cooldown} s.</p>
          ) : null}

          <BillCard bill={bill} />
        </>
      )}

      <AppPromo />

      <footer className="pb-2 pt-4 text-center text-xs text-muted">Taquería El Corral · Apopa</footer>

      <ChoiceSheet
        open={sheet === 'bill'}
        title="¿Cómo vas a pagar?"
        subtitle={bill?.total ? `Tu cuenta va en $${bill.total.toFixed(2)}.` : 'Así tu mesero llega preparado.'}
        options={Object.entries(PAY_METHODS).map(([key, o]) => ({ key, ...o }))}
        sending={sending}
        onChoose={choose}
        onClose={closeSheet}
      />
      <ChoiceSheet
        open={sheet === 'waiter'}
        title={waiterName ? `¿Para qué llamas a ${waiterName}?` : '¿Para qué llamas al mesero?'}
        subtitle="Así llega sabiendo qué necesitas."
        options={Object.entries(REASONS).map(([key, o]) => ({ key, label: o.label, icon: o.icon }))}
        note={
          waiterName
            ? `Si ${waiterName} no responde en 30 s, avisamos a otro mesero. Si es para dejar propina, esperamos a ${waiterName}.`
            : 'Avisamos a todos los meseros: el primero que esté libre viene.'
        }
        sending={sending}
        onChoose={choose}
        onClose={closeSheet}
      />
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Logo variant="nav" height={34} />
          <span className="kick text-muted">Servicio a la mesa</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionButton({ icon, title, subtitle, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-36 flex-col items-start justify-between gap-4 border border-line bg-surface p-4 text-left rounded-md transition-colors hover:border-ac active:bg-acsoft disabled:opacity-45"
    >
      <i className={`ph ${icon} text-3xl text-ac`} aria-hidden="true" />
      <span>
        <span className="block text-lg leading-tight text-ink" style={{ fontFamily: 'Archivo, system-ui, sans-serif' }}>
          {title}
        </span>
        <span className="mt-1 block text-xs text-muted">{subtitle}</span>
      </span>
    </button>
  );
}
