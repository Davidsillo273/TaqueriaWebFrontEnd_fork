import { useState, useEffect } from "react";

const API_URL = 'http://localhost:4000/api';

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

    // 1. READ - Traigo todas las comandas (mesas/dine-in) de la base de datos
    const fetchOrders = async () => {
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
    };

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

            await fetchOrders();
        } catch (err) {
            console.error("Error al cambiar el estado del pedido:", err);
            throw err;
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

            await fetchOrders();
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

            await fetchOrders();
            return { success: true };
        } catch (err) {
            console.error("Error al borrar el pedido:", err);
            return { success: false, error: err };
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return { orders, loading, fetchOrders, updateOrderStatus, cancelOrder, deleteOrder };
}
