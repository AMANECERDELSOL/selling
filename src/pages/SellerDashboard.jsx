import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SellerDashboard() {
    const { token, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setOrders(data.orders);

            // Calculate stats
            const stats = {
                pending: data.orders.filter(o => o.status === 'pending').length,
                processing: data.orders.filter(o => o.status === 'processing').length,
                completed: data.orders.filter(o => o.status === 'completed').length
            };
            setStats(stats);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert('Estado actualizado exitosamente');
                fetchOrders();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al actualizar estado');
            }
        } catch (error) {
            alert('Error al actualizar estado');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'badge-warning',
            processing: 'badge-info',
            completed: 'badge-success',
            cancelled: 'badge-error'
        };
        return badges[status] || 'badge-primary';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pendiente',
            processing: 'Procesando',
            completed: 'Completado',
            cancelled: 'Cancelado'
        };
        return texts[status] || status;
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <h1 className="mb-xl" style={{ fontSize: '2rem', fontWeight: '700' }}>
                Panel de Vendedor
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 mb-xl">
                <div className="glass-card fade-in">
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>💰</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
                        ${user?.earnings?.toFixed(2) || '0.00'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Ganancias Totales
                    </div>
                </div>

                <div className="glass-card fade-in" style={{ animationDelay: '0.1s' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>⏳</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.pending}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Órdenes Pendientes
                    </div>
                </div>

                <div className="glass-card fade-in" style={{ animationDelay: '0.2s' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>📦</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.processing}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        En Proceso
                    </div>
                </div>

                <div className="glass-card fade-in" style={{ animationDelay: '0.3s' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>✅</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.completed}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Completadas
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="glass-card">
                <h2 className="mb-lg" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    Mis Órdenes Asignadas
                </h2>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                        No tienes órdenes asignadas
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-md">
                        {orders.map(order => (
                            <div key={order.id} className="card">
                                <div className="flex justify-between items-center mb-md" style={{ flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                                            Orden #{order.id}
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                    <span className={`badge ${getStatusBadge(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="mb-md">
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                                        Productos:
                                    </h4>
                                    {order.items?.map(item => (
                                        <div key={item.id} style={{ padding: 'var(--spacing-xs) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            • {item.product_name} x{item.quantity} (${item.price.toFixed(2)} c/u)
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-md glass-card" style={{ padding: 'var(--spacing-sm)' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                                        Información de Contacto:
                                    </h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Nombre:</strong> {order.contact_name}<br />
                                        <strong>Email:</strong> {order.contact_email}<br />
                                        {order.contact_phone && <><strong>Teléfono:</strong> {order.contact_phone}<br /></>}
                                        {order.contact_info && <><strong>Info:</strong> {order.contact_info}</>}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                        Total: ${order.total_amount.toFixed(2)}
                                    </span>

                                    {order.status === 'pending' && (
                                        <button
                                            className="btn btn-primary btn-small"
                                            onClick={() => updateOrderStatus(order.id, 'processing')}
                                        >
                                            Tomar Orden
                                        </button>
                                    )}

                                    {order.status === 'processing' && (
                                        <div className="flex gap-sm">
                                            <button
                                                className="btn btn-primary btn-small"
                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                            >
                                                Completar
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
