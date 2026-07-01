package com.example.ecommerce.service;

import com.example.ecommerce.entity.Produto;
import com.example.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<Produto> listarProdutosAtivos() {
        return productRepository.findByAtivoTrue();
    }

    @Transactional(readOnly = true)
    public List<Produto> buscarProdutosPorNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return listarProdutosAtivos();
        }
        return productRepository.findByAtivoTrueAndNomeContainingIgnoreCase(nome);
    }

    @Transactional(readOnly = true)
    public List<Produto> filtrarProdutosPorCategoria(Long categoriaId) {
        return productRepository.findByAtivoTrueAndCategoriaId(categoriaId);
    }

    @Transactional(readOnly = true)
    public Produto obterDetalheProduto(Long produtoId) {
        return productRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado com id: " + produtoId));
    }
}
