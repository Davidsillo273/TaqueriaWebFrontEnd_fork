// src/pages/settings.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import Card from '../components/commons/Card';
import FAIcon from '../components/commons/FAIcon';
import ImageCropModal from '../components/commons/ImageCropModal';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';
import { useAuth } from '../hooks/auth/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useProfile } from '../hooks/useProfile';

const TABS = [
  { id: 'profile', label: 'Perfil y cuenta', icon: 'user' },
  { id: 'operation', label: 'Operación', icon: 'sliders' },
  { id: 'notifications', label: 'Notificaciones', icon: 'bell' },
];

// Descripción de cada categoría, para que se entienda qué se apaga al desactivarla
const NOTIFICATION_CATEGORIES = [
  { id: 'orders', label: 'Órdenes', icon: 'receipt', description: 'Pedidos creados, cambios de estado y cancelaciones' },
  { id: 'inventory', label: 'Inventario', icon: 'box', description: 'Altas, ajustes de existencias y alertas de stock bajo' },
  { id: 'tables', label: 'Mesas', icon: 'chair', description: 'Mesas habilitadas y cambios de disponibilidad' },
  { id: 'menu', label: 'Menú', icon: 'utensils', description: 'Platillos, bebidas, combos y extras del menú' },
  { id: 'staff', label: 'Personal', icon: 'user-tie', description: 'Invitaciones, altas y cambios en el equipo' },
  { id: 'clients', label: 'Clientes', icon: 'users', description: 'Registro y actualización de clientes' },
];

// Secciones que tienen su propio umbral de "agotado" configurable
const LOW_STOCK_SECTIONS = [
  { id: 'inventory', label: 'Inventario' },
  { id: 'drinks', label: 'Bebidas' },
  { id: 'saucers', label: 'Platillos' },
  { id: 'extras', label: 'Extras' },
  { id: 'combos', label: 'Combos' },
];

// Interruptor reutilizable con el estilo del sistema
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
      checked ? 'bg-red-500' : 'bg-gray-300'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
);

function SettingsContent() {
  const { user } = useAuth();
  const { settings, loading, saving, saveSettings } = useSettings();
  const { savingProfile, savingPassword, updateProfile, changePassword } = useProfile();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Solo el administrador puede modificar la configuración global del negocio
  const isAdmin = user?.role === 'admin';

  // --- Perfil ---
  // Guardamos solo lo que el usuario va escribiendo (el "borrador"). Mientras no
  // toque nada, el formulario muestra directamente los datos de la sesión, así no
  // hace falta sincronizar con un efecto cuando esos datos terminan de cargar.
  const [profileDraft, setProfileDraft] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  // Archivo recién elegido en el input, pendiente de recortar/ajustar en el modal
  const [rawImageFile, setRawImageFile] = useState(null);

  const profileForm = profileDraft ?? {
    name: user?.name || '',
    lastname: user?.lastname || '',
  };

  // Vista previa de la foto seleccionada, antes de guardarla. Crear y liberar
  // la URL temporal del navegador (Blob URL) es justo el tipo de sincronización
  // con un sistema externo para el que existen los efectos: se crea cuando
  // cambia el archivo y se libera automáticamente en la limpieza del efecto.
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({ ...profileForm, image: imageFile });
    if (result.success) {
      addToast('Perfil actualizado correctamente', 'success');
      setImageFile(null);
      // Descartamos el borrador para volver a mostrar lo que devolvió el servidor
      setProfileDraft(null);
    } else {
      addToast(result.message, 'error');
    }
  };

  // --- Contraseña ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('La confirmación no coincide con la nueva contraseña', 'error');
      return;
    }

    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (result.success) {
      addToast('Contraseña actualizada correctamente', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      addToast(result.message, 'error');
    }
  };

  // --- Operación ---
  // Mismo enfoque que el perfil: mientras no se edite nada se muestran los
  // valores que vienen del servidor, sin efectos de sincronización.
  const [operationDraft, setOperationDraft] = useState(null);
  const operationForm = operationDraft ?? settings.operation;

  const handleOperationSubmit = async (e) => {
    e.preventDefault();
    const result = await saveSettings({ operation: operationForm });
    if (result.success) {
      addToast('Ajustes de operación guardados', 'success');
      setOperationDraft(null);
    } else {
      addToast(result.message, 'error');
    }
  };

  // --- Notificaciones ---
  // Se guarda al instante al pulsar el interruptor: son cambios de un solo clic
  const handleNotificationToggle = async (category, value) => {
    const result = await saveSettings({ notifications: { [category]: value } });
    if (result.success) {
      addToast(
        `Notificaciones de ${category} ${value ? 'activadas' : 'desactivadas'}`,
        'success'
      );
    } else {
      addToast(result.message, 'error');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-red-200 transition-all disabled:bg-gray-50 disabled:text-gray-500';
  const labelClass = 'block text-sm font-display font-semibold text-gray-700 mb-1.5';
  const buttonClass =
    'flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-2xl font-display font-semibold text-sm transition-all shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)] hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <>
    <div className="p-6 sm:p-8">
      {/* Encabezado */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
          Ajustes
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Configura tu cuenta y el funcionamiento del sistema
        </p>
      </div>

      {/* Pestañas */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-display font-medium transition-all ${
                isActive
                  ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3),inset_1px_1px_2px_rgba(255,255,255,0.3)]'
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900 border border-white/80'
              }`}
            >
              <FAIcon icon={tab.icon} size="sm" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- Perfil y cuenta --- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-display font-bold text-gray-900 mb-1">Mi perfil</h2>
            <p className="text-sm text-gray-600 mb-5">
              Así te ve el resto del equipo dentro del sistema
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                {imagePreview || user?.image ? (
                  <img
                    src={imagePreview || user.image}
                    alt={user?.name || 'Perfil'}
                    className={`w-16 h-16 rounded-full object-cover shadow-sm ${
                      imagePreview ? 'ring-2 ring-red-400' : 'ring-2 ring-white'
                    }`}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-display font-bold text-lg ring-2 ring-white shadow-sm">
                    {`${user?.name?.[0] || ''}${user?.lastname?.[0] || ''}`.toUpperCase() || '?'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <label className={labelClass}>Foto de perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    // Abrimos el modal de ajuste con el archivo elegido; el
                    // input se limpia para poder volver a elegir la misma foto después
                    onChange={(e) => {
                      const selected = e.target.files?.[0] || null;
                      if (selected) setRawImageFile(selected);
                      e.target.value = '';
                    }}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-display file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
                  />
                  {imageFile && (
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-green-600">Foto lista para guardar</p>
                      <button
                        type="button"
                        onClick={() => setRawImageFile(imageFile)}
                        className="text-xs text-gray-500 hover:text-red-500 shrink-0"
                      >
                        Ajustar
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="profile-name">Nombre</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileDraft({ ...profileForm, name: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="profile-lastname">Apellido</label>
                <input
                  id="profile-lastname"
                  type="text"
                  value={profileForm.lastname}
                  onChange={(e) => setProfileDraft({ ...profileForm, lastname: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Rol</label>
                <input type="text" value={user?.role || ''} className={inputClass} disabled />
                <p className="text-xs text-gray-500 mt-1">
                  El rol solo lo puede cambiar un administrador
                </p>
              </div>

              <button type="submit" disabled={savingProfile} className={buttonClass}>
                <FAIcon icon="floppy-disk" size="sm" />
                {savingProfile ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-display font-bold text-gray-900 mb-1">Contraseña</h2>
            <p className="text-sm text-gray-600 mb-5">
              Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="current-password">Contraseña actual</label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="new-password">Nueva contraseña</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="confirm-password">Confirmar nueva contraseña</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  className={inputClass}
                  required
                />
              </div>

              <button type="submit" disabled={savingPassword} className={buttonClass}>
                <FAIcon icon="key" size="sm" />
                {savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* --- Operación --- */}
      {activeTab === 'operation' && (
        <Card className="p-4 sm:p-6 max-w-2xl">
          <h2 className="text-lg font-display font-bold text-gray-900 mb-1">
            Operación e inventario
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Estos valores afectan a todo el equipo, no solo a tu cuenta
          </p>

          {!isAdmin && (
            <div className="mb-5 bg-yellow-100/80 border border-yellow-200 text-yellow-800 text-xs sm:text-sm rounded-2xl p-3">
              Solo un administrador puede modificar estos ajustes. Puedes verlos pero no cambiarlos.
            </div>
          )}

          <form onSubmit={handleOperationSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Umbral de "agotado" por sección</label>
              <p className="text-xs text-gray-500 mb-3">
                Cuando una sección baje de su propio umbral, el sistema genera una alerta
                automática y la marca como crítica en el panel. Cada área puede tener un
                número distinto.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LOW_STOCK_SECTIONS.map((section) => (
                  <div key={section.id}>
                    <label className="block text-xs font-display font-medium text-gray-600 mb-1" htmlFor={`low-stock-${section.id}`}>
                      {section.label}
                    </label>
                    <input
                      id={`low-stock-${section.id}`}
                      type="number"
                      min="0"
                      value={operationForm.lowStockThresholds?.[section.id] ?? 10}
                      onChange={(e) =>
                        setOperationDraft({
                          ...operationForm,
                          lowStockThresholds: {
                            ...operationForm.lowStockThresholds,
                            [section.id]: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      disabled={!isAdmin || loading}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 py-3 border-t border-gray-100">
              <div>
                <p className="font-display font-semibold text-gray-800 text-sm">
                  Refrescar el panel automáticamente
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recarga los datos del panel sin que tengas que actualizar la página
                </p>
              </div>
              <Toggle
                checked={Boolean(operationForm.autoRefreshDashboard)}
                onChange={(value) =>
                  setOperationDraft({ ...operationForm, autoRefreshDashboard: value })
                }
                disabled={!isAdmin || loading}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="refresh-seconds">
                Intervalo de refresco (segundos)
              </label>
              <input
                id="refresh-seconds"
                type="number"
                min="10"
                value={operationForm.dashboardRefreshSeconds}
                onChange={(e) =>
                  setOperationDraft({ ...operationForm, dashboardRefreshSeconds: e.target.value })
                }
                className={inputClass}
                disabled={!isAdmin || loading || !operationForm.autoRefreshDashboard}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 10 segundos</p>
            </div>

            {isAdmin && (
              <button type="submit" disabled={saving} className={buttonClass}>
                <FAIcon icon="floppy-disk" size="sm" />
                {saving ? 'Guardando...' : 'Guardar ajustes'}
              </button>
            )}
          </form>
        </Card>
      )}

      {/* --- Notificaciones --- */}
      {activeTab === 'notifications' && (
        <Card className="p-4 sm:p-6 max-w-2xl">
          <h2 className="text-lg font-display font-bold text-gray-900 mb-1">
            Preferencias de notificaciones
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Elige qué movimientos del sistema quedan registrados en la campana
          </p>

          {!isAdmin && (
            <div className="mb-5 bg-yellow-100/80 border border-yellow-200 text-yellow-800 text-xs sm:text-sm rounded-2xl p-3">
              Solo un administrador puede modificar estas preferencias.
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {NOTIFICATION_CATEGORIES.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <FAIcon icon={category.icon} size="sm" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-gray-800 text-sm">
                      {category.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                  </div>
                </div>

                <Toggle
                  checked={Boolean(settings.notifications[category.id])}
                  onChange={(value) => handleNotificationToggle(category.id, value)}
                  disabled={!isAdmin || saving || loading}
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Desactivar una categoría no borra las notificaciones existentes: solo deja de
            registrar las nuevas.
          </p>
        </Card>
      )}
    </div>

    <ImageCropModal
      file={rawImageFile}
      onCancel={() => setRawImageFile(null)}
      onConfirm={(croppedFile) => {
        setImageFile(croppedFile);
        setRawImageFile(null);
      }}
    />
    </>
  );
}

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
        <Sidebar activeMenu="settings" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <SettingsContent />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
