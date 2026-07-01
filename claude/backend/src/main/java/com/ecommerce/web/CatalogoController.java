package com.ecommerce.web;

import com.ecommerce.service.CatalogoService;
import com.ecommerce.web.dto.Responses.CategoriaResponse;
import com.ecommerce.web.dto.Responses.ProdutoResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints publicos do catalogo (RF06-RF10) acessiveis ao visitante.
 */
@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    /** Lista produtos ativos, com busca por nome (RF07) e filtro por categoria (RF08). */
    @GetMapping("/produtos")
    public List<ProdutoResponse> listarProdutos(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long categoriaId) {
        var produtos = categoriaId != null
                ? catalogoService.filtrarProdutosPorCategoria(categoriaId)
                : catalogoService.buscarProdutosPorNome(nome);
        return produtos.stream().map(ProdutoResponse::de).toList();
    }

    @GetMapping("/produtos/{id}")
    public ProdutoResponse detalhe(@PathVariable Long id) {
        return ProdutoResponse.de(catalogoService.obterDetalheProduto(id));
    }

    @GetMapping("/categorias")
    public List<CategoriaResponse> listarCategorias() {
        return catalogoService.listarCategorias().stream().map(CategoriaResponse::de).toList();
    }
}
