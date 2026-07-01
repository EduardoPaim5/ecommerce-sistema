package com.ecommerce.web;

import com.ecommerce.domain.Usuario;
import com.ecommerce.security.UsuarioAutenticado;
import com.ecommerce.service.CarrinhoService;
import com.ecommerce.web.dto.Requests.AdicionarItemRequest;
import com.ecommerce.web.dto.Requests.AlterarQuantidadeRequest;
import com.ecommerce.web.dto.Responses.CarrinhoResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints do carrinho do cliente autenticado (RF11-RF15).
 */
@RestController
@RequestMapping("/api/carrinho")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    @GetMapping
    public CarrinhoResponse obter() {
        Usuario usuario = UsuarioAutenticado.obrigatorio();
        return CarrinhoResponse.de(carrinhoService.obterCarrinho(usuario));
    }

    @PostMapping("/itens")
    public CarrinhoResponse adicionar(@Valid @RequestBody AdicionarItemRequest req) {
        Usuario usuario = UsuarioAutenticado.obrigatorio();
        return CarrinhoResponse.de(
                carrinhoService.adicionarItem(usuario, req.produtoId(), req.quantidade()));
    }

    @PutMapping("/itens/{produtoId}")
    public CarrinhoResponse alterar(@PathVariable Long produtoId,
                                    @Valid @RequestBody AlterarQuantidadeRequest req) {
        Usuario usuario = UsuarioAutenticado.obrigatorio();
        return CarrinhoResponse.de(
                carrinhoService.alterarQuantidade(usuario, produtoId, req.quantidade()));
    }

    @DeleteMapping("/itens/{produtoId}")
    public CarrinhoResponse remover(@PathVariable Long produtoId) {
        Usuario usuario = UsuarioAutenticado.obrigatorio();
        return CarrinhoResponse.de(carrinhoService.removerItem(usuario, produtoId));
    }
}
