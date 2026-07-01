package com.example.ecommerce.service;

import com.example.ecommerce.entity.*;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CarrinhoService carrinhoService;

    @Transactional
    public Pedido finalizarCompra(Usuario usuario, Endereco endereco) {
        Carrinho carrinho = carrinhoService.obterCarrinho(usuario);
        
        if (carrinho.estaVazio()) {
            throw new IllegalStateException("Nao e possivel finalizar compra com o carrinho vazio");
        }

        // Validate stock for all items before creating the order
        for (ItemCarrinho item : carrinho.getItens()) {
            Produto produto = item.getProduto();
            if (!produto.temEstoque(item.getQuantidade())) {
                throw new IllegalArgumentException("Estoque insuficiente para o produto: " + produto.getNome() + 
                        " (Solicitado: " + item.getQuantidade() + ", Disponivel: " + produto.getQuantidadeEstoque() + ")");
            }
        }

        Pedido pedido = Pedido.builder()
                .usuarioId(usuario.getId())
                .enderecoEntrega(endereco)
                .status(StatusPedido.AGUARDANDO_PAGAMENTO)
                .valorTotal(carrinho.calcularTotal())
                .itens(new ArrayList<>())
                .build();

        // Save order first to generate ID
        pedido = orderRepository.save(pedido);

        List<ItemPedido> itensPedido = new ArrayList<>();
        for (ItemCarrinho item : carrinho.getItens()) {
            ItemPedido itemPedido = ItemPedido.criarSnapshot(item, item.getProduto());
            itemPedido.setPedido(pedido);
            itensPedido.add(itemPedido);
        }
        pedido.setItens(itensPedido);
        pedido = orderRepository.save(pedido);

        // Clear the cart
        carrinho.limpar();
        cartRepository.save(carrinho);

        return pedido;
    }

    public ResultadoPagamento simularPagamento(Pedido pedido) {
        // Randomly simulate approval (80% chance of success)
        double rand = new Random().nextDouble();
        return rand < 0.85 ? ResultadoPagamento.APROVADO : ResultadoPagamento.RECUSADO;
    }
}
