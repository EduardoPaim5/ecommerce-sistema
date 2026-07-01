import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { user, updateCart } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.obterProduto(id)
        .then(setProduct)
        .catch(() => setMessage({ text: 'Produto não encontrado', type: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.papel === 'ADMIN') {
      setMessage({ text: 'Administradores não compram produtos', type: 'error' });
      return;
    }
    if (!product) return;

    if (quantidade > product.quantidadeEstoque) {
      setMessage({ text: `Quantidade indisponível. Estoque atual: ${product.quantidadeEstoque}`, type: 'error' });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      const updatedCart = await api.adicionarItem(product.id, quantidade);
      updateCart(updatedCart);
      setMessage({ text: `Adicionado ${quantidade}x "${product.nome}" ao carrinho!`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao adicionar item', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state">
        <h3>Produto não encontrado</h3>
        <p>O produto solicitado não existe ou foi removido.</p>
        <Link to="/" className="btn-primary mt-4">
          <ArrowLeft size={16} /> Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const hasStock = product.quantidadeEstoque > 0;

  return (
    <div className="product-detail-container">
      <Link to="/" className="btn-back">
        <ArrowLeft size={16} />
        <span>Voltar ao Catálogo</span>
      </Link>

      <div className="product-detail-layout">
        {/* Imagem */}
        <div className="product-detail-image-box">
          <img
            src={product.imagemUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
            alt={product.nome}
            className="product-detail-image"
          />
        </div>

        {/* Informações */}
        <div className="product-detail-info-box">
          {product.categoria && (
            <span className="product-detail-category">{product.categoria.nome}</span>
          )}
          <h1 className="product-detail-title">{product.nome}</h1>
          
          <div className="product-detail-price-row">
            <span className="product-detail-price">R$ {product.preco.toFixed(2)}</span>
            <span className={`product-detail-stock-status ${hasStock ? 'text-success' : 'text-danger'}`}>
              {hasStock ? `Disponível (${product.quantidadeEstoque} em estoque)` : 'Indisponível no momento'}
            </span>
          </div>

          <p className="product-detail-description">{product.descricao}</p>

          {message && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
              {message.text}
            </div>
          )}

          {user?.papel === 'ADMIN' ? (
            <div className="admin-detail-banner">
              <p>Modo de visualização do Administrador</p>
              <button
                onClick={() => navigate('/admin', { state: { tab: 'produtos', editProductId: product.id } })}
                className="btn-admin-edit"
              >
                Editar este Produto
              </button>
            </div>
          ) : (
            <div className="product-detail-buy-card">
              {hasStock ? (
                <>
                  <div className="quantity-selector-container">
                    <label>Quantidade:</label>
                    <div className="quantity-controls">
                      <button
                        onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                        disabled={quantidade <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.quantidadeEstoque}
                        value={quantidade}
                        onChange={(e) => setQuantidade(Math.max(1, Math.min(product.quantidadeEstoque, parseInt(e.target.value) || 1)))}
                      />
                      <button
                        onClick={() => setQuantidade(Math.min(product.quantidadeEstoque, quantidade + 1))}
                        disabled={quantidade >= product.quantidadeEstoque}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="btn-primary btn-block btn-buy"
                    disabled={actionLoading}
                  >
                    <ShoppingCart size={18} />
                    <span>{actionLoading ? 'Adicionando...' : 'Adicionar ao Carrinho'}</span>
                  </button>
                </>
              ) : (
                <button className="btn-secondary btn-block" disabled>
                  Esgotado
                </button>
              )}
            </div>
          )}

          {/* Garantias */}
          <div className="product-benefits">
            <div className="benefit-item">
              <ShieldCheck size={20} />
              <div>
                <h4>Compra 100% Segura</h4>
                <p>Garantia de segurança e simulação de pagamento protegida.</p>
              </div>
            </div>
            <div className="benefit-item">
              <Truck size={20} />
              <div>
                <h4>Entrega Rápida</h4>
                <p>Envio imediato após a confirmação do pagamento.</p>
              </div>
            </div>
            <div className="benefit-item">
              <RefreshCw size={20} />
              <div>
                <h4>Estorno de Estoque</h4>
                <p>Caso o pedido seja cancelado antes do envio.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
