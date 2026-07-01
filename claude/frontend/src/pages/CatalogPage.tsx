import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatarMoeda } from '../api';
import { Categoria, Produto } from '../types';
import { useAuth } from '../auth';
import { useCart } from '../cart';

export default function CatalogPage() {
  const { usuario } = useAuth();
  const { adicionar } = useCart();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    const params = new URLSearchParams();
    if (categoriaId) params.set('categoriaId', categoriaId);
    else if (nome.trim()) params.set('nome', nome.trim());
    const lista = await api.get<Produto[]>(`/catalogo/produtos?${params.toString()}`);
    setProdutos(lista);
    setCarregando(false);
  }

  useEffect(() => {
    api.get<Categoria[]>('/catalogo/categorias').then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    carregar().catch(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  async function adicionarAoCarrinho(p: Produto) {
    setAviso(null);
    try {
      await adicionar(p.id, 1);
      setAviso(`"${p.nome}" adicionado ao carrinho.`);
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  return (
    <div>
      <h1>Catálogo</h1>

      <form
        className="filtros"
        onSubmit={(e) => {
          e.preventDefault();
          setCategoriaId('');
          carregar();
        }}
      >
        <input
          placeholder="Buscar por nome..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button type="submit" className="btn-primary">Buscar</button>
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </form>

      {aviso && <div className="aviso">{aviso}</div>}

      {carregando ? (
        <p>Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid">
          {produtos.map((p) => (
            <div key={p.id} className="card">
              <Link to={`/produtos/${p.id}`}>
                <img src={p.imagemUrl || 'https://via.placeholder.com/400x300'} alt={p.nome} />
              </Link>
              <div className="card-body">
                <Link to={`/produtos/${p.id}`} className="card-title">{p.nome}</Link>
                <div className="preco">{formatarMoeda(p.preco)}</div>
                {p.disponivel ? (
                  <span className="estoque-ok">Em estoque</span>
                ) : (
                  <span className="estoque-zero">Sem estoque</span>
                )}
                {usuario?.papel === 'CLIENTE' && (
                  <button
                    className="btn-primary"
                    disabled={!p.disponivel}
                    onClick={() => adicionarAoCarrinho(p)}
                  >
                    Adicionar ao carrinho
                  </button>
                )}
                {!usuario && (
                  <Link to="/login" className="btn-secondary">Entrar para comprar</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
