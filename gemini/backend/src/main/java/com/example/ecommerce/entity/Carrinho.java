package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity
@Table(name = "carrinhos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, unique = true)
    private Long usuarioId;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime jsonAtualizadoEm; // naming matches database but let's expose it as 'atualizadoEm'

    @OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ItemCarrinho> itens = new ArrayList<>();

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        jsonAtualizadoEm = LocalDateTime.now();
    }

    public LocalDateTime getAtualizadoEm() {
        return jsonAtualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.jsonAtualizadoEm = atualizadoEm;
    }

    public void adicionarProduto(Produto produto, Integer quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }
        if (!produto.getAtivo()) {
            throw new IllegalArgumentException("Nao e possivel adicionar um produto inativo ao carrinho");
        }

        Optional<ItemCarrinho> itemExistente = itens.stream()
                .filter(item -> item.getProduto().getId().equals(produto.getId()))
                .findFirst();

        if (itemExistente.isPresent()) {
            ItemCarrinho item = itemExistente.get();
            int novaQuantidade = item.getQuantidade() + quantidade;
            if (!produto.temEstoque(novaQuantidade)) {
                throw new IllegalArgumentException("Quantidade total solicitada (" + novaQuantidade + ") excede o estoque disponivel (" + produto.getQuantidadeEstoque() + ")");
            }
            item.alterarQuantidade(novaQuantidade);
        } else {
            if (!produto.temEstoque(quantidade)) {
                throw new IllegalArgumentException("Quantidade solicitada excede o estoque disponivel (" + produto.getQuantidadeEstoque() + ")");
            }
            ItemCarrinho novoItem = ItemCarrinho.builder()
                    .carrinho(this)
                    .produto(produto)
                    .quantidade(quantidade)
                    .precoUnitario(produto.getPreco())
                    .build();
            itens.add(novoItem);
        }
        this.jsonAtualizadoEm = LocalDateTime.now();
    }

    public void alterarQuantidade(Produto produto, Integer quantidade) {
        if (quantidade <= 0) {
            removerProduto(produto);
            return;
        }

        ItemCarrinho item = itens.stream()
                .filter(i -> i.getProduto().getId().equals(produto.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado no carrinho"));

        if (!produto.temEstoque(quantidade)) {
            throw new IllegalArgumentException("Quantidade solicitada excede o estoque disponivel (" + produto.getQuantidadeEstoque() + ")");
        }

        item.alterarQuantidade(quantidade);
        this.jsonAtualizadoEm = LocalDateTime.now();
    }

    public void removerProduto(Produto produto) {
        itens.removeIf(item -> item.getProduto().getId().equals(produto.getId()));
        this.jsonAtualizadoEm = LocalDateTime.now();
    }

    public void limpar() {
        itens.clear();
        this.jsonAtualizadoEm = LocalDateTime.now();
    }

    public BigDecimal calcularTotal() {
        return itens.stream()
                .map(ItemCarrinho::calcularSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Boolean estaVazio() {
        return itens == null || itens.isEmpty();
    }
}
