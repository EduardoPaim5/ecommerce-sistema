import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateCart } = useAuth();
  const navigate = useNavigate();
  
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuantityChange = async (produtoId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      handleRemoveItem(produtoId);
      return;
    }

    try {
      const updatedCart = await api.alterarQuantidade(produtoId, newQty);
      updateCart(updatedCart);
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar quantidade');
    }
  };

  const handleRemoveItem = async (produtoId: number) => {
    if (!window.confirm('Deseja remover este item do carrinho?')) return;
    try {
      const updatedCart = await api.removerItem(produtoId);
      updateCart(updatedCart);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover item');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cart || cart.itens.length === 0) {
      setError('O carrinho está vazio');
      return;
    }

    if (!cep || !logradouro || !numero || !cidade || !estado) {
      setError('Por favor, preencha todos os campos obrigatórios do endereço');
      return;
    }

    setCheckoutLoading(true);

    try {
      const enderecoEntrega = { cep, logradouro, numero, complemento, cidade, estado };
      const novoPedido = await api.finalizarCompra(enderecoEntrega);
      updateCart(null); // Clear cart state locally
      
      // Redirect to the newly created order for payment simulation!
      navigate(`/pedidos/${novoPedido.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar compra');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartTotal = cart?.itens?.reduce((acc: number, item: any) => acc + (item.precoUnitario * item.quantidade), 0) || 0;

  if (!cart || cart.itens.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <h3>Seu carrinho está vazio</h3>
        <p>Explore nosso catálogo e adicione produtos incríveis ao seu carrinho.</p>
        <Link to="/" className="btn-primary mt-4">
          Ir para o Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1>Seu Carrinho</h1>

      <div className="cart-layout">
        {/* Lista de itens */}
        <div className="cart-items-section">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="cart-items-list">
            {cart.itens.map((item: any) => (
              <div key={item.id} className="cart-item-card">
                <img
                  src={item.produto?.imagemUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                  alt={item.produto?.nome}
                  className="cart-item-img"
                />
                
                <div className="cart-item-details">
                  <h3>{item.produto?.nome}</h3>
                  <p className="item-unit-price">Preço unitário: R$ {item.precoUnitario.toFixed(2)}</p>
                  <p className="item-stock-warning">Estoque disponível: {item.produto?.quantidadeEstoque}</p>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.produto.id, item.quantidade, -1)}
                    >
                      -
                    </button>
                    <span>{item.quantidade}</span>
                    <button
                      onClick={() => handleQuantityChange(item.produto.id, item.quantidade, 1)}
                      disabled={item.quantidade >= item.produto?.quantidadeEstoque}
                    >
                      +
                    </button>
                  </div>

                  <span className="cart-item-subtotal">
                    R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleRemoveItem(item.produto.id)}
                    className="btn-delete"
                    title="Remover produto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-line">
            <span>Total da Compra</span>
            <span className="total-amount">R$ {cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Formulário de Endereço e Checkout */}
        <div className="checkout-address-section">
          <h2>Endereço de Entrega</h2>
          <p className="section-subtitle">Informe onde deseja receber seu pedido</p>

          <form onSubmit={handleCheckout} className="address-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="cep">CEP *</label>
                <input
                  type="text"
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="estado">Estado *</label>
                <input
                  type="text"
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="UF"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="logradouro">Logradouro / Rua *</label>
              <input
                type="text"
                id="logradouro"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Rua, Avenida, etc."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="numero">Número *</label>
                <input
                  type="text"
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex: 123"
                  required
                />
              </div>
              <div className="form-group flex-2">
                <label htmlFor="complemento">Complemento</label>
                <input
                  type="text"
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Ex: Apto 402"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cidade">Cidade *</label>
              <input
                type="text"
                id="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Nome da Cidade"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-block btn-checkout"
              disabled={checkoutLoading}
            >
              <ShoppingBag size={18} />
              <span>{checkoutLoading ? 'Processando pedido...' : 'Finalizar Pedido'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
