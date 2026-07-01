package com.ecommerce.web.dto;

import com.ecommerce.domain.Carrinho;
import com.ecommerce.domain.Categoria;
import com.ecommerce.domain.Endereco;
import com.ecommerce.domain.ItemCarrinho;
import com.ecommerce.domain.ItemPedido;
import com.ecommerce.domain.Pedido;
import com.ecommerce.domain.Produto;
import com.ecommerce.domain.Usuario;
import com.ecommerce.service.Sessao;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Agrupa os DTOs de saida (responses) e a conversao a partir das entidades de dominio.
 */
public final class Responses {

    private Responses() {
    }

    public record UsuarioResponse(Long id, String nome, String email, String papel) {
        public static UsuarioResponse de(Usuario u) {
            return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPapel().name());
        }
    }

    public record SessaoResponse(String token, Long usuarioId, String nome, String email,
                                 String papel, Instant expiraEm) {
        public static SessaoResponse de(Sessao s) {
            return new SessaoResponse(s.token(), s.usuarioId(), s.nome(), s.email(),
                    s.papel().name(), s.expiraEm());
        }
    }

    public record CategoriaResponse(Long id, String nome, String descricao) {
        public static CategoriaResponse de(Categoria c) {
            return new CategoriaResponse(c.getId(), c.getNome(), c.getDescricao());
        }
    }

    public record ProdutoResponse(Long id, String nome, String descricao, String imagemUrl,
                                  BigDecimal preco, Integer quantidadeEstoque, boolean ativo,
                                  boolean disponivel, CategoriaResponse categoria) {
        public static ProdutoResponse de(Produto p) {
            return new ProdutoResponse(p.getId(), p.getNome(), p.getDescricao(), p.getImagemUrl(),
                    p.getPreco(), p.getQuantidadeEstoque(), p.isAtivo(), p.disponivel(),
                    CategoriaResponse.de(p.getCategoria()));
        }
    }

    public record ItemCarrinhoResponse(Long produtoId, String nomeProduto, String imagemUrl,
                                       Integer quantidade, BigDecimal precoUnitario, BigDecimal subtotal,
                                       Integer estoqueDisponivel) {
        public static ItemCarrinhoResponse de(ItemCarrinho i) {
            Produto p = i.getProduto();
            return new ItemCarrinhoResponse(p.getId(), p.getNome(), p.getImagemUrl(),
                    i.getQuantidade(), i.getPrecoUnitario(), i.calcularSubtotal(), p.getQuantidadeEstoque());
        }
    }

    public record CarrinhoResponse(Long id, List<ItemCarrinhoResponse> itens, BigDecimal total,
                                   boolean vazio) {
        public static CarrinhoResponse de(Carrinho c) {
            List<ItemCarrinhoResponse> itens = c.getItens().stream()
                    .map(ItemCarrinhoResponse::de)
                    .toList();
            return new CarrinhoResponse(c.getId(), itens, c.calcularTotal(), c.estaVazio());
        }
    }

    public record EnderecoResponse(String cep, String logradouro, String numero, String complemento,
                                   String cidade, String estado) {
        public static EnderecoResponse de(Endereco e) {
            if (e == null) {
                return null;
            }
            return new EnderecoResponse(e.getCep(), e.getLogradouro(), e.getNumero(),
                    e.getComplemento(), e.getCidade(), e.getEstado());
        }
    }

    public record ItemPedidoResponse(Long produtoId, String nomeProduto, Integer quantidade,
                                     BigDecimal precoUnitario, BigDecimal subtotal) {
        public static ItemPedidoResponse de(ItemPedido i) {
            return new ItemPedidoResponse(i.getProdutoId(), i.getNomeProduto(), i.getQuantidade(),
                    i.getPrecoUnitario(), i.getSubtotal());
        }
    }

    public record PedidoResponse(Long id, Long usuarioId, List<ItemPedidoResponse> itens,
                                 EnderecoResponse enderecoEntrega, BigDecimal valorTotal,
                                 String status, LocalDateTime dataCriacao) {
        public static PedidoResponse de(Pedido p) {
            List<ItemPedidoResponse> itens = p.getItens().stream()
                    .map(ItemPedidoResponse::de)
                    .toList();
            return new PedidoResponse(p.getId(), p.getUsuarioId(), itens,
                    EnderecoResponse.de(p.getEnderecoEntrega()), p.getValorTotal(),
                    p.getStatus().name(), p.getDataCriacao());
        }
    }

    public record MensagemResponse(String mensagem) {
    }
}
