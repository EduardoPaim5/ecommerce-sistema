import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatarMoeda } from '../api';
import { useCart } from '../cart';

export default function CartPage() {
  const { carrinho, alterarQuantidade, remover } = useCart();
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  if (!carrinho) return <p>Carregando carrinho...</p>;

  async function mudar(produtoId: number, quantidade: number) {
    setErro(null);
    if (quantidade < 1) return;
    try {
      await alterarQuantidade(produtoId, quantidade);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <div>
      <h1>Carrinho</h1>
      {erro && <div className="erro">{erro}</div>}
      {carrinho.vazio ? (
        <p>Seu carrinho está vazio. <Link to="/">Ver catálogo</Link></p>
      ) : (
        <>
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Quantidade</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrinho.itens.map((i) => (
                <tr key={i.produtoId}>
                  <td>{i.nomeProduto}</td>
                  <td>{formatarMoeda(i.precoUnitario)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={i.estoqueDisponivel}
                      value={i.quantidade}
                      onChange={(e) => mudar(i.produtoId, Number(e.target.value))}
                    />
                  </td>
                  <td>{formatarMoeda(i.subtotal)}</td>
                  <td>
                    <button className="link-button danger" onClick={() => remover(i.produtoId)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="total-linha">
            <span>Total:</span>
            <strong>{formatarMoeda(carrinho.total)}</strong>
          </div>
          <button className="btn-primary" onClick={() => navigate('/checkout')}>
            Finalizar compra
          </button>
        </>
      )}
    </div>
  );
}
