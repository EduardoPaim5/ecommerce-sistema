package com.ecommerce.service;

import com.ecommerce.domain.Carrinho;
import com.ecommerce.domain.Endereco;
import com.ecommerce.domain.ItemCarrinho;
import com.ecommerce.domain.ItemPedido;
import com.ecommerce.domain.Pedido;
import com.ecommerce.domain.ResultadoPagamento;
import com.ecommerce.domain.StatusPedido;
import com.ecommerce.domain.Usuario;
import com.ecommerce.domain.exception.RegraNegocioException;
import com.ecommerce.repository.CarrinhoRepository;
import com.ecommerce.repository.PedidoRepository;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Casos de uso de checkout (RF16-RF20). Orquestra a criacao do pedido a partir
 * do carrinho, a simulacao de pagamento e a aplicacao da transicao de status,
 * delegando as regras ao dominio.
 */
@Service
@Transactional
public class CheckoutService {

    private final CarrinhoService carrinhoService;
    private final CarrinhoRepository carrinhoRepository;
    private final PedidoRepository pedidoRepository;

    public CheckoutService(CarrinhoService carrinhoService,
                           CarrinhoRepository carrinhoRepository,
                           PedidoRepository pedidoRepository) {
        this.carrinhoService = carrinhoService;
        this.carrinhoRepository = carrinhoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    /** Finaliza a compra a partir do carrinho do usuario (RF16-RF20). */
    public Pedido finalizarCompra(Usuario usuario, Endereco endereco) {
        Carrinho carrinho = carrinhoService.obterCarrinho(usuario);
        if (carrinho.estaVazio()) {
            // RN02: nao e possivel finalizar pedido com carrinho vazio.
            throw new RegraNegocioException("Nao e possivel finalizar a compra com o carrinho vazio.");
        }

        // RN01: congela nome e preco em snapshots imutaveis.
        List<ItemPedido> itens = carrinho.getItens().stream()
                .map(item -> ItemPedido.criarSnapshot(item, item.getProduto()))
                .toList();

        // RF20: pedido inicia em AGUARDANDO_PAGAMENTO.
        Pedido pedido = new Pedido(usuario.getId(), itens, endereco);

        // RF18: simula o pagamento e aplica a transicao no proprio pedido.
        ResultadoPagamento resultado = simularPagamento(pedido);
        pedido.confirmarPagamento(resultado);

        // RN03/RF19: estoque baixa apenas quando o pagamento e aprovado.
        if (pedido.getStatus() == StatusPedido.PAGO) {
            for (ItemCarrinho item : carrinho.getItens()) {
                item.getProduto().baixarEstoque(item.getQuantidade());
            }
        }

        pedido = pedidoRepository.save(pedido);

        // Carrinho e esvaziado apos a finalizacao da compra.
        carrinho.limpar();
        carrinhoRepository.save(carrinho);

        return pedido;
    }

    /**
     * Simula um gateway de pagamento (RF18). Sem integracao real: aprova a
     * maioria das tentativas para facilitar a demonstracao do fluxo feliz.
     */
    public ResultadoPagamento simularPagamento(Pedido pedido) {
        boolean aprovado = ThreadLocalRandom.current().nextInt(100) < 85;
        return aprovado ? ResultadoPagamento.APROVADO : ResultadoPagamento.RECUSADO;
    }
}
