import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  papel: 'CLIENTE' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  cart: any | null;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  updateCart: (newCart: any) => void;
  refreshCart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && token && user.papel === 'CLIENTE') {
      api.obterCarrinho()
        .then(setCart)
        .catch(() => setCart(null));
    } else {
      setCart(null);
    }
  }, [user, token]);

  const login = async (email: string, senha: string) => {
    try {
      const response = await api.login({ email, senha });
      const userData: User = {
        id: response.usuarioId,
        nome: response.nome,
        email: response.email,
        papel: response.papel,
      };
      
      setUser(userData);
      setToken(response.token);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const cadastro = async (nome: string, email: string, senha: string) => {
    try {
      await api.cadastro({ nome, email, senha });
      // Log in immediately after registration
      await login(email, senha);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCart(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    api.logout().catch(() => {});
  };

  const updateCart = (newCart: any) => {
    setCart(newCart);
  };

  const refreshCart = async () => {
    if (user && token && user.papel === 'CLIENTE') {
      try {
        const c = await api.obterCarrinho();
        setCart(c);
      } catch (e) {
        setCart(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, cart, login, cadastro, logout, updateCart, refreshCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
