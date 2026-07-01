package com.ecommerce.service;

import com.ecommerce.domain.Categoria;
import com.ecommerce.domain.Produto;
import com.ecommerce.domain.exception.RecursoNaoEncontradoException;
import com.ecommerce.repository.CategoriaRepository;
import com.ecommerce.repository.ProdutoRepository;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Casos de uso de administracao de catalogo (RF22-RF23). As validacoes de
 * estoque/preco ficam no agregado Produto.
 */
@Service
@Transactional
public class AdministracaoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public AdministracaoService(ProdutoRepository produtoRepository,
                                CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    /** Cadastra um novo produto (RF22). */
    public Produto cadastrarProduto(String nome, String descricao, BigDecimal preco, String imagemUrl,
                                    Integer quantidadeEstoque, Long categoriaId) {
        Categoria categoria = buscarCategoria(categoriaId);
        Produto produto = new Produto(nome, descricao, imagemUrl, preco, quantidadeEstoque, categoria);
        return produtoRepository.save(produto);
    }

    /** Edita um produto existente (RF22). */
    public Produto editarProduto(Long produtoId, String nome, String descricao, BigDecimal preco,
                                 String imagemUrl, Integer quantidadeEstoque, Long categoriaId, boolean ativo) {
        Produto produto = buscarProduto(produtoId);
        Categoria categoria = buscarCategoria(categoriaId);
        produto.atualizarDados(nome, descricao, preco, imagemUrl, categoria);
        produto.ajustarEstoque(quantidadeEstoque);
        if (ativo) {
            produto.ativar();
        } else {
            produto.desativar();
        }
        return produtoRepository.save(produto);
    }

    /** Desativa um produto; ele some do catalogo mas e preservado em pedidos antigos (RF22/RN04). */
    public void desativarProduto(Long produtoId) {
        Produto produto = buscarProduto(produtoId);
        produto.desativar();
        produtoRepository.save(produto);
    }

    /** Cadastra uma nova categoria (RF23). */
    public Categoria cadastrarCategoria(String nome, String descricao) {
        return categoriaRepository.save(new Categoria(nome, descricao));
    }

    /** Edita uma categoria existente (RF23). */
    public Categoria editarCategoria(Long categoriaId, String nome, String descricao) {
        Categoria categoria = buscarCategoria(categoriaId);
        categoria.atualizarDados(nome, descricao);
        return categoriaRepository.save(categoria);
    }

    @Transactional(readOnly = true)
    public java.util.List<Produto> listarTodosProdutos() {
        return produtoRepository.findAll();
    }

    private Produto buscarProduto(Long produtoId) {
        return produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
    }

    private Categoria buscarCategoria(Long categoriaId) {
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria nao encontrada."));
    }
}
