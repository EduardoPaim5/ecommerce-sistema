package com.ecommerce.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Carrinho ativo de um usuario. Um usuario possui exatamente um carrinho ativo
 * (diagrama de dominio). O carrinho controla a adicao, alteracao e remocao de
 * itens, alem do calculo do total.
 */
@Entity
@Table(name = "carrinho")
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, unique = true)
    private Long usuarioId;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCarrinho> itens = new ArrayList<>();

    protected Carrinho() {
        // exigido pelo JPA
    }

    public Carrinho(Long usuarioId) {
        this.usuarioId = usuarioId;
        this.atualizadoEm = LocalDateTime.now();
    }

    /** Adiciona um produto; se ja existir, soma a quantidade (RF11/RF15). */
    public void adicionarProduto(Produto produto, Integer quantidade) {
        ItemCarrinho existente = buscarItem(produto.getId());
        if (existente != null) {
            existente.alterarQuantidade(existente.getQuantidade() + quantidade);
        } else {
            itens.add(new ItemCarrinho(this, produto, quantidade));
        }
        marcarAtualizado();
    }

    /** Altera a quantidade de um produto ja presente no carrinho (RF12). */
    public void alterarQuantidade(Produto produto, Integer quantidade) {
        ItemCarrinho item = exigirItem(produto.getId());
        item.alterarQuantidade(quantidade);
        marcarAtualizado();
    }

    /** Remove um produto do carrinho (RF13). */
    public void removerProduto(Produto produto) {
        itens.removeIf(item -> java.util.Objects.equals(item.getProdutoId(), produto.getId()));
        marcarAtualizado();
    }

    public void limpar() {
        itens.clear();
        marcarAtualizado();
    }

    /** Total do carrinho: soma dos subtotais dos itens (RF14). */
    public BigDecimal calcularTotal() {
        return itens.stream()
                .map(ItemCarrinho::calcularSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public boolean estaVazio() {
        return itens.isEmpty();
    }

    private ItemCarrinho buscarItem(Long produtoId) {
        return itens.stream()
                .filter(item -> java.util.Objects.equals(item.getProdutoId(), produtoId))
                .findFirst()
                .orElse(null);
    }

    private ItemCarrinho exigirItem(Long produtoId) {
        ItemCarrinho item = buscarItem(produtoId);
        if (item == null) {
            throw new com.ecommerce.domain.exception.RegraNegocioException(
                    "O produto nao esta no carrinho.");
        }
        return item;
    }

    private void marcarAtualizado() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public List<ItemCarrinho> getItens() {
        return List.copyOf(itens);
    }
}
