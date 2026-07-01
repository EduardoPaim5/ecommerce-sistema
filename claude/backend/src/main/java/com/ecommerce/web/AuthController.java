package com.ecommerce.web;

import com.ecommerce.domain.Usuario;
import com.ecommerce.security.UsuarioAutenticado;
import com.ecommerce.service.AutenticacaoService;
import com.ecommerce.service.Sessao;
import com.ecommerce.web.dto.Requests.CadastroRequest;
import com.ecommerce.web.dto.Requests.LoginRequest;
import com.ecommerce.web.dto.Responses.SessaoResponse;
import com.ecommerce.web.dto.Responses.UsuarioResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de autenticacao e contas (RF01-RF05).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AutenticacaoService autenticacaoService;

    public AuthController(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroRequest req) {
        Usuario usuario = autenticacaoService.cadastrar(req.nome(), req.email(), req.senha());
        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.de(usuario));
    }

    @PostMapping("/login")
    public SessaoResponse login(@Valid @RequestBody LoginRequest req) {
        Sessao sessao = autenticacaoService.login(req.email(), req.senha());
        return SessaoResponse.de(sessao);
    }

    @GetMapping("/eu")
    public UsuarioResponse eu() {
        return UsuarioResponse.de(UsuarioAutenticado.obrigatorio());
    }
}
