import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api } from './api';
import { Carrinho } from './types';
import { useAuth } from './auth';

interface CartContextValue {
  carrinho: Carrinho | null;
  quantidadeItens: number;
  atualizar: () => Promise<void>;
  adicionar: (produtoId: number, quantidade: number) => Promise<void>;
  alterarQuantidade: (produtoId: number, quantidade: number) => Promise<void>;
  remover: (produtoId: number) => Promise<void>;
  limparEstado: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);

  const atualizar = useCallback(async () => {
    if (!usuario || usuario.papel !== 'CLIENTE') {
      setCarrinho(null);
      return;
    }
    const c = await api.get<Carrinho>('/carrinho');
    setCarrinho(c);
  }, [usuario]);

  useEffect(() => {
    atualizar().catch(() => setCarrinho(null));
  }, [atualizar]);

  const adicionar = async (produtoId: number, quantidade: number) => {
    setCarrinho(await api.post<Carrinho>('/carrinho/itens', { produtoId, quantidade }));
  };
  const alterarQuantidade = async (produtoId: number, quantidade: number) => {
    setCarrinho(await api.put<Carrinho>(`/carrinho/itens/${produtoId}`, { quantidade }));
  };
  const remover = async (produtoId: number) => {
    setCarrinho(await api.del<Carrinho>(`/carrinho/itens/${produtoId}`));
  };
  const limparEstado = () => setCarrinho(null);

  const quantidadeItens = carrinho?.itens.reduce((acc, i) => acc + i.quantidade, 0) ?? 0;

  const value = useMemo(
    () => ({ carrinho, quantidadeItens, atualizar, adicionar, alterarQuantidade, remover, limparEstado }),
    [carrinho, quantidadeItens, atualizar],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
