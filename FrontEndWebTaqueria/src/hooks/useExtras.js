import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:4000/api/extras';

export default function useExtras() {
	const [extras, setExtras] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Obtener todos los extras
	const fetchExtras = async () => {
		setLoading(true);
		try {
			const response = await fetch(API_URL);
			if (!response.ok) throw new Error('Error al obtener los extras');
			const data = await response.json();
			setExtras(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Insertar un extra
	const addExtra = async (extraData) => {
		try {
			const response = await fetch(API_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(extraData),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Error al guardar el extra');
			}
			await fetchExtras(); // Recargar lista
			return { success: true };
		} catch (err) {
			return { success: false, message: err.message };
		}
	};

	// Actualizar un extra
	const updateExtra = async (id, extraData) => {
		try {
			const response = await fetch(`${API_URL}/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(extraData),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Error al actualizar el extra');
			}
			await fetchExtras();
			return { success: true };
		} catch (err) {
			return { success: false, message: err.message };
		}
	};

	// Eliminar un extra
	const deleteExtra = async (id) => {
		try {
			const response = await fetch(`${API_URL}/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) throw new Error('Error al eliminar el extra');
			setExtras(prev => prev.filter(e => e._id !== id));
			return { success: true };
		} catch (err) {
			return { success: false, message: err.message };
		}
	};

	useEffect(() => {
		fetchExtras();
	}, []);

	return { extras, loading, error, addExtra, updateExtra, deleteExtra, refresh: fetchExtras };
}