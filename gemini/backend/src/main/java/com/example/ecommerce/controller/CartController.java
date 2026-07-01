package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CartDtos;
import com.example.ecommerce.entity.Carrinho;
import com.example.ecommerce.entity.Usuario;
import com.example.ecommerce.service.CarrinhoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrinho")
@RequiredArgsConstructor
public class CartController {

    private final CarrinhoService carrinhoService;

    @GetMapping
    public ResponseEntity<Carrinho> obterCarrinho(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carrinhoService.obterCarrinho(usuario));
    }

    @PostMapping("/itens")
    public ResponseEntity<Carrinho> adicionarItem(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CartDtos.CartItemRequest request) {
        return ResponseEntity.ok(carrinhoService.adicionarItem(usuario, request.getProdutoId(), request.getQuantidade()));
    }

    @PutMapping("/itens")
    public ResponseEntity<Carrinho> alterarQuantidade(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CartDtos.CartItemRequest request) {
        return ResponseEntity.ok(carrinhoService.alterarQuantidade(usuario, request.getProdutoId(), request.getQuantidade()));
    }

    @DeleteMapping("/itens/{produtoId}")
    public ResponseEntity<Carrinho> removerItem(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long produtoId) {
        return ResponseEntity.ok(carrinhoService.removerItem(usuario, produtoId));
    }
}
