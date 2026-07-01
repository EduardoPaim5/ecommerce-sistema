import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, Eye } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const { user, updateCart } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.listarCategorias(), api.listarProdutos()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ text: 'Falha ao carregar catálogo', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    api.listarProdutos({ busca: searchQuery, categoriaId: selectedCategory })
      .then(setProducts)
      .catch(() => setMessage({ text: 'Erro ao buscar produtos', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleCategorySelect = (categoryId: number | string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    api.listarProdutos({ busca: searchQuery, categoriaId: categoryId })
      .then(setProducts)
      .catch(() => setMessage({ text: 'Erro ao filtrar produtos', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleAddToCart = async (product: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.papel === 'ADMIN') {
      setMessage({ text: 'Administradores não compram produtos', type: 'error' });
      return;
    }

    setActionLoading(product.id);
    setMessage(null);

    try {
      const updatedCart = await api.adicionarItem(product.id, 1);
      updateCart(updatedCart);
      setMessage({ text: `"${product.nome}" adicionado ao carrinho!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao adicionar item', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="catalog-container">
      {/* Banner */}
      <div className="catalog-hero">
        <h1>Descubra o Futuro das Compras</h1>
        <p>Produtos selecionados com qualidade premium e entrega garantida</p>
      </div>

      {/* Filter and Search controls */}
      <div className="catalog-controls">
        <form onSubmit={handleSearch} className="search-bar-form">
          <input
            type="text"
            placeholder="Buscar produtos por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">
            <Search size={18} />
          </button>
        </form>

        <div className="category-filters">
          <button
            onClick={() => handleCategorySelect('')}
            className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum produto encontrado</h3>
          <p>Tente alterar os termos da busca ou selecionar outra categoria.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const hasStock = product.quantidadeEstoque > 0;
            return (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.imagemUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                    alt={product.nome}
                    className="product-image"
                  />
                  {!hasStock && (
                    <span className="out-of-stock-badge">Sem estoque</span>
                  )}
                  {product.categoria && (
                    <span className="product-category-badge">{product.categoria.nome}</span>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-title">{product.nome}</h3>
                  <p className="product-description">{product.descricao}</p>
                  
                  <div className="product-footer">
                    <span className="product-price">R$ {product.preco.toFixed(2)}</span>
                    <span className="product-stock">
                      {hasStock ? `${product.quantidadeEstoque} restam` : 'Indisponível'}
                    </span>
                  </div>

                  <div className="product-actions">
                    <button
                      onClick={() => navigate(`/produtos/${product.id}`)}
                      className="btn-secondary flex-1"
                    >
                      <Eye size={16} />
                      <span>Ver Detalhes</span>
                    </button>

                    {user?.papel === 'ADMIN' ? (
                      <button
                        onClick={() => navigate('/admin', { state: { tab: 'produtos', editProductId: product.id } })}
                        className="btn-admin-edit"
                      >
                        Editar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-primary flex-1"
                        disabled={!hasStock || actionLoading === product.id}
                      >
                        <ShoppingCart size={16} />
                        <span>
                          {actionLoading === product.id ? 'Adicionando...' : 'Comprar'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
