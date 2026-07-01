import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route for Cliente
const ClienteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user || user.papel !== 'CLIENTE') return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Protected Route for Admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user || user.papel !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/produtos/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          
          {/* Cliente only */}
          <Route path="/carrinho" element={
            <ClienteRoute>
              <Cart />
            </ClienteRoute>
          } />
          <Route path="/pedidos" element={
            <ClienteRoute>
              <Orders />
            </ClienteRoute>
          } />
          <Route path="/pedidos/:id" element={
            <ClienteRoute>
              <Orders />
            </ClienteRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Antigravity Store - Gerado via Metamodelo MDE</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
