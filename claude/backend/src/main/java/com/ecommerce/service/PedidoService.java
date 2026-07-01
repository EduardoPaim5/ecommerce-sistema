package com.ecommerce.service;

import com.ecommerce.domain.ItemPedido;
import com.ecommerce.domain.Pedido;
import com.ecommerce.domain.StatusPedido;
import com.ecommerce.domain.Usuario;
import com.ecommerce.domain.exception.AcessoNegadoException;
import com.ecommerce.domain.exception.RecursoNaoEncontradoException;
import com.ecommerce.domain.exception.RegraNegocioException;
import com.ecommerce.repository.PedidoRepository;
import com.ecommerce.repository.ProdutoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Casos de uso de pedidos (RF21, RF24, RF25). Aplica a maquina de estados do
 * dominio e o estorno de estoque ao cancelar pedidos nao enviados.
 */
@Service
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProdutoRepository produtoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
    }

    /** Lista os pedidos do cliente autenticado (RF21). */
    @Transactional(readOnly = true)
    public List<Pedido> listarPedidosDoCliente(Usuario usuario) {
        return pedidoRepository.findByUsuarioIdOrderByDataCriacaoDesc(usuario.getId());
    }

    /** Detalhe de um pedido, respeitando RN05 (proprio cliente ou admin). */
    @Transactional(readOnly = true)
    public Pedido obterPedido(Usuario usuario, Long pedidoId) {
        Pedido pedido = buscar(pedidoId);
        if (!usuario.podeVisualizarPedido(pedido)) {
            throw new AcessoNegadoException("Voce nao tem permissao para visualizar este pedido.");
        }
        return pedido;
    }

    /** Visualizacao de todos os pedidos pelo administrador (RF24). */
    @Transactional(readOnly = true)
    public List<Pedido> listarTodosPedidos(Usuario admin) {
        exigirAdmin(admin);
        return pedidoRepository.findAllByOrderByDataCriacaoDesc();
    }

    /** Atualizacao de status pelo administrador conforme a maquina de estados (RF25). */
    public Pedido atualizarStatus(Usuario admin, Long pedidoId, StatusPedido novoStatus) {
        exigirAdmin(admin);
        Pedido pedido = buscar(pedidoId);
        switch (novoStatus) {
            case ENVIADO -> pedido.enviar();
            case ENTREGUE -> pedido.confirmarRecebimento();
            case CANCELADO -> cancelarComEstorno(pedido);
            default -> throw new RegraNegocioException(
                    "O administrador nao pode definir o status " + novoStatus + " manualmente.");
        }
        return pedidoRepository.save(pedido);
    }

    private void cancelarComEstorno(Pedido pedido) {
        // Secao 4: ao cancelar um pedido ainda nao enviado cujo estoque ja foi
        // baixado (pagamento aprovado), o estoque deve ser estornado.
        boolean estornar = pedido.estoqueFoiBaixado() && pedido.getStatus() != StatusPedido.ENVIADO;
        pedido.cancelar();
        if (estornar) {
            for (ItemPedido item : pedido.getItens()) {
                produtoRepository.findById(item.getProdutoId())
                        .ifPresent(produto -> produto.estornarEstoque(item.getQuantidade()));
            }
        }
    }

    private Pedido buscar(Long pedidoId) {
        return pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido nao encontrado."));
    }

    private void exigirAdmin(Usuario usuario) {
        if (!usuario.ehAdministrador()) {
            throw new AcessoNegadoException("Acao restrita a administradores.");
        }
    }
}
