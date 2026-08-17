// src/components/client/ClientDetailModal.jsx
// Vista de solo lectura con la información más relevante de un cliente para
// el admin (ya no existe edición de clientes desde aquí).
import React from 'react';
import FAIcon from '../commons/FAIcon';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <FAIcon icon={icon} size="sm" className="text-gray-400 mt-0.5 w-4" />
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-display font-semibold">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-words">{value || '—'}</p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white/70 rounded-2xl border border-white/80 p-4 mb-4">
    <h4 className="text-xs font-display font-bold uppercase tracking-wide text-gray-500 mb-1">{title}</h4>
    <div className="divide-y divide-gray-100">{children}</div>
  </div>
);

const ClientDetailModal = ({ isOpen, onClose, client }) => {
  if (!isOpen || !client) return null;

  const fullName = `${client.personalInfo?.name || ''} ${client.personalInfo?.lastname || ''}`.trim() || 'Cliente';
  const addresses = client.personalInfo?.addresses || [];
  const phones = client.personalInfo?.phones || [];
  const isVerified = !!client.loginInfo?.isVerified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/80 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-red-500 px-5 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {client.personalInfo?.image ? (
              <img src={client.personalInfo.image} alt={fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
                {fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-white font-display font-bold text-lg truncate">{fullName}</h3>
              <p className="text-white/80 text-xs truncate">{client.loginInfo?.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0">
            <FAIcon icon="times" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-display font-semibold ${isVerified ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
              {isVerified ? 'Cuenta verificada' : 'Sin verificar'}
            </span>
          </div>

          <Section title="Contacto">
            <InfoRow icon="envelope" label="Correo electrónico" value={client.loginInfo?.email} />
            <InfoRow icon="phone" label="Teléfono" value={phones[0]} />
            <InfoRow icon="calendar" label="Registrado el" value={client.createdAt ? new Date(client.createdAt).toLocaleDateString('es-SV', { dateStyle: 'long' }) : null} />
          </Section>

          {addresses.length > 0 && (
            <Section title="Direcciones">
              {addresses.map((addr, idx) => (
                <InfoRow key={idx} icon="location-dot" label={addr.tag || 'Dirección'} value={addr.details} />
              ))}
            </Section>
          )}

          {phones.length > 1 && (
            <Section title="Otros teléfonos">
              {phones.slice(1).map((p, idx) => (
                <InfoRow key={idx} icon="phone" label={`Teléfono ${idx + 2}`} value={p} />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
