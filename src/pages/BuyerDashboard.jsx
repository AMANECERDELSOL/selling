import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BuyerDashboard() {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [loading, setLoading] = useState(true);

    // Checkout form
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/products/categories/all');
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const url = selectedCategory
                ? `/api/products?category=${selectedCategory}`
                : '/api/products';

            const response = await fetch(url);
            const data = await response.json();
            setProducts(data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setShowCart(true);
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item =>
            item.id === productId
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ).filter(item => item.quantity > 0));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        try {
            const orderItems = cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }));

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: orderItems,
                    contact_name: contactName,
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                    contact_info: contactInfo
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`¡Orden creada exitosamente! Total: $${getTotalPrice().toFixed(2)}\n\nPor favor realiza el pago y sube tu comprobante.`);
                setCart([]);
                setShowCart(false);
                setShowCheckout(false);
                // Reset form
                setContactName('');
                setContactEmail('');
                setContactPhone('');
                setContactInfo('');
            } else {
                alert(data.error || 'Error al crear la orden');
            }
        } catch (error) {
            alert('Error al procesar la orden');
        }
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            <div className="flex justify-between items-center mb-xl" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Tienda Digital</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCart(!showCart)}
                >
                    🛒 Carrito ({cart.length})
                </button>
            </div>

            {/* Categories Filter */}
            <div className="mb-lg" style={{ overflowX: 'auto' }}>
                <div className="flex gap-md" style={{ paddingBottom: 'var(--spacing-sm)' }}>
                    <button
                        className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-secondary'} btn-small`}
                        onClick={() => setSelectedCategory('')}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`btn ${selectedCategory === cat.id.toString() ? 'btn-primary' : 'btn-secondary'} btn-small`}
                            onClick={() => setSelectedCategory(cat.id.toString())}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="grid grid-cols-4 fade-in">
                    {products.map(product => (
                        <div key={product.id} className="card">
                            <div style={{
                                height: '200px',
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                🎁
                            </div>

                            <span className="badge badge-primary mb-sm">{product.category_name}</span>

                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
                                {product.name}
                            </h3>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
                                {product.description}
                            </p>

                            <div className="flex justify-between items-center">
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                    ${product.price.toFixed(2)}
                                </span>
                                <button
                                    className="btn btn-primary btn-small"
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                >
                                    {product.stock === 0 ? 'Agotado' : 'Agregar'}
                                </button>
                            </div>

                            <p className="mt-sm" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Stock: {product.stock}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Cart Sidebar/Drawer */}
            {showCart && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '400px',
                    height: '100vh',
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 1000,
                    padding: 'var(--spacing-lg)',
                    overflowY: 'auto'
                }} className="slide-in">
                    <div className="flex justify-between items-center mb-lg">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Mi Carrito</h2>
                        <button className="btn btn-secondary btn-small" onClick={() => setShowCart(false)}>
                            ✕
                        </button>
                    </div>

                    {cart.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                            Tu carrito está vacío
                        </p>
                    ) : (
                        <>
                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                {cart.map(item => (
                                    <div key={item.id} className="glass-card mb-md">
                                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
                                            {item.name}
                                        </h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                                            ${item.price.toFixed(2)} c/u
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-sm">
                                                <button
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    −
                                                </button>
                                                <span style={{ padding: '0 var(--spacing-md)', fontWeight: '600' }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ color: 'var(--error)' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card mb-lg">
                                <div className="flex justify-between items-center">
                                    <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>Total:</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                        ${getTotalPrice().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary w-full"
                                onClick={() => setShowCheckout(true)}
                            >
                                Proceder al Pago
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-md)'
                }} onClick={() => setShowCheckout(false)}>
                    <div
                        className="glass-card fade-in"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <h2 className="mb-lg" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            Finalizar Compra
                        </h2>

                        <form onSubmit={handleCheckout}>
                            <div className="form-group">
                                <label className="form-label">Nombre Completo *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Teléfono</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Información Adicional</label>
                                <textarea
                                    className="form-textarea"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    placeholder="Usuario de juego, preferencias de entrega, etc."
                                />
                            </div>

                            <div className="glass-card mb-lg">
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Total a pagar: <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                                        ${getTotalPrice().toFixed(2)}
                                    </strong>
                                </p>
                            </div>

                            <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Confirmar Orden
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCheckout(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
