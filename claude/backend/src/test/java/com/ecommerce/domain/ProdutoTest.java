package com.ecommerce.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ecommerce.domain.exception.RegraNegocioException;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class ProdutoTest {

    private Produto novoProduto(int estoque) {
        return new Produto("Produto", "desc", null, new BigDecimal("10.00"), estoque,
                new Categoria("cat", "desc"));
    }

    @Test
    void naoPermitePrecoNegativo() {
        assertThatThrownBy(() -> new Produto("p", "d", null, new BigDecimal("-1"), 1,
                new Categoria("c", "d")))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void baixarEstoqueReduzQuantidade() {
        Produto p = novoProduto(10);
        p.baixarEstoque(3);
        assertThat(p.getQuantidadeEstoque()).isEqualTo(7);
    }

    @Test
    void baixarEstoqueAcimaDoDisponivelFalha() {
        Produto p = novoProduto(2);
        assertThatThrownBy(() -> p.baixarEstoque(5))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void estornarEstoqueDevolveQuantidade() {
        Produto p = novoProduto(5);
        p.baixarEstoque(5);
        p.estornarEstoque(5);
        assertThat(p.getQuantidadeEstoque()).isEqualTo(5);
    }

    @Test
    void produtoSemEstoqueOuInativoNaoEstaDisponivel() {
        assertThat(novoProduto(0).disponivel()).isFalse();
        Produto p = novoProduto(5);
        p.desativar();
        assertThat(p.disponivel()).isFalse();
    }
}
