import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatarData, formatarMoeda, rotuloStatus } from '../api';
import { Pedido } from '../types';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get<Pedido>(`/pedidos/${id}`)
      .then(setPedido)
      .catch((e) => setErro((e as Error).message));
  }, [id]);

  if (erro) return <p className="erro">{erro}</p>;
  if (!pedido) return <p>Carregando...</p>;

  const e = pedido.enderecoEntrega;

  return (
    <div>
      <Link to="/pedidos">← Voltar aos pedidos</Link>
      <h1>Pedido #{pedido.id}</h1>
      <p>Data: {formatarData(pedido.dataCriacao)}</p>
      <p>Status: <span className={`status status-${pedido.status}`}>{rotuloStatus(pedido.status)}</span></p>

      <h2>Itens</h2>
      <table className="tabela">
        <thead>
          <tr><th>Produto</th><th>Qtd</th><th>Preço unit.</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          {pedido.itens.map((i) => (
            <tr key={i.produtoId}>
              <td>{i.nomeProduto}</td>
              <td>{i.quantidade}</td>
              <td>{formatarMoeda(i.precoUnitario)}</td>
              <td>{formatarMoeda(i.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total-linha"><span>Total:</span><strong>{formatarMoeda(pedido.valorTotal)}</strong></div>

      {e && (
        <>
          <h2>Endereço de entrega</h2>
          <p>{e.logradouro}, {e.numero}{e.complemento ? ` - ${e.complemento}` : ''}</p>
          <p>{e.cidade} - {e.estado}, CEP {e.cep}</p>
        </>
      )}
    </div>
  );
}
