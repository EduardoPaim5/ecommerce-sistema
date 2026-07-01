import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatarData, formatarMoeda, rotuloStatus } from '../api';
import { Pedido } from '../types';

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get<Pedido[]>('/pedidos')
      .then(setPedidos)
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p>Carregando pedidos...</p>;

  return (
    <div>
      <h1>Meus pedidos</h1>
      {pedidos.length === 0 ? (
        <p>Você ainda não tem pedidos. <Link to="/">Ir às compras</Link></p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{formatarData(p.dataCriacao)}</td>
                <td>{p.itens.length}</td>
                <td>{formatarMoeda(p.valorTotal)}</td>
                <td><span className={`status status-${p.status}`}>{rotuloStatus(p.status)}</span></td>
                <td><Link to={`/pedidos/${p.id}`}>Detalhes</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
