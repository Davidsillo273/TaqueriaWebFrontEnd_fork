// Puestos de trabajo de un empleado (personalInfo.type). Espejo exacto del
// enum del backend (src/models/users/employeeModel.js) y de sus traducciones
// (payrollController.js, notificationUtils.js): los mismos 7 valores, en el
// mismo orden, para que un puesto nunca se traduzca distinto según la
// pantalla que lo muestre — que fue justo el bug que causó el filtro
// duplicado del Dashboard (algunos empleados con texto crudo sin traducir).
export const EMPLOYEE_TYPE_LABELS = {
  kitchen: 'Cocina',
  waiter: 'Mesero',
  cashier: 'Cajero',
  manager: 'Gerente',
  cleaner: 'Limpieza',
  delivery: 'Repartidor',
  other: 'Otro',
};

// Mismo catálogo, en formato { value, label } para poblar selects.
export const EMPLOYEE_TYPE_OPTIONS = Object.entries(EMPLOYEE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

// Traduce un puesto crudo del backend a su etiqueta en español. Si llega un
// valor que no está en el diccionario (dato viejo sin normalizar), se
// muestra tal cual en vez de dejarlo vacío — así se nota que hay que
// corregirlo, en vez de ocultarlo silenciosamente.
export const translateEmployeeType = (type) => EMPLOYEE_TYPE_LABELS[type] || type || 'Otro';

export default { EMPLOYEE_TYPE_LABELS, EMPLOYEE_TYPE_OPTIONS, translateEmployeeType };
