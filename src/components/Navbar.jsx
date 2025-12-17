import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-brand">
                    Silva-Sales
                </Link>

                <button className="navbar-toggle" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <li>
                                <span className="navbar-link">
                                    {user.email}
                                </span>
                            </li>
                            <li>
                                <span className="badge badge-primary">{user.role}</span>
                            </li>
                            <li>
                                <button onClick={logout} className="btn btn-secondary btn-small">
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login" className="navbar-link">
                                    Iniciar Sesión
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="btn btn-primary btn-small">
                                    Registrarse
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};
