import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useCart } from '../cart';

export default function Nav() {
  const { usuario, logout } = useAuth();
  const { quantidadeItens, limparEstado } = useCart();
  const navigate = useNavigate();

  function sair() {
    limparEstado();
    logout();
    navigate('/');
  }

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="brand">🛒 Loja Virtual</Link>
        <nav className="nav-links">
          <Link to="/">Catálogo</Link>
          {usuario?.papel === 'CLIENTE' && (
            <>
              <Link to="/carrinho">
                Carrinho{quantidadeItens > 0 && <span className="badge">{quantidadeItens}</span>}
              </Link>
              <Link to="/pedidos">Meus pedidos</Link>
            </>
          )}
          {usuario?.papel === 'ADMIN' && <Link to="/admin">Administração</Link>}
          {usuario ? (
            <>
              <span className="nav-user">Olá, {usuario.nome.split(' ')[0]}</span>
              <button className="link-button" onClick={sair}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/cadastro" className="btn-primary btn-sm">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
