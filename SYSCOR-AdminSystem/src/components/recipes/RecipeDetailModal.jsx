// src/components/recipes/RecipeDetailModal.jsx
import { Link } from 'react-router-dom';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import { ModalHeader, FormSection, ReadField, CountBadge, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY } from '@syscor/web-shared/src/components/FormModal';
import { UNIT_LABELS } from '../../constants/units';

export default function RecipeDetailModal({
  isOpen,
  onClose,
  recipe,
  editRoute,
  bookLabel,
}) {
  if (!isOpen || !recipe) return null;

  const name = recipe.title || recipe.name || 'Sin nombre';
  const category = recipe.subcategory || recipe.category || 'General';
  const price = recipe.price ? `$${parseFloat(recipe.price).toFixed(2)}` : null;
  const ingredients = recipe.recipe || [];
  const image = recipe.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-2xl border border-line w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <ModalHeader
          icon="book-open"
          title={name}
          badge="Ficha técnica"
          subtitle={bookLabel}
          onClose={onClose}
        />

        {/* Imagen opcional */}
        {image && (
          <div className="h-44 sm:h-52 w-full bg-surfalt border-b border-line overflow-hidden shrink-0">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Contenido con scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4 bg-surfalt/30">
          {/* Datos generales */}
          <FormSection icon="circle-info" title="Datos generales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5 gap-y-3">
              <ReadField label="Categoría" value={category} />
              {price && <ReadField label="Precio de venta" value={price} mono />}
            </div>
          </FormSection>

          {/* Tabla de ingredientes */}
          <FormSection
            icon="list"
            title="Insumos y dosificación"
            badge={<CountBadge>{ingredients.filter((i) => i.tracked).length} de {ingredients.length} controlados</CountBadge>}
          >

            {ingredients.length === 0 ? (
              <p className="text-sm text-muted italic py-4 text-center border border-dashed border-line rounded-lg">
                No hay ingredientes asignados a esta receta.
              </p>
            ) : (
              <div className="border border-line rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surfalt border-b border-line">
                      <th className="kick text-muted py-2 px-3">Insumo</th>
                      <th className="kick text-muted py-2 px-3 text-right">Cantidad</th>
                      <th className="kick text-muted py-2 px-3 text-center">Inventario</th>
                      <th className="kick text-muted py-2 px-3 text-center">Quitable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {ingredients.map((item, idx) => {
                      const unitLabel = UNIT_LABELS[item.unit] || item.unit || '';
                      return (
                        <tr key={idx} className="hover:bg-surfalt/50">
                          <td className="py-2.5 px-3 font-medium text-ink flex items-center gap-2">
                            <FAIcon
                              icon={item.tracked ? 'box' : 'circle-info'}
                              size="xs"
                              className={item.tracked ? 'text-ok' : 'text-muted'}
                            />
                            <span>{item.name}</span>
                          </td>
                          <td className="py-2.5 px-3 num font-semibold text-ink text-right">
                            {item.quantity ? `${item.quantity} ${unitLabel}` : unitLabel}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {item.tracked ? (
                              <span className="text-[11px] text-ok font-medium">Vinculado</span>
                            ) : (
                              <span className="text-[11px] text-muted">Libre</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {item.removable ? (
                              <span className="px-1.5 py-0.5 bg-warnsoft text-warn text-[10px] font-semibold">
                                Sí
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted">No</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </FormSection>
        </div>

        {/* Pie del modal con acciones */}
        <div className="px-5 py-3.5 border-t border-line bg-surface flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={MODAL_BTN_SECONDARY}
          >
            Cerrar ficha
          </button>

          {editRoute && (
            <Link
              to={editRoute.path}
              className={MODAL_BTN_PRIMARY}
            >
              <FAIcon icon="pen" size="xs" />
              Editar receta
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
