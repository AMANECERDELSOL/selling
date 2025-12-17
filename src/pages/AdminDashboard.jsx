import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, sellers
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Product form
    const [showProductForm, setShowProductForm] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock: '', category_id: '', image_url: ''
    });

    // Seller form
    const [showSellerForm, setShowSellerForm] = useState(false);
    const [sellerForm, setSellerForm] = useState({
        email: '', password: '', binance_wallet: ''
    });

    useEffect(() => {
        if (activeTab === 'analytics') fetchAnalytics();
        else if (activeTab === 'products') { fetchProducts(); fetchCategories(); }
        else if (activeTab === 'sellers') fetchSellers();
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
            const response = await fetch(`${API_URL}/api/admin/sellers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sellerForm)
            });

            if (response.ok) {
                alert('Vendedor creado exitosamente');
                setShowSellerForm(false);
                setSellerForm({ email: '', password: '', binance_wallet: '' });
                fetchSellers();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al crear vendedor');
            }
        } catch (error) {
            alert('Error al crear vendedor');
        }
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
                                    <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                        <div>
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
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
                                        {seller.email}
                                    </h3>
                                    <div className="glass-card mb-md" style={{ padding: 'var(--spacing-sm)' }}>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <div>Ganancias: <strong style={{ color: 'var(--primary)' }}>${seller.earnings.toFixed(2)}</strong></div>
                                            <div>Órdenes: <strong>{seller.order_count}</strong></div>
                                            <div>Ventas: <strong>${seller.total_sales.toFixed(2)}</strong></div>
                                        </div>
                                    </div>
                                    <span className={`badge ${seller.is_active ? 'badge-success' : 'badge-error'}`}>
                                        {seller.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
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
                        }} onClick={() => setShowSellerForm(false)}>
                            <div className="glass-card fade-in" onClick={(e) => e.stopPropagation()}
                                style={{ width: '100%', maxWidth: '500px' }}>
                                <h2 className="mb-lg" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Nuevo Vendedor</h2>
                                <form onSubmit={handleCreateSeller}>
                                    <div className="form-group">
                                        <label className="form-label">Email *</label>
                                        <input type="email" className="form-input" required
                                            value={sellerForm.email} onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Contraseña *</label>
                                        <input type="password" className="form-input" required
                                            value={sellerForm.password} onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Wallet Binance</label>
                                        <input type="text" className="form-input"
                                            value={sellerForm.binance_wallet} onChange={(e) => setSellerForm({ ...sellerForm, binance_wallet: e.target.value })} />
                                    </div>
                                    <div className="flex gap-md">
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Crear Vendedor</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowSellerForm(false)}>Cancelar</button>
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
