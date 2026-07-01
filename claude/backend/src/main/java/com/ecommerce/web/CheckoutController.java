package com.ecommerce.web;

import com.ecommerce.domain.Endereco;
import com.ecommerce.domain.Pedido;
import com.ecommerce.domain.Usuario;
import com.ecommerce.security.UsuarioAutenticado;
import com.ecommerce.service.CheckoutService;
import com.ecommerce.web.dto.Requests.CheckoutRequest;
import com.ecommerce.web.dto.Requests.EnderecoRequest;
import com.ecommerce.web.dto.Responses.PedidoResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de checkout (RF16-RF20).
 */
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> finalizar(@Valid @RequestBody CheckoutRequest req) {
        Usuario usuario = UsuarioAutenticado.obrigatorio();
        EnderecoRequest e = req.endereco();
        Endereco endereco = new Endereco(e.cep(), e.logradouro(), e.numero(),
                e.complemento(), e.cidade(), e.estado());
        Pedido pedido = checkoutService.finalizarCompra(usuario, endereco);
        return ResponseEntity.status(HttpStatus.CREATED).body(PedidoResponse.de(pedido));
    }
}
