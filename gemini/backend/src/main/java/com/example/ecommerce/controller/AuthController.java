package com.example.ecommerce.controller;

import com.example.ecommerce.dto.AuthDtos;
import com.example.ecommerce.entity.Usuario;
import com.example.ecommerce.service.AutenticacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AutenticacaoService autenticacaoService;

    @PostMapping("/cadastro")
    public ResponseEntity<Usuario> cadastrar(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        Usuario usuario = autenticacaoService.cadastrar(request.getNome(), request.getEmail(), request.getSenha());
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.SessionResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        AutenticacaoService.Sessao sessao = autenticacaoService.login(request.getEmail(), request.getSenha());
        
        AuthDtos.SessionResponse response = AuthDtos.SessionResponse.builder()
                .token(sessao.getToken())
                .usuarioId(sessao.getUsuarioId())
                .expiraEm(sessao.getExpiraEm())
                .nome(sessao.getUsuario().getNome())
                .email(sessao.getUsuario().getEmail())
                .papel(sessao.getUsuario().getPapel())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}
