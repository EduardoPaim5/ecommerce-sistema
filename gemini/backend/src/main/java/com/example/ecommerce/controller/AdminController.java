package com.example.ecommerce.controller;

import com.example.ecommerce.dto.AdminDtos;
import com.example.ecommerce.dto.OrderDtos;
import com.example.ecommerce.entity.*;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.service.AdministracaoService;
import com.example.ecommerce.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdministracaoService administracaoService;
    private final PedidoService pedidoService;
    private final CategoryRepository categoryRepository;

    // --- PRODUTOS ---

    @PostMapping("/produtos")
    public ResponseEntity<Produto> cadastrarProduto(
            @Valid @RequestBody AdminDtos.ProductRequest request) {
        
        Categoria categoria = categoryRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria nao encontrada com id: " + request.getCategoriaId()));
                
        Produto produto = Produto.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .preco(request.getPreco())
                .imagemUrl(request.getImagemUrl())
                .quantidadeEstoque(request.getQuantidadeEstoque())
                .ativo(request.getAtivo())
                .categoria(categoria)
                .build();
                
        return ResponseEntity.ok(administracaoService.cadastrarProduto(produto));
    }

    @PutMapping("/produtos/{id}")
    public ResponseEntity<Produto> editarProduto(
            @PathVariable Long id,
            @Valid @RequestBody AdminDtos.ProductRequest request) {
            
        Categoria categoria = categoryRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria nao encontrada com id: " + request.getCategoriaId()));
                
        Produto produto = Produto.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .preco(request.getPreco())
                .imagemUrl(request.getImagemUrl())
                .quantidadeEstoque(request.getQuantidadeEstoque())
                .ativo(request.getAtivo())
                .categoria(categoria)
                .build();
                
        return ResponseEntity.ok(administracaoService.editarProduto(id, produto));
    }

    @DeleteMapping("/produtos/{id}")
    public ResponseEntity<Void> desativarProduto(@PathVariable Long id) {
        administracaoService.desativarProduto(id);
        return ResponseEntity.ok().build();
    }

    // --- CATEGORIAS ---

    @PostMapping("/categorias")
    public ResponseEntity<Categoria> cadastrarCategoria(
            @Valid @RequestBody AdminDtos.CategoryRequest request) {
            
        Categoria categoria = Categoria.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .build();
                
        return ResponseEntity.ok(administracaoService.cadastrarCategoria(categoria));
    }

    @PutMapping("/categorias/{id}")
    public ResponseEntity<Categoria> editarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody AdminDtos.CategoryRequest request) {
            
        Categoria categoria = Categoria.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .build();
                
        return ResponseEntity.ok(administracaoService.editarCategoria(id, categoria));
    }

    // --- PEDIDOS ---

    @GetMapping("/pedidos")
    public ResponseEntity<List<Pedido>> listarTodosPedidos(@AuthenticationPrincipal Usuario admin) {
        return ResponseEntity.ok(pedidoService.listarTodosPedidos(admin));
    }

    @PutMapping("/pedidos/{id}/status")
    public ResponseEntity<Pedido> atualizarStatus(
            @AuthenticationPrincipal Usuario admin,
            @PathVariable Long id,
            @Valid @RequestBody OrderDtos.OrderStatusRequest request) {
            
        StatusPedido status = StatusPedido.valueOf(request.getStatus().toUpperCase());
        return ResponseEntity.ok(pedidoService.atualizarStatus(admin, id, status));
    }
}
