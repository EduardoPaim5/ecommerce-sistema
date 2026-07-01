import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatarMoeda, rotuloStatus } from '../api';
import { Pedido } from '../types';
import { useCart } from '../cart';

export default function CheckoutPage() {
  const { carrinho, atualizar } = useCart();
  const navigate = useNavigate();
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    cidade: '',
    estado: '',
  });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Pedido | null>(null);

  function campo(nome: keyof typeof endereco) {
    return {
      value: endereco[nome],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setEndereco((prev) => ({ ...prev, [nome]: e.target.value })),
    };
  }

  async function submeter(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const pedido = await api.post<Pedido>('/checkout', { endereco });
      await atualizar().catch(() => {});
      setResultado(pedido);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    const aprovado = resultado.status !== 'CANCELADO';
    return (
      <div className="form-card">
        <h1>{aprovado ? '✅ Pedido confirmado!' : '❌ Pagamento recusado'}</h1>
        <p>Pedido #{resultado.id} — status: <strong>{rotuloStatus(resultado.status)}</strong></p>
        <p>Valor total: {formatarMoeda(resultado.valorTotal)}</p>
        {!aprovado && (
          <p className="erro">
            O pagamento simulado foi recusado e o pedido foi cancelado. Tente novamente.
          </p>
        )}
        <div className="acoes">
          <button className="btn-primary" onClick={() => navigate(`/pedidos/${resultado.id}`)}>
            Ver pedido
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>Voltar ao catálogo</button>
        </div>
      </div>
    );
  }

  if (carrinho?.vazio) {
    return <p>Seu carrinho está vazio. Adicione itens antes de finalizar a compra.</p>;
  }

  return (
    <div className="form-card largo">
      <h1>Checkout</h1>
      <p>Total a pagar: <strong>{carrinho ? formatarMoeda(carrinho.total) : '...'}</strong></p>
      <form onSubmit={submeter}>
        <h2>Endereço de entrega</h2>
        <div className="form-grid">
          <label>CEP<input {...campo('cep')} required /></label>
          <label>Logradouro<input {...campo('logradouro')} required /></label>
          <label>Número<input {...campo('numero')} required /></label>
          <label>Complemento<input {...campo('complemento')} /></label>
          <label>Cidade<input {...campo('cidade')} required /></label>
          <label>Estado<input {...campo('estado')} required /></label>
        </div>
        {erro && <div className="erro">{erro}</div>}
        <p className="dica">O pagamento é simulado (sem cobrança real).</p>
        <button className="btn-primary" type="submit" disabled={enviando}>
          {enviando ? 'Processando pagamento...' : 'Pagar e finalizar'}
        </button>
      </form>
    </div>
  );
}
