package com.example.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "itens_pedido")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonIgnore
    private Pedido pedido;

    @Column(name = "produto_id", nullable = false)
    private Long produtoId;

    @Column(name = "nome_produto", nullable = false)
    private String nomeProduto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public static ItemPedido criarSnapshot(ItemCarrinho item, Produto produto) {
        if (item == null || produto == null) {
            throw new IllegalArgumentException("ItemCarrinho e Produto sao obrigatorios para criar o snapshot");
        }
        BigDecimal preco = produto.getPreco();
        int qtd = item.getQuantidade();
        return ItemPedido.builder()
                .produtoId(produto.getId())
                .nomeProduto(produto.getNome())
                .quantidade(qtd)
                .precoUnitario(preco)
                .subtotal(preco.multiply(BigDecimal.valueOf(qtd)))
                .build();
    }
}
