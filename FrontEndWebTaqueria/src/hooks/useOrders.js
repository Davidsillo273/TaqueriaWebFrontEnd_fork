import { useState, useEffect } from "react";

const API_URL = 'http://localhost:4000/api';

export default function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. READ - Traigo todos los carritos/órdenes de la base de datos
    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Le pega al router.route("/") del back por GET
            // credentials: 'include' manda la cookie de sesión, para que el
            // backend sepa qué empleado realizó el movimiento y lo registre.
            const response = await fetch(`${API_URL}/orders/carts`, { credentials: 'include' });
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

    // 2. CREATE - Por si metemos un botón de simulación o creación rápida
    const createOrder = async (orderData) => {
        try {
            // Cumple con customerId, details y status tal cual el schema
            const response = await fetch(`${API_URL}/orders/carts`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchOrders(); // Actualizo la lista al toque
            return { success: true };
        } catch (err) {
            console.error("Error al meter el pedido:", err);
            return { success: false, error: err };
        }
    };

    // 3. UPDATE - Modifica el status secuencialmente para moverlo en las pestañas
    const updateOrderStatus = async (id, currentStatus) => {
        try {
            let nextStatus = "cooking";
            if (currentStatus === "cooking") nextStatus = "ready";
            else if (currentStatus === "ready") nextStatus = "delivered";

            // Le pega al router.route("/:id") por PUT
            const response = await fetch(`${API_URL}/orders/carts/${id}`, {
                credentials: 'include',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: nextStatus }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchOrders(); // Recargo para que cambie de pestaña en la interfaz
        } catch (err) {
            console.error("Error al cambiar el estado del pedido:", err);
        }
    };

    // 4. DELETE - Elimina o cancela físicamente la comanda de MongoDB
    const deleteOrder = async (id) => {
        try {
            // Le pega al router.route("/:id") por DELETE
            const response = await fetch(`${API_URL}/orders/carts/${id}`, {
                credentials: 'include',
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchOrders(); // Limpio la pantalla al instante
            return { success: true };
        } catch (err) {
            console.error("Error al borrar el pedido:", err);
            return { success: false, error: err };
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return { orders, loading, fetchOrders, createOrder, updateOrderStatus, deleteOrder };
}