package com.ecommerce.web;

import com.ecommerce.domain.Usuario;
import com.ecommerce.security.UsuarioAutenticado;
import com.ecommerce.service.PedidoService;
import com.ecommerce.web.dto.Responses.PedidoResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de pedidos do cliente autenticado (RF21).
 */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<PedidoResponse> meusPedidos() {
        Usuario usuario = UsuarioAutenticado.obrigatorio();
        return pedidoService.listarPedidosDoCliente(usuario).stream()
                .map(PedidoResponse::de)
                .toList();
    }

    @GetMapping("/{id}")
    public PedidoResponse detalhe(@PathVariable Long id) {
        Usuario usuario = UsuarioAutenticado.obrigatorio();
        return PedidoResponse.de(pedidoService.obterPedido(usuario, id));
    }
}
