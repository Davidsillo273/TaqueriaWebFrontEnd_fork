import { useState, useEffect } from "react";
import axios from "axios";

export default function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. READ - Traigo todos los carritos/órdenes de la base de datos
    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Le pega al router.route("/") del back por GET
            const response = await axios.get("/api/carts"); 
            setOrders(response.data);
        } catch (err) {
            console.error("Error al jalar los pedidos:", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. CREATE - Por si metemos un botón de simulación o creación rápida
    const createOrder = async (orderData) => {
        try {
            // Cumple con idCustomer, details y status tal cual el schema
            await axios.post("/api/carts", orderData);
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
            await axios.put(`/api/carts/${id}`, { status: nextStatus });
            await fetchOrders(); // Recargo para que cambie de pestaña en la interfaz
        } catch (err) {
            console.error("Error al cambiar el estado del pedido:", err);
        }
    };

    // 4. DELETE - Elimina o cancela físicamente la comanda de MongoDB
    const deleteOrder = async (id) => {
        try {
            // Le pega al router.route("/:id") por DELETE
            await axios.delete(`/api/carts/${id}`);
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