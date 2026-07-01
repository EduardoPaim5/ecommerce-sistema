import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogOut, LayoutDashboard, ShoppingBag, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, cart, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart?.itens?.reduce((acc: number, item: any) => acc + item.quantidade, 0) || 0;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🚀</div>
          <span>Antigravity Shop</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">Catálogo</Link>

          {user ? (
            <>
              {user.papel === 'ADMIN' ? (
                <Link to="/admin" className="navbar-link btn-admin">
                  <LayoutDashboard size={18} />
                  <span>Painel Admin</span>
                </Link>
              ) : (
                <>
                  <Link to="/pedidos" className="navbar-link">
                    <ShoppingBag size={18} />
                    <span>Meus Pedidos</span>
                  </Link>
                  
                  <Link to="/carrinho" className="navbar-link cart-badge-container">
                    <ShoppingCart size={18} />
                    <span>Carrinho</span>
                    {cartItemCount > 0 && (
                      <span className="cart-badge-count">{cartItemCount}</span>
                    )}
                  </Link>
                </>
              )}

              <div className="user-profile">
                <User size={16} />
                <span className="user-name" title={user.email}>{user.nome}</span>
              </div>

              <button onClick={handleLogout} className="btn-logout" title="Sair">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn-login-nav">Entrar</Link>
              <Link to="/cadastro" className="btn-register-nav">Criar Conta</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
