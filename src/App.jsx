import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function HomePage() {
    const { user } = useAuth();

    // Redirect based on role
    if (user) {
        if (user.role === 'buyer') return <Navigate to="/buyer" replace />;
        if (user.role === 'seller') return <Navigate to="/seller" replace />;
        if (user.role === 'superuser') return <Navigate to="/admin" replace />;
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <div className="glass-card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>
                    Silva-Sales
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                    Tu tienda de productos digitales
                </p>

                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-xl)', fontSize: '1.1rem' }}>
                </p>

                <div className="flex gap-md justify-center" style={{ flexWrap: 'wrap' }}>
                    <Link to="/register" className="btn btn-primary btn-large">
                        Registrarse Ahora
                    </Link>
                    <Link to="/login" className="btn btn-outline btn-large">
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/buyer"
                        element={
                            <ProtectedRoute requiredRole="buyer">
                                <BuyerDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/seller"
                        element={
                            <ProtectedRoute requiredRole="seller">
                                <SellerDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="superuser">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

