package com.example.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "itens_carrinho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrinho_id", nullable = false)
    @JsonIgnore
    private Carrinho carrinho;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    public Long getProdutoId() {
        return this.produto != null ? this.produto.getId() : null;
    }

    public void alterarQuantidade(Integer quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }
        if (this.produto != null && !this.produto.temEstoque(quantidade)) {
            throw new IllegalArgumentException("Quantidade superior ao estoque disponivel");
        }
        this.quantidade = quantidade;
    }

    public BigDecimal calcularSubtotal() {
        if (this.precoUnitario == null) {
            return BigDecimal.ZERO;
        }
        return this.precoUnitario.multiply(BigDecimal.valueOf(this.quantidade));
    }
}
