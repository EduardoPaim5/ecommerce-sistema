package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Produto;
import com.example.ecommerce.service.CatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/catalogo/produtos")
@RequiredArgsConstructor
public class ProductController {

    private final CatalogoService catalogoService;

    @GetMapping
    public ResponseEntity<List<Produto>> listarProdutos(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Long categoriaId) {
        
        if (categoriaId != null) {
            return ResponseEntity.ok(catalogoService.filtrarProdutosPorCategoria(categoriaId));
        } else if (busca != null && !busca.trim().isEmpty()) {
            return ResponseEntity.ok(catalogoService.buscarProdutosPorNome(busca));
        } else {
            return ResponseEntity.ok(catalogoService.listarProdutosAtivos());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> obterDetalhe(@PathVariable Long id) {
        return ResponseEntity.ok(catalogoService.obterDetalheProduto(id));
    }
}
