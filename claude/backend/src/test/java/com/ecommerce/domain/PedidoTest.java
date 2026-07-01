package com.ecommerce.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ecommerce.domain.exception.RegraNegocioException;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class PedidoTest {

    private Produto produto(String nome, String preco, int estoque) {
        return new Produto(nome, "desc", null, new BigDecimal(preco), estoque,
                new Categoria("cat", "desc"));
    }

    private Pedido pedidoComUmItem() {
        Carrinho carrinho = new Carrinho(1L);
        Produto p = produto("Produto", "10.00", 5);
        carrinho.adicionarProduto(p, 2);
        List<ItemPedido> itens = carrinho.getItens().stream()
                .map(i -> ItemPedido.criarSnapshot(i, i.getProduto()))
                .toList();
        return new Pedido(1L, itens, new Endereco("00000-000", "Rua", "1", null, "Cidade", "ST"));
    }

    @Test
    void pedidoIniciaAguardandoPagamentoComValorTotalSomado() {
        Pedido pedido = pedidoComUmItem();
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.AGUARDANDO_PAGAMENTO);
        assertThat(pedido.getValorTotal()).isEqualByComparingTo("20.00");
    }

    @Test
    void pagamentoAprovadoLevaParaPago() {
        Pedido pedido = pedidoComUmItem();
        pedido.confirmarPagamento(ResultadoPagamento.APROVADO);
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.PAGO);
    }

    @Test
    void pagamentoRecusadoCancelaPedido() {
        Pedido pedido = pedidoComUmItem();
        pedido.confirmarPagamento(ResultadoPagamento.RECUSADO);
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.CANCELADO);
    }

    @Test
    void fluxoCompletoAteEntregue() {
        Pedido pedido = pedidoComUmItem();
        pedido.confirmarPagamento(ResultadoPagamento.APROVADO);
        pedido.enviar();
        pedido.confirmarRecebimento();
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.ENTREGUE);
    }

    @Test
    void naoPermiteEnviarPedidoNaoPago() {
        Pedido pedido = pedidoComUmItem();
        assertThatThrownBy(pedido::enviar)
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void pedidoEntregueNaoPodeSerCancelado() {
        Pedido pedido = pedidoComUmItem();
        pedido.confirmarPagamento(ResultadoPagamento.APROVADO);
        pedido.enviar();
        pedido.confirmarRecebimento();
        assertThat(pedido.podeSerCancelado()).isFalse();
        assertThatThrownBy(pedido::cancelar).isInstanceOf(RegraNegocioException.class);
    }
}
