import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [binanceWallet, setBinanceWallet] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (user) {
        navigate('/buyer');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await register(email, password, binanceWallet);
            navigate('/buyer');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: 'var(--spacing-2xl)' }}>
            <div className="glass-card fade-in">
                <h1 className="text-center mb-md" style={{ fontSize: '2rem', fontWeight: '700' }}>
                    Registro de Comprador
                </h1>

                <p className="text-center mb-lg" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Crea tu cuenta para comprar productos digitales
                </p>

                {error && (
                    <div className="badge badge-error w-full mb-md" style={{ padding: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Repite tu contraseña"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Wallet Binance (Opcional)
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={binanceWallet}
                            onChange={(e) => setBinanceWallet(e.target.value)}
                            placeholder="Tu dirección de wallet Binance"
                        />
                        <p className="form-error" style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                            Puedes agregarlo después
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-lg"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="text-center mt-lg">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>

            <div className="glass-card mt-lg">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <strong>Nota:</strong> Solo los compradores pueden auto-registrarse.
                    Los vendedores son creados por el administrador del sistema.
                </p>
            </div>
        </div>
    );
}
