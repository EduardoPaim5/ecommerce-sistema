package com.ecommerce.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ecommerce.domain.exception.RegraNegocioException;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class CarrinhoTest {

    private long proximoId = 1L;

    private Produto produto(String preco, int estoque) {
        Produto p = new Produto("Produto", "desc", null, new BigDecimal(preco), estoque,
                new Categoria("cat", "desc"));
        // Atribui um id para simular a entidade persistida (distincao entre itens).
        ReflectionTestUtils.setField(p, "id", proximoId++);
        return p;
    }

    @Test
    void calculaTotalComoSomaDosSubtotais() {
        Carrinho carrinho = new Carrinho(1L);
        carrinho.adicionarProduto(produto("10.00", 10), 2);
        carrinho.adicionarProduto(produto("5.50", 10), 4);
        assertThat(carrinho.calcularTotal()).isEqualByComparingTo("42.00");
    }

    @Test
    void adicionarMesmoProdutoSomaQuantidade() {
        Carrinho carrinho = new Carrinho(1L);
        Produto p = produto("10.00", 10);
        carrinho.adicionarProduto(p, 2);
        carrinho.adicionarProduto(p, 3);
        assertThat(carrinho.getItens()).hasSize(1);
        assertThat(carrinho.getItens().get(0).getQuantidade()).isEqualTo(5);
    }

    @Test
    void naoPermiteQuantidadeMaiorQueEstoque() {
        Carrinho carrinho = new Carrinho(1L);
        assertThatThrownBy(() -> carrinho.adicionarProduto(produto("10.00", 3), 5))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void carrinhoNovoEstaVazio() {
        assertThat(new Carrinho(1L).estaVazio()).isTrue();
    }
}
