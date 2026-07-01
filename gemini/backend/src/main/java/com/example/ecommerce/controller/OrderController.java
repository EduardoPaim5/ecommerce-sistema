package com.example.ecommerce.controller;

import com.example.ecommerce.dto.OrderDtos;
import com.example.ecommerce.entity.Pedido;
import com.example.ecommerce.entity.ResultadoPagamento;
import com.example.ecommerce.entity.Usuario;
import com.example.ecommerce.service.CheckoutService;
import com.example.ecommerce.service.PedidoService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class OrderController {

    private final CheckoutService checkoutService;
    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> finalizarCompra(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody OrderDtos.OrderRequest request) {
        Pedido pedido = checkoutService.finalizarCompra(usuario, request.getEnderecoEntrega());
        return ResponseEntity.ok(pedido);
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidosCliente(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(pedidoService.listarPedidosDoCliente(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obterDetalhe(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obterPedido(usuario, id));
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<PagamentoSimuladoResponse> pagar(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {
        
        Pedido pedido = pedidoService.obterPedido(usuario, id);
        ResultadoPagamento resultado = checkoutService.simularPagamento(pedido);
        
        Pedido pedidoAtualizado = pedidoService.processarPagamentoSimulado(usuario, id, resultado);
        
        return ResponseEntity.ok(new PagamentoSimuladoResponse(resultado, pedidoAtualizado));
    }

    @Getter
    @AllArgsConstructor
    public static class PagamentoSimuladoResponse {
        private final ResultadoPagamento resultado;
        private final Pedido pedido;
    }
}
