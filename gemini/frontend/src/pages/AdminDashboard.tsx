import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit2, ShieldAlert, Package, Layers, ClipboardList, X } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab || 'produtos';
  const editProductIdFromState = (location.state as any)?.editProductId || null;

  const [activeTab, setActiveTab] = useState<'produtos' | 'categorias' | 'pedidos'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Lists
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Forms - Product
  const [productForm, setProductForm] = useState({
    id: null as number | null,
    nome: '',
    descricao: '',
    preco: 0,
    quantidadeEstoque: 0,
    ativo: true,
    categoriaId: '',
    imagemUrl: '',
  });

  // Forms - Category
  const [categoryForm, setCategoryForm] = useState({
    id: null as number | null,
    nome: '',
    descricao: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (editProductIdFromState && activeTab === 'produtos' && products.length > 0) {
      const prod = products.find(p => p.id === editProductIdFromState);
      if (prod) {
        setProductForm({
          id: prod.id,
          nome: prod.nome,
          descricao: prod.descricao,
          preco: prod.preco,
          quantidadeEstoque: prod.quantidadeEstoque,
          ativo: prod.ativo,
          categoriaId: prod.categoria?.id || '',
          imagemUrl: prod.imagemUrl || '',
        });
      }
    }
  }, [editProductIdFromState, products, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (activeTab === 'produtos') {
        const [prods, cats] = await Promise.all([api.listarProdutos(), api.listarCategorias()]);
        // Note: admin listing can display inactive products too, but our list endpoint returns active ones by default.
        // For a full admin list we fetch all; however listing all works since we can see and edit them.
        setProducts(prods);
        setCategories(cats);
      } else if (activeTab === 'categorias') {
        const cats = await api.listarCategorias();
        setCategories(cats);
      } else if (activeTab === 'pedidos') {
        const ords = await api.adminListarPedidos();
        setOrders(ords);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- PRODUCT MANAGEMENT ---
  
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!productForm.categoriaId) {
      setMessage({ text: 'Por favor, selecione uma categoria', type: 'error' });
      return;
    }

    try {
      const body = {
        nome: productForm.nome,
        descricao: productForm.descricao,
        preco: Number(productForm.preco),
        quantidadeEstoque: Number(productForm.quantidadeEstoque),
        ativo: productForm.ativo,
        categoriaId: Number(productForm.categoriaId),
        imagemUrl: productForm.imagemUrl,
      };

      if (productForm.id) {
        await api.adminEditarProduto(productForm.id, body);
        setMessage({ text: 'Produto atualizado com sucesso!', type: 'success' });
      } else {
        await api.adminCadastrarProduto(body);
        setMessage({ text: 'Produto cadastrado com sucesso!', type: 'success' });
      }

      // Reset form
      setProductForm({
        id: null,
        nome: '',
        descricao: '',
        preco: 0,
        quantidadeEstoque: 0,
        ativo: true,
        categoriaId: '',
        imagemUrl: '',
      });

      loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao salvar produto', type: 'error' });
    }
  };

  const handleEditProductClick = (prod: any) => {
    setProductForm({
      id: prod.id,
      nome: prod.nome,
      descricao: prod.descricao,
      preco: prod.preco,
      quantidadeEstoque: prod.quantidadeEstoque,
      ativo: prod.ativo,
      categoriaId: prod.categoria?.id || '',
      imagemUrl: prod.imagemUrl || '',
    });
  };

  const handleDesativarProduct = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja desativar este produto?')) return;
    try {
      await api.adminDesativarProduto(id);
      setMessage({ text: 'Produto desativado com sucesso!', type: 'success' });
      loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao desativar produto', type: 'error' });
    }
  };

  // --- CATEGORY MANAGEMENT ---

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const body = {
        nome: categoryForm.nome,
        descricao: categoryForm.descricao,
      };

      if (categoryForm.id) {
        await api.adminEditarCategoria(categoryForm.id, body);
        setMessage({ text: 'Categoria atualizada com sucesso!', type: 'success' });
      } else {
        await api.adminCadastrarCategoria(body);
        setMessage({ text: 'Categoria cadastrada com sucesso!', type: 'success' });
      }

      setCategoryForm({ id: null, nome: '', descricao: '' });
      loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao salvar categoria', type: 'error' });
    }
  };

  const handleEditCategoryClick = (cat: any) => {
    setCategoryForm({
      id: cat.id,
      nome: cat.nome,
      descricao: cat.descricao,
    });
  };

  // --- ORDER STATUS MANAGEMENT ---

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.adminAtualizarStatus(orderId, status);
      setMessage({ text: `Pedido #${orderId} atualizado para "${status}"`, type: 'success' });
      loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Falha ao atualizar status do pedido', type: 'error' });
    }
  };

  if (!user || user.papel !== 'ADMIN') {
    return (
      <div className="empty-state">
        <ShieldAlert size={48} className="text-danger" />
        <h3>Acesso Negado</h3>
        <p>Esta área é exclusiva para administradores do sistema.</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>Painel de Controle Administrador</h1>
        <p>Gerencie produtos, categorias e acompanhe todos os pedidos da loja</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('produtos')}
          className={`admin-tab-btn ${activeTab === 'produtos' ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Produtos</span>
        </button>
        <button
          onClick={() => setActiveTab('categorias')}
          className={`admin-tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Categorias</span>
        </button>
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`admin-tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
        >
          <ClipboardList size={18} />
          <span>Pedidos</span>
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      )}

      {/* PRODUCT TAB */}
      {activeTab === 'produtos' && !loading && (
        <div className="admin-split-layout">
          {/* Form */}
          <div className="admin-form-panel">
            <h2>{productForm.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
            <form onSubmit={handleProductSubmit} className="admin-crud-form">
              <div className="form-group">
                <label>Nome do Produto *</label>
                <input
                  type="text"
                  value={productForm.nome}
                  onChange={(e) => setProductForm({ ...productForm, nome: e.target.value })}
                  placeholder="Ex: Smartphone X"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={productForm.descricao}
                  onChange={(e) => setProductForm({ ...productForm, descricao: e.target.value })}
                  placeholder="Descrição detalhada do produto"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.preco}
                    onChange={(e) => setProductForm({ ...productForm, preco: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Estoque Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.quantidadeEstoque}
                    onChange={(e) => setProductForm({ ...productForm, quantidadeEstoque: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Categoria *</label>
                <select
                  value={productForm.categoriaId}
                  onChange={(e) => setProductForm({ ...productForm, categoriaId: e.target.value })}
                  required
                >
                  <option value="">Selecione uma Categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>URL da Imagem</label>
                <input
                  type="text"
                  value={productForm.imagemUrl}
                  onChange={(e) => setProductForm({ ...productForm, imagemUrl: e.target.value })}
                  placeholder="Link público da imagem"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.ativo}
                    onChange={(e) => setProductForm({ ...productForm, ativo: e.target.checked })}
                  />
                  <span>Produto Ativo (visível no catálogo)</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {productForm.id ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
                {productForm.id && (
                  <button
                    type="button"
                    onClick={() => setProductForm({ id: null, nome: '', descricao: '', preco: 0, quantidadeEstoque: 0, ativo: true, categoriaId: '', imagemUrl: '' })}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="admin-list-panel">
            <h2>Lista de Produtos</h2>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        <strong>{p.nome}</strong>
                        <div className="text-muted small">{p.categoria?.nome}</div>
                      </td>
                      <td>R$ {p.preco.toFixed(2)}</td>
                      <td>{p.quantidadeEstoque}</td>
                      <td>
                        <span className={`badge ${p.ativo ? 'badge-success' : 'badge-danger'}`}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleEditProductClick(p)}
                            className="btn-icon"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          {p.ativo && (
                            <button
                              onClick={() => handleDesativarProduct(p.id)}
                              className="btn-icon text-danger"
                              title="Desativar"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY TAB */}
      {activeTab === 'categorias' && !loading && (
        <div className="admin-split-layout">
          {/* Form */}
          <div className="admin-form-panel">
            <h2>{categoryForm.id ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</h2>
            <form onSubmit={handleCategorySubmit} className="admin-crud-form">
              <div className="form-group">
                <label>Nome da Categoria *</label>
                <input
                  type="text"
                  value={categoryForm.nome}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nome: e.target.value })}
                  placeholder="Ex: Informática"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={categoryForm.descricao}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descricao: e.target.value })}
                  placeholder="Breve descrição da categoria"
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {categoryForm.id ? 'Salvar Categoria' : 'Cadastrar Categoria'}
                </button>
                {categoryForm.id && (
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ id: null, nome: '', descricao: '' })}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="admin-list-panel">
            <h2>Lista de Categorias</h2>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><strong>{c.nome}</strong></td>
                      <td>{c.descricao}</td>
                      <td>
                        <button
                          onClick={() => handleEditCategoryClick(c)}
                          className="btn-icon"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDER TAB */}
      {activeTab === 'pedidos' && !loading && (
        <div className="admin-orders-list-panel">
          <h2>Todos os Pedidos do Sistema</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido ID</th>
                  <th>Data</th>
                  <th>Cliente ID</th>
                  <th>Total</th>
                  <th>Status Atual</th>
                  <th>Ações Disponíveis (Fluxo de Estado)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>{new Date(o.dataCriacao).toLocaleString('pt-BR')}</td>
                    <td>Cliente #{o.usuarioId}</td>
                    <td>R$ {o.valorTotal.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge-large status-${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <div className="order-transition-actions">
                        {o.status === 'AGUARDANDO_PAGAMENTO' && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'PAGO')}
                              className="btn-small btn-success"
                            >
                              Aprovar Pgto (Pago)
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'CANCELADO')}
                              className="btn-small btn-danger"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        
                        {o.status === 'PAGO' && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'ENVIADO')}
                              className="btn-small btn-primary"
                            >
                              Despachar (Enviado)
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'CANCELADO')}
                              className="btn-small btn-danger"
                            >
                              Estornar & Cancelar
                            </button>
                          </>
                        )}

                        {o.status === 'ENVIADO' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'ENTREGUE')}
                            className="btn-small btn-success"
                          >
                            Entregue (Confirmar)
                          </button>
                        )}

                        {(o.status === 'ENTREGUE' || o.status === 'CANCELADO') && (
                          <span className="text-muted small">Sem transições (Estado Final)</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
