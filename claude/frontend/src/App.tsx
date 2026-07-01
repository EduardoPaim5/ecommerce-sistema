import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './auth';
import Nav from './components/Nav';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminPage from './pages/AdminPage';

function Protegido({ children, somenteAdmin }: { children: ReactNode; somenteAdmin?: boolean }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div className="container">Carregando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (somenteAdmin && usuario.papel !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/produtos/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/carrinho" element={<Protegido><CartPage /></Protegido>} />
          <Route path="/checkout" element={<Protegido><CheckoutPage /></Protegido>} />
          <Route path="/pedidos" element={<Protegido><OrdersPage /></Protegido>} />
          <Route path="/pedidos/:id" element={<Protegido><OrderDetailPage /></Protegido>} />
          <Route path="/admin" element={<Protegido somenteAdmin><AdminPage /></Protegido>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
