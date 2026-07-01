package com.ecommerce.domain;

import com.ecommerce.domain.exception.RegraNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Item dentro de um carrinho: um produto, sua quantidade e o preco unitario
 * vigente (diagrama de dominio). Nao permite quantidade maior que o estoque (RF15).
 */
@Entity
@Table(name = "item_carrinho")
public class ItemCarrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "carrinho_id", nullable = false)
    private Carrinho carrinho;

    @ManyToOne(optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precoUnitario;

    protected ItemCarrinho() {
        // exigido pelo JPA
    }

    ItemCarrinho(Carrinho carrinho, Produto produto, Integer quantidade) {
        this.carrinho = carrinho;
        this.produto = produto;
        this.precoUnitario = produto.getPreco();
        alterarQuantidade(quantidade);
    }

    /** Altera a quantidade validando contra o estoque disponivel (RF15). */
    public void alterarQuantidade(Integer quantidade) {
        if (quantidade == null || quantidade <= 0) {
            throw new RegraNegocioException("A quantidade deve ser maior que zero.");
        }
        if (!produto.temEstoque(quantidade)) {
            throw new RegraNegocioException(
                    "Quantidade solicitada maior que o estoque disponivel para '"
                            + produto.getNome() + "' (estoque: " + produto.getQuantidadeEstoque() + ").");
        }
        this.quantidade = quantidade;
        // mantem o preco sincronizado com o catalogo enquanto o item esta no carrinho
        this.precoUnitario = produto.getPreco();
    }

    public BigDecimal calcularSubtotal() {
        return precoUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

    public Long getId() {
        return id;
    }

    public Produto getProduto() {
        return produto;
    }

    public Long getProdutoId() {
        return produto.getId();
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    Carrinho getCarrinho() {
        return carrinho;
    }
}
