package com.example.ecommerce.service;

import com.example.ecommerce.entity.Carrinho;
import com.example.ecommerce.entity.Produto;
import com.example.ecommerce.entity.Usuario;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Carrinho obterCarrinho(Usuario usuario) {
        return cartRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    Carrinho carrinho = Carrinho.builder()
                            .usuarioId(usuario.getId())
                            .jsonAtualizadoEm(LocalDateTime.now())
                            .build();
                    return cartRepository.save(carrinho);
                });
    }

    @Transactional
    public Carrinho adicionarItem(Usuario usuario, Long produtoId, Integer quantidade) {
        Carrinho carrinho = obterCarrinho(usuario);
        Produto produto = productRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado com id: " + produtoId));
        
        carrinho.adicionarProduto(produto, quantidade);
        return cartRepository.save(carrinho);
    }

    @Transactional
    public Carrinho alterarQuantidade(Usuario usuario, Long produtoId, Integer quantidade) {
        Carrinho carrinho = obterCarrinho(usuario);
        Produto produto = productRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado com id: " + produtoId));
        
        carrinho.alterarQuantidade(produto, quantidade);
        return cartRepository.save(carrinho);
    }

    @Transactional
    public Carrinho removerItem(Usuario usuario, Long produtoId) {
        Carrinho carrinho = obterCarrinho(usuario);
        Produto produto = productRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado com id: " + produtoId));
        
        carrinho.removerProduto(produto);
        return cartRepository.save(carrinho);
    }
}
