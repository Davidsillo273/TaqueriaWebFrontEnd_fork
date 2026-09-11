import { useState, useEffect, useCallback } from "react";
import { useSocketEvent, useSocket } from "./useSocket";
import { SOCKET_EVENTS } from "../constants/socketEvents";

const API_URL = import.meta.env.VITE_API_URL || '/api';

// El flujo de estados que sigue una comanda. "atrasado" lo asigna el propio
// backend cuando una orden lleva más de 1 hora en "preparing".
const NEXT_STATUS = {
    pending: 'preparing',
    preparing: 'ready',
    atrasado: 'ready',
    ready: 'delivered',
};

export default function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const { reconnectCount } = useSocket();

    // 1. READ - Traigo todas las comandas (mesas/dine-in) de la base de datos.
    // Es la "foto" inicial: a partir de ahí el servidor manda cada cambio por
    // socket, así que esta consulta ya no se repite tras cada acción.
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // credentials: 'include' manda la cookie de sesión, para que el
            // backend sepa qué empleado realizó el movimiento y lo registre.
            const response = await fetch(`${API_URL}/orders`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            console.error("Error al jalar los pedidos:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Tiempo real ---
    // Cada evento toca SOLO la comanda afectada, en vez de volver a pedir la
    // lista completa. Así la pantalla no parpadea y el servidor no recibe una
    // consulta entera por cada cambio de estado.

    // Comanda nueva: entra arriba, que es donde la ordena el backend
    // (sort createdAt descendente).
    useSocketEvent(SOCKET_EVENTS.ORDER_CREATED, ({ order }) => {
        if (!order?._id) return;
        setOrders((prev) => (prev.some((o) => o._id === order._id) ? prev : [order, ...prev]));
    });

    // Cambio de estado, de pago, cancelación o el "atrasado" que marca solo el
    // servidor: se reemplaza el registro completo, que llega ya poblado con
    // mesa/mesero/cliente igual que en la consulta normal.
    useSocketEvent(SOCKET_EVENTS.ORDER_UPDATED, ({ order }) => {
        if (!order?._id) return;
        setOrders((prev) => {
            const exists = prev.some((o) => o._id === order._id);
            // Si no estaba en la lista (ej. se creó mientras esta pestaña
            // estaba desconectada), se agrega en vez de perderse.
            if (!exists) return [order, ...prev];
            return prev.map((o) => (o._id === order._id ? order : o));
        });
    });

    useSocketEvent(SOCKET_EVENTS.ORDER_DELETED, ({ orderId }) => {
        if (!orderId) return;
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
    });

    // Al reconectar sí se pide la lista completa: los cambios ocurridos
    // mientras el cable estuvo caído no llegaron como eventos.
    useEffect(() => {
        if (reconnectCount > 0) fetchOrders();
    }, [reconnectCount, fetchOrders]);

    // 2. UPDATE - Avanza el estado de la comanda al siguiente de la secuencia
    const updateOrderStatus = async (id, currentStatus) => {
        try {
            const nextStatus = NEXT_STATUS[currentStatus] || 'preparing';

            const response = await fetch(`${API_URL}/orders/${id}/status`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // No se recarga la lista: el backend emite order:updated y el
            // listener de arriba actualiza esta comanda al instante.
        } catch (err) {
            console.error("Error al cambiar el estado del pedido:", err);
            throw err;
        }
    };

    // 2b. UPDATE - Cambia solo el estado de pago (ej. marcar cobrado un contraentrega)
    const updatePaymentStatus = async (id, paymentStatus) => {
        try {
            const response = await fetch(`${API_URL}/orders/${id}/payment-status`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                return { success: false, message: data.message || 'No se pudo actualizar el estado de pago' };
            }

            return { success: true };
        } catch (err) {
            console.error("Error al actualizar el estado de pago:", err);
            return { success: false, message: 'Error de conexión al actualizar el estado de pago' };
        }
    };

    // 3. CANCEL - Marca la comanda como cancelada; requiere la contraseña de
    // un administrador como confirmación (no borra el registro).
    const cancelOrder = async (id, adminPassword) => {
        try {
            const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminPassword }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                return { success: false, message: data.message || 'No se pudo cancelar el pedido' };
            }

            return { success: true };
        } catch (err) {
            console.error("Error al cancelar el pedido:", err);
            return { success: false, message: 'Error de conexión al cancelar el pedido' };
        }
    };

    // 4. DELETE - Elimina físicamente la comanda de la base de datos
    const deleteOrder = async (id) => {
        try {
            const response = await fetch(`${API_URL}/orders/${id}`, {
                credentials: 'include',
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { success: true };
        } catch (err) {
            console.error("Error al borrar el pedido:", err);
            return { success: false, error: err };
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, fetchOrders, updateOrderStatus, updatePaymentStatus, cancelOrder, deleteOrder };
}
