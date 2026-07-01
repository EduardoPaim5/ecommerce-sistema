package com.ecommerce.service;

import com.ecommerce.domain.Carrinho;
import com.ecommerce.domain.Produto;
import com.ecommerce.domain.Usuario;
import com.ecommerce.domain.exception.RecursoNaoEncontradoException;
import com.ecommerce.repository.CarrinhoRepository;
import com.ecommerce.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Casos de uso do carrinho de compras (RF11-RF15). O service orquestra; as
 * regras (validacao de estoque, calculo de total) ficam no agregado Carrinho.
 */
@Service
@Transactional
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ProdutoRepository produtoRepository;

    public CarrinhoService(CarrinhoRepository carrinhoRepository, ProdutoRepository produtoRepository) {
        this.carrinhoRepository = carrinhoRepository;
        this.produtoRepository = produtoRepository;
    }

    /** Obtem o carrinho ativo do usuario, criando-o caso ainda nao exista. */
    public Carrinho obterCarrinho(Usuario usuario) {
        return carrinhoRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> carrinhoRepository.save(new Carrinho(usuario.getId())));
    }

    /** Adiciona um item ao carrinho (RF11). */
    public Carrinho adicionarItem(Usuario usuario, Long produtoId, Integer quantidade) {
        Carrinho carrinho = obterCarrinho(usuario);
        Produto produto = buscarProdutoAtivo(produtoId);
        carrinho.adicionarProduto(produto, quantidade);
        return carrinhoRepository.save(carrinho);
    }

    /** Altera a quantidade de um item (RF12). */
    public Carrinho alterarQuantidade(Usuario usuario, Long produtoId, Integer quantidade) {
        Carrinho carrinho = obterCarrinho(usuario);
        Produto produto = buscarProdutoAtivo(produtoId);
        carrinho.alterarQuantidade(produto, quantidade);
        return carrinhoRepository.save(carrinho);
    }

    /** Remove um item do carrinho (RF13). */
    public Carrinho removerItem(Usuario usuario, Long produtoId) {
        Carrinho carrinho = obterCarrinho(usuario);
        Produto produto = buscarProdutoAtivo(produtoId);
        carrinho.removerProduto(produto);
        return carrinhoRepository.save(carrinho);
    }

    private Produto buscarProdutoAtivo(Long produtoId) {
        return produtoRepository.findById(produtoId)
                .filter(Produto::isAtivo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
    }
}
