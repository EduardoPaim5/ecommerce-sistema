package com.ecommerce.web;

import com.ecommerce.domain.Categoria;
import com.ecommerce.domain.Produto;
import com.ecommerce.domain.StatusPedido;
import com.ecommerce.domain.Usuario;
import com.ecommerce.domain.exception.RegraNegocioException;
import com.ecommerce.security.UsuarioAutenticado;
import com.ecommerce.service.AdministracaoService;
import com.ecommerce.service.CatalogoService;
import com.ecommerce.service.PedidoService;
import com.ecommerce.web.dto.Requests.AtualizarStatusRequest;
import com.ecommerce.web.dto.Requests.CategoriaRequest;
import com.ecommerce.web.dto.Requests.ProdutoRequest;
import com.ecommerce.web.dto.Responses.CategoriaResponse;
import com.ecommerce.web.dto.Responses.MensagemResponse;
import com.ecommerce.web.dto.Responses.PedidoResponse;
import com.ecommerce.web.dto.Responses.ProdutoResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints administrativos: gestao de catalogo e pedidos (RF22-RF25).
 * Protegido por ROLE_ADMIN na configuracao de seguranca.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdministracaoService administracaoService;
    private final CatalogoService catalogoService;
    private final PedidoService pedidoService;

    public AdminController(AdministracaoService administracaoService,
                          CatalogoService catalogoService,
                          PedidoService pedidoService) {
        this.administracaoService = administracaoService;
        this.catalogoService = catalogoService;
        this.pedidoService = pedidoService;
    }

    // ----- Produtos (RF22) -----

    @GetMapping("/produtos")
    public List<ProdutoResponse> listarProdutos() {
        return administracaoService.listarTodosProdutos().stream().map(ProdutoResponse::de).toList();
    }

    @PostMapping("/produtos")
    public ResponseEntity<ProdutoResponse> cadastrarProduto(@Valid @RequestBody ProdutoRequest req) {
        Produto produto = administracaoService.cadastrarProduto(req.nome(), req.descricao(),
                req.preco(), req.imagemUrl(), req.quantidadeEstoque(), req.categoriaId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ProdutoResponse.de(produto));
    }

    @PutMapping("/produtos/{id}")
    public ProdutoResponse editarProduto(@PathVariable Long id, @Valid @RequestBody ProdutoRequest req) {
        boolean ativo = req.ativo() == null || req.ativo();
        Produto produto = administracaoService.editarProduto(id, req.nome(), req.descricao(),
                req.preco(), req.imagemUrl(), req.quantidadeEstoque(), req.categoriaId(), ativo);
        return ProdutoResponse.de(produto);
    }

    @DeleteMapping("/produtos/{id}")
    public MensagemResponse desativarProduto(@PathVariable Long id) {
        administracaoService.desativarProduto(id);
        return new MensagemResponse("Produto desativado.");
    }

    // ----- Categorias (RF23) -----

    @GetMapping("/categorias")
    public List<CategoriaResponse> listarCategorias() {
        return catalogoService.listarCategorias().stream().map(CategoriaResponse::de).toList();
    }

    @PostMapping("/categorias")
    public ResponseEntity<CategoriaResponse> cadastrarCategoria(@Valid @RequestBody CategoriaRequest req) {
        Categoria categoria = administracaoService.cadastrarCategoria(req.nome(), req.descricao());
        return ResponseEntity.status(HttpStatus.CREATED).body(CategoriaResponse.de(categoria));
    }

    @PutMapping("/categorias/{id}")
    public CategoriaResponse editarCategoria(@PathVariable Long id, @Valid @RequestBody CategoriaRequest req) {
        Categoria categoria = administracaoService.editarCategoria(id, req.nome(), req.descricao());
        return CategoriaResponse.de(categoria);
    }

    // ----- Pedidos (RF24-RF25) -----

    @GetMapping("/pedidos")
    public List<PedidoResponse> listarPedidos() {
        Usuario admin = UsuarioAutenticado.obrigatorio();
        return pedidoService.listarTodosPedidos(admin).stream().map(PedidoResponse::de).toList();
    }

    @PatchMapping("/pedidos/{id}/status")
    public PedidoResponse atualizarStatus(@PathVariable Long id,
                                          @Valid @RequestBody AtualizarStatusRequest req) {
        Usuario admin = UsuarioAutenticado.obrigatorio();
        StatusPedido novoStatus = parseStatus(req.status());
        return PedidoResponse.de(pedidoService.atualizarStatus(admin, id, novoStatus));
    }

    private StatusPedido parseStatus(String status) {
        try {
            return StatusPedido.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RegraNegocioException("Status invalido: " + status);
        }
    }
}
