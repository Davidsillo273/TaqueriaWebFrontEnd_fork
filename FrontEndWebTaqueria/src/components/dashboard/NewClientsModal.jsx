// src/components/dashboard/NewClientsModal.jsx
import FormModal, { FormSection, CountBadge } from '../commons/FormModal';

const NewClientsModal = ({ isOpen, onClose, clients }) => {
  if (!isOpen) return null;

  return (
    <FormModal
      icon="user-plus"
      title="Clientes nuevos"
      badge={`${clients.length}`}
      badgeTone="ok"
      subtitle="Registrados hoy"
      onClose={onClose}
      cancelLabel="Cerrar"
      maxWidth="max-w-lg"
    >
      <FormSection icon="users" title="Registrados hoy" badge={<CountBadge>{clients.length} clientes</CountBadge>}>
      <div className="space-y-2">
          {clients.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">Todavía no se ha registrado ningún cliente hoy</p>
          ) : (
            clients.map((c) => {
              const name = `${c.personalInfo?.name || ''} ${c.personalInfo?.lastname || ''}`.trim() || 'Cliente';
              return (
                <div key={c._id} className="bg-surface rounded-lg border border-line p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-display font-medium text-xs shrink-0">
                    {name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-medium text-ink text-sm truncate">{name}</p>
                    <p className="text-xs text-muted truncate">{c.loginInfo?.email}</p>
                  </div>
                  {c.createdAt && (
                    <span className="num text-[11px] text-muted shrink-0">
                      {new Date(c.createdAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              );
            })
          )}
      </div>
      </FormSection>
    </FormModal>
  );
};

export default NewClientsModal;
