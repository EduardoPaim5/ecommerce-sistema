import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatarMoeda } from '../api';
import { Produto } from '../types';
import { useAuth } from '../auth';
import { useCart } from '../cart';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { adicionar } = useCart();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    api.get<Produto>(`/catalogo/produtos/${id}`)
      .then(setProduto)
      .catch((e) => setErro((e as Error).message));
  }, [id]);

  if (erro) return <p className="erro">{erro}</p>;
  if (!produto) return <p>Carregando...</p>;

  async function adicionarAoCarrinho() {
    if (!produto) return;
    setAviso(null);
    try {
      await adicionar(produto.id, quantidade);
      setAviso('Produto adicionado ao carrinho.');
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  return (
    <div className="detalhe">
      <Link to="/">← Voltar ao catálogo</Link>
      <div className="detalhe-grid">
        <img src={produto.imagemUrl || 'https://via.placeholder.com/500x400'} alt={produto.nome} />
        <div>
          <h1>{produto.nome}</h1>
          <p className="categoria-tag">{produto.categoria.nome}</p>
          <p>{produto.descricao}</p>
          <div className="preco-grande">{formatarMoeda(produto.preco)}</div>
          {produto.disponivel ? (
            <p className="estoque-ok">{produto.quantidadeEstoque} em estoque</p>
          ) : (
            <p className="estoque-zero">Produto sem estoque</p>
          )}

          {aviso && <div className="aviso">{aviso}</div>}

          {usuario?.papel === 'CLIENTE' ? (
            <div className="compra">
              <input
                type="number"
                min={1}
                max={produto.quantidadeEstoque}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
              />
              <button className="btn-primary" disabled={!produto.disponivel} onClick={adicionarAoCarrinho}>
                Adicionar ao carrinho
              </button>
            </div>
          ) : !usuario ? (
            <Link to="/login" className="btn-primary">Entrar para comprar</Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
