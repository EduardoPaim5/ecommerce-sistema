package com.example.ecommerce.service;

import com.example.ecommerce.entity.*;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<Pedido> listarPedidosDoCliente(Usuario usuario) {
        return orderRepository.findByUsuarioIdOrderByDataCriacaoDesc(usuario.getId());
    }

    @Transactional(readOnly = true)
    public Pedido obterPedido(Usuario usuario, Long pedidoId) {
        Pedido pedido = orderRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido nao encontrado com id: " + pedidoId));

        if (!usuario.podeVisualizarPedido(pedido)) {
            throw new AccessDeniedException("Voce nao tem permissao para visualizar este pedido");
        }
        return pedido;
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodosPedidos(Usuario admin) {
        if (!admin.ehAdministrador()) {
            throw new AccessDeniedException("Acesso negado: Apenas administradores podem listar todos os pedidos");
        }
        return orderRepository.findAll();
    }

    @Transactional
    public Pedido atualizarStatus(Usuario admin, Long pedidoId, StatusPedido novoStatus) {
        if (!admin.ehAdministrador()) {
            throw new AccessDeniedException("Acesso negado: Apenas administradores podem atualizar o status de um pedido");
        }

        Pedido pedido = orderRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido nao encontrado com id: " + pedidoId));

        StatusPedido statusAtual = pedido.getStatus();
        if (statusAtual == novoStatus) {
            return pedido;
        }

        // Handle transition and rules
        if (statusAtual == StatusPedido.AGUARDANDO_PAGAMENTO) {
            if (novoStatus == StatusPedido.PAGO) {
                // Payment approved: transition to PAGO and deduct stock (RN03)
                pedido.confirmarPagamento(ResultadoPagamento.APROVADO);
                deduzirEstoque(pedido);
            } else if (novoStatus == StatusPedido.CANCELADO) {
                // Payment refused: transition to CANCELADO, no stock change
                pedido.confirmarPagamento(ResultadoPagamento.RECUSADO);
            } else {
                throw new IllegalStateException("Transicao de status invalida de AGUARDANDO_PAGAMENTO para " + novoStatus);
            }
        } else if (statusAtual == StatusPedido.PAGO) {
            if (novoStatus == StatusPedido.ENVIADO) {
                pedido.enviar();
            } else if (novoStatus == StatusPedido.CANCELADO) {
                // Cancelled after payment: transition to CANCELADO and estornar stock
                estornarEstoque(pedido);
                pedido.cancelar();
            } else {
                throw new IllegalStateException("Transicao de status invalida de PAGO para " + novoStatus);
            }
        } else if (statusAtual == StatusPedido.ENVIADO) {
            if (novoStatus == StatusPedido.ENTREGUE) {
                pedido.confirmarRecebimento();
            } else {
                throw new IllegalStateException("Transicao de status invalida de ENVIADO para " + novoStatus);
            }
        } else {
            throw new IllegalStateException("Nao e possivel alterar o status de um pedido com status final: " + statusAtual);
        }

        return orderRepository.save(pedido);
    }

    @Transactional
    public Pedido processarPagamentoSimulado(Usuario cliente, Long pedidoId, ResultadoPagamento resultado) {
        Pedido pedido = obterPedido(cliente, pedidoId);
        
        if (pedido.getStatus() != StatusPedido.AGUARDANDO_PAGAMENTO) {
            throw new IllegalStateException("Este pedido nao esta aguardando pagamento");
        }

        if (resultado == ResultadoPagamento.APROVADO) {
            pedido.confirmarPagamento(ResultadoPagamento.APROVADO);
            deduzirEstoque(pedido);
        } else {
            pedido.confirmarPagamento(ResultadoPagamento.RECUSADO);
        }

        return orderRepository.save(pedido);
    }

    private void deduzirEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = productRepository.findById(item.getProdutoId())
                    .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado para baixa de estoque: " + item.getNomeProduto()));
            
            // This will throw error if not enough stock, but checkout already validated.
            // Still, it is a runtime guarantee.
            produto.baixarEstoque(item.getQuantidade());
            productRepository.save(produto);
        }
    }

    private void estornarEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = productRepository.findById(item.getProdutoId()).orElse(null);
            if (produto != null) {
                produto.estornarEstoque(item.getQuantidade());
                productRepository.save(produto);
            }
        }
    }
}
