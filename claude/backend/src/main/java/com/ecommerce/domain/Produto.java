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
 * Produto vendido no catalogo (diagrama de dominio).
 *
 * <p>Regras: {@code preco >= 0}; {@code quantidadeEstoque >= 0}; produtos
 * inativos nao aparecem no catalogo (RN04) mas permanecem em pedidos antigos.
 * O proprio produto controla a validacao e o ajuste de estoque.</p>
 */
@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 2000)
    private String descricao;

    @Column(name = "imagem_url")
    private String imagemUrl;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal preco;

    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque;

    @Column(nullable = false)
    private boolean ativo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    protected Produto() {
        // exigido pelo JPA
    }

    public Produto(String nome, String descricao, String imagemUrl, BigDecimal preco,
                   Integer quantidadeEstoque, Categoria categoria) {
        validarPreco(preco);
        validarEstoque(quantidadeEstoque);
        this.nome = nome;
        this.descricao = descricao;
        this.imagemUrl = imagemUrl;
        this.preco = preco;
        this.quantidadeEstoque = quantidadeEstoque;
        this.categoria = categoria;
        this.ativo = true;
    }

    public void atualizarDados(String nome, String descricao, BigDecimal preco,
                               String imagemUrl, Categoria categoria) {
        validarPreco(preco);
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.imagemUrl = imagemUrl;
        this.categoria = categoria;
    }

    public void ajustarEstoque(Integer quantidadeEstoque) {
        validarEstoque(quantidadeEstoque);
        this.quantidadeEstoque = quantidadeEstoque;
    }

    public void ativar() {
        this.ativo = true;
    }

    public void desativar() {
        this.ativo = false;
    }

    /** Indica se ha estoque suficiente para a quantidade desejada (RF10/RF15). */
    public boolean temEstoque(Integer quantidade) {
        return this.quantidadeEstoque >= quantidade;
    }

    public boolean disponivel() {
        return this.ativo && this.quantidadeEstoque > 0;
    }

    /** Da baixa no estoque; exige quantidade disponivel (RF19/RN03). */
    public void baixarEstoque(Integer quantidade) {
        if (!temEstoque(quantidade)) {
            throw new RegraNegocioException(
                    "Estoque insuficiente para o produto '" + nome + "'.");
        }
        this.quantidadeEstoque -= quantidade;
    }

    /** Estorna o estoque ao cancelar um pedido ainda nao enviado (secao 4). */
    public void estornarEstoque(Integer quantidade) {
        this.quantidadeEstoque += quantidade;
    }

    private void validarPreco(BigDecimal preco) {
        if (preco == null || preco.signum() < 0) {
            throw new RegraNegocioException("O preco do produto deve ser maior ou igual a zero.");
        }
    }

    private void validarEstoque(Integer quantidade) {
        if (quantidade == null || quantidade < 0) {
            throw new RegraNegocioException("O estoque do produto deve ser maior ou igual a zero.");
        }
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public Categoria getCategoria() {
        return categoria;
    }
}
