package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 2000)
    private String descricao;

    @Column(name = "imagem_url", length = 1000)
    private String imagemUrl;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque;

    @Column(nullable = false)
    private Boolean ativo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    public void atualizarDados(String nome, String descricao, BigDecimal preco, String imagemUrl, Categoria categoria) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.imagemUrl = imagemUrl;
        this.categoria = categoria;
    }

    public void activar() {
        this.ativo = true;
    }

    // Wait, standardizing naming based on the diagram: PUML has 'ativar' and 'desativar'.
    // Let's use exactly 'ativar()' and 'desativar()'.
    public void ativar() {
        this.ativo = true;
    }

    public void desativar() {
        this.ativo = false;
    }

    public Boolean temEstoque(Integer quantidade) {
        return this.quantidadeEstoque >= quantidade;
    }

    public void baixarEstoque(Integer quantidade) {
        if (!temEstoque(quantidade)) {
            throw new IllegalArgumentException("Estoque insuficiente para o produto: " + this.nome);
        }
        this.quantidadeEstoque -= quantidade;
    }

    public void estornarEstoque(Integer quantidade) {
        if (quantidade < 0) {
            throw new IllegalArgumentException("Quantidade a estornar nao pode ser negativa");
        }
        this.quantidadeEstoque += quantidade;
    }
}
