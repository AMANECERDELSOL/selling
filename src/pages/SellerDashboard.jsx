import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SellerDashboard() {
    const { token, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'

    // Product management states
    const [products, setProducts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        category: 'joyeria'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

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

    // Product management functions
    const handleProductFormChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setProductForm({
            name: '',
            description: '',
            price: '',
            stock: '',
            image_url: '',
            category: 'joyeria'
        });
        setShowProductForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            image_url: product.image_url || '',
            category: product.category || 'joyeria'
        });
        setShowProductForm(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();

        try {
            const url = editingProduct
                ? `${API_URL}/api/products/${editingProduct.id}`
                : `${API_URL}/api/products`;

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...productForm,
                    price: parseFloat(productForm.price),
                    stock: parseInt(productForm.stock)
                })
            });

            if (response.ok) {
                alert(editingProduct ? 'Producto actualizado' : 'Producto agregado exitosamente');
                setShowProductForm(false);
                fetchProducts();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al guardar producto');
            }
        } catch (error) {
            alert('Error al guardar producto');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const response = await fetch(`${API_URL}/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Producto eliminado');
                fetchProducts();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al eliminar producto');
            }
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <h1 className="mb-xl" style={{ fontSize: '2rem', fontWeight: '700' }}>
                Panel de Vendedor
            </h1>

            {/* Tabs */}
            <div className="flex gap-md mb-xl" style={{ borderBottom: '2px solid var(--glass-border)' }}>
                <button
                    className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('orders')}
                    style={{ borderRadius: '8px 8px 0 0' }}
                >
                    📦 Órdenes
                </button>
                <button
                    className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('products')}
                    style={{ borderRadius: '8px 8px 0 0' }}
                >
                    🛍️ Productos
                </button>
            </div>

            {activeTab === 'orders' ? (
                <>
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
                            Órdenes
                        </h2>

                        {loading ? (
                            <div className="loading">
                                <div className="spinner"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                                No hay órdenes disponibles
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
                </>
            ) : (
                <>
                    {/* Products Section */}
                    <div className="glass-card mb-lg">
                        <div className="flex justify-between items-center mb-lg">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Mis Productos</h2>
                            <button className="btn btn-primary" onClick={handleAddProduct}>
                                + Agregar Producto
                            </button>
                        </div>

                        {/* Product Form Modal */}
                        {showProductForm && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                padding: 'var(--spacing-lg)'
                            }}>
                                <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                                    <h3 className="mb-lg" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                                    </h3>

                                    <form onSubmit={handleSaveProduct}>
                                        <div className="mb-md">
                                            <label className="form-label">Nombre del Producto *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-input"
                                                value={productForm.name}
                                                onChange={handleProductFormChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-md">
                                            <label className="form-label">Categoría *</label>
                                            <select
                                                name="category"
                                                className="form-input"
                                                value={productForm.category}
                                                onChange={handleProductFormChange}
                                                required
                                            >
                                                <option value="joyeria">Joyería</option>
                                                <option value="iphones">iPhones</option>
                                                <option value="telefonos">Teléfonos</option>
                                                <option value="electronica">Electrónica</option>
                                            </select>
                                        </div>

                                        <div className="mb-md">
                                            <label className="form-label">Descripción</label>
                                            <textarea
                                                name="description"
                                                className="form-input"
                                                rows="3"
                                                value={productForm.description}
                                                onChange={handleProductFormChange}
                                            />
                                        </div>

                                        <div className="mb-md">
                                            <label className="form-label">URL de la Imagen (Postimage) *</label>
                                            <input
                                                type="url"
                                                name="image_url"
                                                className="form-input"
                                                placeholder="https://i.postimg.cc/xxxxx/imagen.jpg"
                                                value={productForm.image_url}
                                                onChange={handleProductFormChange}
                                                required
                                            />
                                            <div style={{ marginTop: 'var(--spacing-xs)' }}>
                                                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block' }}>
                                                    📷 Sube tu imagen a <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>postimages.org</a> y pega el "Direct link"
                                                </small>
                                                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                                                    💡 Tip: El link debe empezar con "https://i.postimg.cc/"
                                                </small>
                                            </div>
                                            {productForm.image_url && (
                                                <div className="mt-md" style={{
                                                    padding: 'var(--spacing-sm)',
                                                    background: 'var(--glass-bg)',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--glass-border)'
                                                }}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                                        Vista previa:
                                                    </p>
                                                    <img
                                                        src={productForm.image_url}
                                                        alt="Preview"
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: '250px',
                                                            borderRadius: '8px',
                                                            objectFit: 'contain',
                                                            backgroundColor: '#000'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                    <p style={{
                                                        display: 'none',
                                                        color: 'var(--error)',
                                                        fontSize: '0.875rem',
                                                        textAlign: 'center',
                                                        padding: 'var(--spacing-md)'
                                                    }}>
                                                        ⚠️ No se pudo cargar la imagen. Verifica que el link sea correcto.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-md mb-md">
                                            <div>
                                                <label className="form-label">Precio ($) *</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    className="form-input"
                                                    step="0.01"
                                                    min="0"
                                                    value={productForm.price}
                                                    onChange={handleProductFormChange}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="form-label">Stock *</label>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    className="form-input"
                                                    min="0"
                                                    value={productForm.stock}
                                                    onChange={handleProductFormChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-md justify-end">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowProductForm(false)}
                                            >
                                                Cancelar
                                            </button>
                                            <button type="submit" className="btn btn-primary">
                                                {editingProduct ? 'Actualizar' : 'Guardar'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        <div className="grid grid-cols-3 gap-md">
                            {products.map(product => (
                                <div key={product.id} className="card fade-in">
                                    <div style={{ position: 'relative', paddingBottom: '100%', marginBottom: 'var(--spacing-md)', overflow: 'hidden', borderRadius: '8px', backgroundColor: 'var(--glass-bg)' }}>
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/300'}
                                            alt={product.name}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                                        {product.name}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                                        {product.description}
                                    </p>
                                    <div className="flex justify-between items-center mb-md">
                                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <div className="flex gap-sm">
                                        <button
                                            className="btn btn-outline btn-small"
                                            onClick={() => handleEditProduct(product)}
                                            style={{ flex: 1 }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-small"
                                            onClick={() => handleDeleteProduct(product.id)}
                                            style={{ flex: 1 }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                                No tienes productos agregados. ¡Comienza agregando tu primer producto!
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
