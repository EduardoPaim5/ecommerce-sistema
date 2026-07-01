package com.ecommerce.service;

import com.ecommerce.domain.Categoria;
import com.ecommerce.domain.Produto;
import com.ecommerce.domain.exception.RecursoNaoEncontradoException;
import com.ecommerce.repository.CategoriaRepository;
import com.ecommerce.repository.ProdutoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Casos de uso do catalogo de produtos (RF06-RF10).
 */
@Service
@Transactional(readOnly = true)
public class CatalogoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public CatalogoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    /** Lista todas as categorias (apoio ao filtro do catalogo, RF08). */
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    /** Lista os produtos ativos (RF06). */
    public List<Produto> listarProdutosAtivos() {
        return produtoRepository.findByAtivoTrueOrderByNomeAsc();
    }

    /** Busca produtos ativos por nome (RF07). */
    public List<Produto> buscarProdutosPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            return listarProdutosAtivos();
        }
        return produtoRepository.findByAtivoTrueAndNomeContainingIgnoreCaseOrderByNomeAsc(nome.trim());
    }

    /** Filtra produtos ativos por categoria (RF08). */
    public List<Produto> filtrarProdutosPorCategoria(Long categoriaId) {
        return produtoRepository.findByAtivoTrueAndCategoriaIdOrderByNomeAsc(categoriaId);
    }

    /** Detalhe de um produto (RF09). */
    public Produto obterDetalheProduto(Long produtoId) {
        return produtoRepository.findById(produtoId)
                .filter(Produto::isAtivo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
    }
}
