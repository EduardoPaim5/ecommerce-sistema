import { useEffect, useState } from 'react';
import { api, formatarData, formatarMoeda, rotuloStatus } from '../api';
import { Categoria, Pedido, Produto } from '../types';

type Aba = 'produtos' | 'categorias' | 'pedidos';

export default function AdminPage() {
  const [aba, setAba] = useState<Aba>('produtos');
  return (
    <div>
      <h1>Administração</h1>
      <div className="abas">
        <button className={aba === 'produtos' ? 'ativa' : ''} onClick={() => setAba('produtos')}>Produtos</button>
        <button className={aba === 'categorias' ? 'ativa' : ''} onClick={() => setAba('categorias')}>Categorias</button>
        <button className={aba === 'pedidos' ? 'ativa' : ''} onClick={() => setAba('pedidos')}>Pedidos</button>
      </div>
      {aba === 'produtos' && <AdminProdutos />}
      {aba === 'categorias' && <AdminCategorias />}
      {aba === 'pedidos' && <AdminPedidos />}
    </div>
  );
}

const PRODUTO_VAZIO = {
  nome: '', descricao: '', preco: '', imagemUrl: '', quantidadeEstoque: '', categoriaId: '', ativo: true,
};

function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<any>(PRODUTO_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setProdutos(await api.get<Produto[]>('/admin/produtos'));
    setCategorias(await api.get<Categoria[]>('/admin/categorias'));
  }
  useEffect(() => { carregar().catch((e) => setErro((e as Error).message)); }, []);

  function editar(p: Produto) {
    setEditandoId(p.id);
    setForm({
      nome: p.nome, descricao: p.descricao ?? '', preco: String(p.preco),
      imagemUrl: p.imagemUrl ?? '', quantidadeEstoque: String(p.quantidadeEstoque),
      categoriaId: String(p.categoria.id), ativo: p.ativo,
    });
  }
  function limpar() { setEditandoId(null); setForm(PRODUTO_VAZIO); }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const body = {
      nome: form.nome,
      descricao: form.descricao,
      preco: Number(form.preco),
      imagemUrl: form.imagemUrl,
      quantidadeEstoque: Number(form.quantidadeEstoque),
      categoriaId: Number(form.categoriaId),
      ativo: form.ativo,
    };
    try {
      if (editandoId) await api.put(`/admin/produtos/${editandoId}`, body);
      else await api.post('/admin/produtos', body);
      limpar();
      await carregar();
    } catch (err) { setErro((err as Error).message); }
  }

  async function desativar(id: number) {
    if (!confirm('Desativar este produto?')) return;
    await api.del(`/admin/produtos/${id}`);
    await carregar();
  }

  return (
    <div>
      <form className="form-card largo" onSubmit={salvar}>
        <h2>{editandoId ? `Editar produto #${editandoId}` : 'Novo produto'}</h2>
        <div className="form-grid">
          <label>Nome<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></label>
          <label>Preço<input type="number" step="0.01" min="0" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} required /></label>
          <label>Estoque<input type="number" min="0" value={form.quantidadeEstoque} onChange={(e) => setForm({ ...form, quantidadeEstoque: e.target.value })} required /></label>
          <label>Categoria
            <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} required>
              <option value="">Selecione...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label>Imagem (URL)<input value={form.imagemUrl} onChange={(e) => setForm({ ...form, imagemUrl: e.target.value })} /></label>
          <label className="checkbox">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo
          </label>
        </div>
        <label>Descrição<textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
        {erro && <div className="erro">{erro}</div>}
        <div className="acoes">
          <button className="btn-primary" type="submit">{editandoId ? 'Salvar' : 'Cadastrar'}</button>
          {editandoId && <button type="button" className="btn-secondary" onClick={limpar}>Cancelar</button>}
        </div>
      </form>

      <table className="tabela">
        <thead><tr><th>#</th><th>Nome</th><th>Preço</th><th>Estoque</th><th>Categoria</th><th>Ativo</th><th></th></tr></thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.nome}</td><td>{formatarMoeda(p.preco)}</td>
              <td>{p.quantidadeEstoque}</td><td>{p.categoria.nome}</td>
              <td>{p.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button className="link-button" onClick={() => editar(p)}>Editar</button>
                {p.ativo && <button className="link-button danger" onClick={() => desativar(p.id)}>Desativar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() { setCategorias(await api.get<Categoria[]>('/admin/categorias')); }
  useEffect(() => { carregar().catch((e) => setErro((e as Error).message)); }, []);

  function limpar() { setEditandoId(null); setForm({ nome: '', descricao: '' }); }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      if (editandoId) await api.put(`/admin/categorias/${editandoId}`, form);
      else await api.post('/admin/categorias', form);
      limpar();
      await carregar();
    } catch (err) { setErro((err as Error).message); }
  }

  return (
    <div>
      <form className="form-card" onSubmit={salvar}>
        <h2>{editandoId ? `Editar categoria #${editandoId}` : 'Nova categoria'}</h2>
        <label>Nome<input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></label>
        <label>Descrição<input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
        {erro && <div className="erro">{erro}</div>}
        <div className="acoes">
          <button className="btn-primary" type="submit">{editandoId ? 'Salvar' : 'Cadastrar'}</button>
          {editandoId && <button type="button" className="btn-secondary" onClick={limpar}>Cancelar</button>}
        </div>
      </form>
      <table className="tabela">
        <thead><tr><th>#</th><th>Nome</th><th>Descrição</th><th></th></tr></thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td><td>{c.nome}</td><td>{c.descricao}</td>
              <td><button className="link-button" onClick={() => { setEditandoId(c.id); setForm({ nome: c.nome, descricao: c.descricao ?? '' }); }}>Editar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() { setPedidos(await api.get<Pedido[]>('/admin/pedidos')); }
  useEffect(() => { carregar().catch((e) => setErro((e as Error).message)); }, []);

  async function atualizar(id: number, status: string) {
    setErro(null);
    try {
      await api.patch(`/admin/pedidos/${id}/status`, { status });
      await carregar();
    } catch (err) { setErro((err as Error).message); }
  }

  // Acoes permitidas conforme a maquina de estados do pedido.
  function acoes(p: Pedido) {
    const botoes: { rotulo: string; status: string; danger?: boolean }[] = [];
    if (p.status === 'PAGO') botoes.push({ rotulo: 'Marcar enviado', status: 'ENVIADO' });
    if (p.status === 'ENVIADO') botoes.push({ rotulo: 'Confirmar entrega', status: 'ENTREGUE' });
    if (p.status === 'AGUARDANDO_PAGAMENTO' || p.status === 'PAGO') {
      botoes.push({ rotulo: 'Cancelar', status: 'CANCELADO', danger: true });
    }
    return botoes;
  }

  return (
    <div>
      {erro && <div className="erro">{erro}</div>}
      <table className="tabela">
        <thead><tr><th>#</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.usuarioId}</td>
              <td>{formatarData(p.dataCriacao)}</td>
              <td>{formatarMoeda(p.valorTotal)}</td>
              <td><span className={`status status-${p.status}`}>{rotuloStatus(p.status)}</span></td>
              <td>
                {acoes(p).map((a) => (
                  <button
                    key={a.status}
                    className={`link-button ${a.danger ? 'danger' : ''}`}
                    onClick={() => atualizar(p.id, a.status)}
                  >
                    {a.rotulo}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
