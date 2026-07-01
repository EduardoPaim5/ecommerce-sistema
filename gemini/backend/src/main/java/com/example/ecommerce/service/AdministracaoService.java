package com.example.ecommerce.service;

import com.example.ecommerce.entity.Categoria;
import com.example.ecommerce.entity.Produto;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdministracaoService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public Produto cadastrarProduto(Produto produto) {
        if (produto.getAtivo() == null) {
            produto.ativar();
        }
        return productRepository.save(produto);
    }

    @Transactional
    public Produto editarProduto(Long produtoId, Produto dados) {
        Produto produto = productRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado com id: " + produtoId));
        
        produto.atualizarDados(
                dados.getNome(),
                dados.getDescricao(),
                dados.getPreco(),
                dados.getImagemUrl(),
                dados.getCategoria()
        );
        
        if (dados.getAtivo() != null) {
            if (dados.getAtivo()) {
                produto.ativar();
            } else {
                produto.desativar();
            }
        }
        
        // Also update stock
        if (dados.getQuantidadeEstoque() != null) {
            if (dados.getQuantidadeEstoque() < 0) {
                throw new IllegalArgumentException("Quantidade em estoque deve ser maior ou igual a zero");
            }
            produto.setQuantidadeEstoque(dados.getQuantidadeEstoque());
        }

        return productRepository.save(produto);
    }

    @Transactional
    public void desativarProduto(Long produtoId) {
        Produto produto = productRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado com id: " + produtoId));
        produto.desativar();
        productRepository.save(produto);
    }

    @Transactional
    public Categoria cadastrarCategoria(Categoria categoria) {
        if (categoryRepository.existsByNome(categoria.getNome())) {
            throw new IllegalArgumentException("Categoria com esse nome ja existe");
        }
        return categoryRepository.save(categoria);
    }

    @Transactional
    public Categoria editarCategoria(Long categoriaId, Categoria dados) {
        Categoria categoria = categoryRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria nao encontrada com id: " + categoriaId));
        
        categoria.atualizarDados(dados.getNome(), dados.getDescricao());
        return categoryRepository.save(categoria);
    }
}
