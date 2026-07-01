import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, getToken, setToken } from './api';
import { Sessao } from './types';

interface UsuarioLogado {
  usuarioId: number;
  nome: string;
  email: string;
  papel: 'CLIENTE' | 'ADMIN';
}

interface AuthContextValue {
  usuario: UsuarioLogado | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const STORAGE = 'ecommerce.usuario';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = getToken();
    const salvo = localStorage.getItem(STORAGE);
    if (token && salvo) {
      setUsuario(JSON.parse(salvo));
    }
    setCarregando(false);
  }, []);

  function persistir(s: Sessao) {
    setToken(s.token);
    const u: UsuarioLogado = {
      usuarioId: s.usuarioId,
      nome: s.nome,
      email: s.email,
      papel: s.papel,
    };
    localStorage.setItem(STORAGE, JSON.stringify(u));
    setUsuario(u);
  }

  async function login(email: string, senha: string) {
    const s = await api.post<Sessao>('/auth/login', { email, senha });
    persistir(s);
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    await api.post('/auth/cadastro', { nome, email, senha });
    await login(email, senha);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(STORAGE);
    setUsuario(null);
  }

  const value = useMemo(
    () => ({ usuario, carregando, login, cadastrar, logout }),
    [usuario, carregando],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
