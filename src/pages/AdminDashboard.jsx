import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, sellers
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Product form
    const [showProductForm, setShowProductForm] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock: '', category_id: '', image_url: ''
    });

    // Seller form
    const [showSellerForm, setShowSellerForm] = useState(false);
    const [editingSeller, setEditingSeller] = useState(null);
    const [sellerForm, setSellerForm] = useState({
        username: '', email: '', password: '', binance_wallet: '', earnings: '0'
    });

    useEffect(() => {
        if (activeTab === 'analytics') fetchAnalytics();
        else if (activeTab === 'products') { fetchProducts(); fetchCategories(); }
        else if (activeTab === 'sellers') fetchSellers();
        else if (activeTab === 'orders') fetchPendingOrders();
    }, [activeTab]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const data = await response.json();
            setProducts(data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products/categories/all`);
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/sellers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSellers(data.sellers);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            // Filter only pending orders
            const pending = data.orders.filter(order => order.status === 'pending');
            setPendingOrders(pending);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productForm)
            });

            if (response.ok) {
                alert('Producto creado exitosamente');
                setShowProductForm(false);
                setProductForm({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
                fetchProducts();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al crear producto');
            }
        } catch (error) {
            alert('Error al crear producto');
        }
    };

    const handleCreateSeller = async (e) => {
        e.preventDefault();
        try {
            const url = editingSeller 
                ? `${API_URL}/api/admin/sellers/${editingSeller.id}`
                : `${API_URL}/api/admin/sellers`;
            
            const method = editingSeller ? 'PUT' : 'POST';
            
            const payload = {
                username: sellerForm.username,
                email: sellerForm.email,
                binance_wallet: sellerForm.binance_wallet
            };
            
            // Solo enviar password si tiene valor
            if (sellerForm.password) {
                payload.password = sellerForm.password;
            }
            
            // Si es edición, enviar las ganancias
            if (editingSeller) {
                payload.earnings = parseFloat(sellerForm.earnings) || 0;
            }
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(editingSeller ? 'Vendedor actualizado exitosamente' : 'Vendedor creado exitosamente');
                setShowSellerForm(false);
                setEditingSeller(null);
                setSellerForm({ username: '', email: '', password: '', binance_wallet: '', earnings: '0' });
                fetchSellers();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al guardar vendedor');
            }
        } catch (error) {
            alert('Error al guardar vendedor');
        }
    };

    const handleEditSeller = (seller) => {
        setEditingSeller(seller);
        setSellerForm({
            username: seller.username || '',
            email: seller.email,
            password: '',
            binance_wallet: seller.binance_wallet || '',
            earnings: seller.earnings?.toString() || '0'
        });
        setShowSellerForm(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Producto eliminado exitosamente');
                fetchProducts();
            } else {
                alert('Error al eliminar producto');
            }
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <h1 className="mb-xl" style={{ fontSize: '2rem', fontWeight: '700' }}>
                Panel de Administración
            </h1>

            {/* Tabs */}
            <div className="mb-lg" style={{ overflowX: 'auto' }}>
                <div className="flex gap-md" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--spacing-sm)' }}>
                    <button
                        className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'} btn-small`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        📊 Analíticas
                    </button>
                    <button
                        className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'} btn-small`}
                        onClick={() => setActiveTab('orders')}
                    >
                        ⏳ Ventas Pendientes
                    </button>
                    <button
                        className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'} btn-small`}
                        onClick={() => setActiveTab('products')}
                    >
                        📦 Productos
                    </button>
                    <button
                        className={`btn ${activeTab === 'sellers' ? 'btn-primary' : 'btn-secondary'} btn-small`}
                        onClick={() => setActiveTab('sellers')}
                    >
                        👥 Vendedores
                    </button>
                </div>
            </div>

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="fade-in">
                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : analytics && (
                        <>
                            <div className="grid grid-cols-4 mb-xl">
                                <div className="glass-card">
                                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>👤</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                                        {analytics.users?.find(u => u.role === 'buyer')?.count || 0}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Compradores</div>
                                </div>

                                <div className="glass-card">
                                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🛒</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                                        {analytics.orders?.total_orders || 0}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Órdenes Totales</div>
                                </div>

                                <div className="glass-card">
                                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>💰</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
                                        ${analytics.orders?.total_revenue?.toFixed(2) || '0.00'}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ingresos Totales</div>
                                </div>

                                <div className="glass-card">
                                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📦</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                                        {analytics.products?.total_products || 0}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Productos Activos</div>
                                </div>
                            </div>

                            <div className="glass-card">
                                <h2 className="mb-md" style={{ fontSize: '1.25rem', fontWeight: '700' }}>Top Vendedores</h2>
                                {analytics.top_sellers?.map((seller, idx) => (
                                    <div key={idx} className="flex justify-between items-center mb-sm" style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--glass-border)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{seller.email}</span>
                                        <div className="flex gap-md">
                                            <span className="badge badge-primary">{seller.completed_orders} órdenes</span>
                                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>${seller.earnings.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-lg">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Gestión de Productos</h2>
                        <button className="btn btn-primary" onClick={() => setShowProductForm(true)}>
                            + Nuevo Producto
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 gap-md">
                            {products.map(product => (
                                <div key={product.id} className="card">
                                    <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
                                        {product.image_url && (
                                            <img src={product.image_url} alt={product.name}
                                                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.postimg.cc/m2v6mXmX/placeholder.png'; }}
                                            />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{product.name}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{product.category_name}</p>
                                        </div>
                                        <div className="flex gap-sm items-center">
                                            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                ${product.price.toFixed(2)}
                                            </span>
                                            <span className="badge badge-info">Stock: {product.stock}</span>
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => handleDeleteProduct(product.id)}
                                                style={{ color: 'var(--error)' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Product Form Modal */}
                    {showProductForm && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)', zIndex: 2000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 'var(--spacing-md)'
                        }} onClick={() => setShowProductForm(false)}>
                            <div className="glass-card fade-in" onClick={(e) => e.stopPropagation()}
                                style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                                <h2 className="mb-lg" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Nuevo Producto</h2>
                                <form onSubmit={handleCreateProduct}>
                                    <div className="form-group">
                                        <label className="form-label">Nombre *</label>
                                        <input type="text" className="form-input" required
                                            value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Descripción</label>
                                        <textarea className="form-textarea"
                                            value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Precio *</label>
                                        <input type="number" step="0.01" className="form-input" required
                                            value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input type="number" className="form-input"
                                            value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">URL de Imagen (Postimage) *</label>
                                        <input type="url" className="form-input" required
                                            placeholder="https://i.postimg.cc/xxxxx/imagen.jpg"
                                            value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} />
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
                                                <img src={productForm.image_url} alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '200px',
                                                        borderRadius: '8px',
                                                        objectFit: 'contain',
                                                        backgroundColor: '#000'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }} />
                                                <p style={{
                                                    display: 'none',
                                                    color: 'var(--error)',
                                                    fontSize: '0.875rem',
                                                    textAlign: 'center',
                                                    padding: 'var(--spacing-sm)'
                                                }}>
                                                    ⚠️ No se pudo cargar la imagen. Verifica el link.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Categoría *</label>
                                        <select className="form-select" required
                                            value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}>
                                            <option value="">Seleccionar categoría</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-md">
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Crear Producto</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sellers Tab */}
            {activeTab === 'sellers' && (
                <div className="fade-in">
                    <div className="flex justify-between items-center mb-lg">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Gestión de Vendedores</h2>
                        <button className="btn btn-primary" onClick={() => setShowSellerForm(true)}>
                            + Nuevo Vendedor
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : (
                        <div className="grid grid-cols-2 gap-md">
                            {sellers.map(seller => (
                                <div key={seller.id} className="card">
                                    <div className="flex justify-between items-center mb-sm">
                                        <div>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                                                {seller.username || 'Sin nombre'}
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {seller.email}
                                            </p>
                                        </div>
                                        <span className={`badge ${seller.is_active ? 'badge-success' : 'badge-error'}`}>
                                            {seller.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="glass-card mb-md" style={{ padding: 'var(--spacing-sm)' }}>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <div>Ganancias: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>${seller.earnings?.toFixed(2) || '0.00'}</strong></div>
                                            <div>Órdenes: <strong>{seller.order_count || 0}</strong></div>
                                            <div>Ventas: <strong>${seller.total_sales?.toFixed(2) || '0.00'}</strong></div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline btn-small w-full"
                                        onClick={() => handleEditSeller(seller)}
                                    >
                                        ✏️ Editar Vendedor
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Seller Form Modal */}
                    {showSellerForm && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)', zIndex: 2000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 'var(--spacing-md)'
                        }} onClick={() => { setShowSellerForm(false); setEditingSeller(null); }}>
                            <div className="glass-card fade-in" onClick={(e) => e.stopPropagation()}
                                style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                                <h2 className="mb-lg" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                    {editingSeller ? 'Editar Vendedor' : 'Nuevo Vendedor'}
                                </h2>
                                <form onSubmit={handleCreateSeller}>
                                    <div className="form-group">
                                        <label className="form-label">Nombre de Usuario *</label>
                                        <input type="text" className="form-input" required
                                            placeholder="Ej: vendedor_juan"
                                            value={sellerForm.username} onChange={(e) => setSellerForm({ ...sellerForm, username: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email *</label>
                                        <input type="email" className="form-input" required
                                            value={sellerForm.email} onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{editingSeller ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}</label>
                                        <input type="password" className="form-input" required={!editingSeller}
                                            value={sellerForm.password} onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })} />
                                    </div>
                                    {editingSeller && (
                                        <div className="form-group">
                                            <label className="form-label">Ganancias ($)</label>
                                            <input type="number" step="0.01" className="form-input"
                                                value={sellerForm.earnings} onChange={(e) => setSellerForm({ ...sellerForm, earnings: e.target.value })} />
                                            <small style={{ color: 'var(--text-muted)' }}>Modifica las ganancias del vendedor</small>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">Wallet Binance</label>
                                        <input type="text" className="form-input"
                                            value={sellerForm.binance_wallet} onChange={(e) => setSellerForm({ ...sellerForm, binance_wallet: e.target.value })} />
                                    </div>
                                    <div className="flex gap-md">
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                            {editingSeller ? 'Actualizar Vendedor' : 'Crear Vendedor'}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => { setShowSellerForm(false); setEditingSeller(null); }}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
