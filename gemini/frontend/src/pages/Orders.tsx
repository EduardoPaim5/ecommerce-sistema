import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { CreditCard, XCircle, CheckCircle, Clock, Package } from 'lucide-react';

export const Orders: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // If there is an ID in the route, we view detail
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [id]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.listarPedidosCliente();
      setOrders(data);
      
      // If we are looking for a specific order details, find it
      if (id) {
        const orderDetail = await api.obterPedido(id);
        setSelectedOrder(orderDetail);
      } else if (data.length > 0) {
        // Otherwise default to select the first order if none is selected
        setSelectedOrder(data[0]);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Erro ao carregar pedidos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = async (orderId: number) => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await api.obterPedido(orderId);
      setSelectedOrder(data);
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao carregar detalhes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (orderId: number) => {
    setPayLoading(true);
    setMessage(null);

    try {
      const response = await api.pagarPedido(orderId);
      
      if (response.resultado === 'APROVADO') {
        setMessage({ text: 'Pagamento Aprovado Simulado com sucesso!', type: 'success' });
      } else {
        setMessage({ text: 'Pagamento Recusado Simulado. O pedido foi Cancelado.', type: 'error' });
      }

      // Update local state
      setSelectedOrder(response.pedido);
      // Update list
      setOrders(orders.map(o => o.id === orderId ? response.pedido : o));
    } catch (err: any) {
      setMessage({ text: err.message || 'Falha ao processar pagamento', type: 'error' });
    } finally {
      setPayLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AGUARDANDO_PAGAMENTO':
        return <Clock className="status-icon text-warning" size={18} />;
      case 'PAGO':
        return <CreditCard className="status-icon text-info" size={18} />;
      case 'ENVIADO':
        return <Package className="status-icon text-primary" size={18} />;
      case 'ENTREGUE':
        return <CheckCircle className="status-icon text-success" size={18} />;
      case 'CANCELADO':
        return <XCircle className="status-icon text-danger" size={18} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AGUARDANDO_PAGAMENTO': return 'Aguardando Pagamento';
      case 'PAGO': return 'Pago';
      case 'ENVIADO': return 'Enviado';
      case 'ENTREGUE': return 'Entregue';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR');
  };

  return (
    <div className="orders-page-container">
      <h1>Meus Pedidos</h1>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
          {message.text}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Carregando pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Você ainda não fez nenhum pedido</h3>
          <p>Seus pedidos aparecerão aqui assim que finalizar uma compra.</p>
          <Link to="/" className="btn-primary mt-4">
            Ir para o Catálogo
          </Link>
        </div>
      ) : (
        <div className="orders-layout">
          {/* List of orders */}
          <div className="orders-list-panel">
            <h2>Histórico de Pedidos</h2>
            <div className="orders-list">
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => handleSelectOrder(o.id)}
                  className={`order-list-item ${selectedOrder?.id === o.id ? 'active' : ''}`}
                >
                  <div className="order-item-header">
                    <span className="order-number">Pedido #{o.id}</span>
                    <span className="order-date">{formatDate(o.dataCriacao)}</span>
                  </div>
                  <div className="order-item-footer">
                    <span className="order-status-badge">
                      {getStatusIcon(o.status)}
                      <span>{getStatusLabel(o.status)}</span>
                    </span>
                    <span className="order-price-value">R$ {o.valorTotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details panel */}
          <div className="order-details-panel">
            {selectedOrder ? (
              <div className="order-details-content">
                <div className="details-header">
                  <h2>Pedido #{selectedOrder.id}</h2>
                  <span className={`status-badge-large status-${selectedOrder.status.toLowerCase()}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span>{getStatusLabel(selectedOrder.status)}</span>
                  </span>
                </div>

                <p className="details-date">Realizado em {formatDate(selectedOrder.dataCriacao)}</p>

                {/* Simulated Payment Box */}
                {selectedOrder.status === 'AGUARDANDO_PAGAMENTO' && (
                  <div className="payment-simulation-box">
                    <h3>Simulação de Pagamento</h3>
                    <p>
                      Para fins de demonstração técnica, você pode aprovar ou recusar o pagamento.
                      A baixa do estoque ocorrerá apenas se o pagamento for aprovado.
                    </p>
                    <button
                      onClick={() => handleSimulatePayment(selectedOrder.id)}
                      disabled={payLoading}
                      className="btn-primary btn-pay-simulation"
                    >
                      {payLoading ? 'Simulando...' : 'Efetuar Pagamento Simulado'}
                    </button>
                  </div>
                )}

                {/* Items snapshot */}
                <div className="order-items-box">
                  <h3>Itens do Pedido (Dados Congelados)</h3>
                  <div className="order-items-list-detail">
                    {selectedOrder.itens.map((item: any) => (
                      <div key={item.id} className="order-item-detail-row">
                        <div>
                          <h4 className="item-detail-name">{item.nomeProduto}</h4>
                          <span className="item-detail-qty">
                            {item.quantidade}x de R$ {item.precoUnitario.toFixed(2)}
                          </span>
                        </div>
                        <span className="item-detail-subtotal">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="details-total-row">
                    <span>Total do Pedido</span>
                    <span className="details-total-price">
                      R$ {selectedOrder.valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedOrder.enderecoEntrega && (
                  <div className="address-details-box">
                    <h3>Endereço de Entrega</h3>
                    <p className="address-text">
                      <strong>Logradouro:</strong> {selectedOrder.enderecoEntrega.logradouro}, nº {selectedOrder.enderecoEntrega.numero}
                      {selectedOrder.enderecoEntrega.complemento && ` - ${selectedOrder.enderecoEntrega.complemento}`}
                      <br />
                      <strong>Bairro/Cidade/Estado:</strong> {selectedOrder.enderecoEntrega.cidade} - {selectedOrder.enderecoEntrega.estado}
                      <br />
                      <strong>CEP:</strong> {selectedOrder.enderecoEntrega.cep}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-order-selected">
                <p>Selecione um pedido na lista para ver os detalhes.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
