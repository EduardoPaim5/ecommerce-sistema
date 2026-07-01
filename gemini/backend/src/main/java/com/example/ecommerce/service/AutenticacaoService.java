package com.example.ecommerce.service;

import com.example.ecommerce.config.JwtUtils;
import com.example.ecommerce.entity.Carrinho;
import com.example.ecommerce.entity.PapelUsuario;
import com.example.ecommerce.entity.Usuario;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AutenticacaoService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public Usuario cadastrar(String nome, String email, String senha) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email ja cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(nome)
                .email(email)
                .senhaHash(gerarHashSenha(senha))
                .papel(PapelUsuario.CLIENTE) // default role is CLIENTE
                .build();

        usuario = userRepository.save(usuario);

        // Every user has a Carrinho active (RF11/2.1 relations)
        Carrinho carrinho = Carrinho.builder()
                .usuarioId(usuario.getId())
                .jsonAtualizadoEm(LocalDateTime.now())
                .build();
        cartRepository.save(carrinho);

        return usuario;
    }

    public Sessao login(String email, String senha) {
        Usuario usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciais invalidas"));

        if (!usuario.verificarSenha(senha, passwordEncoder)) {
            throw new IllegalArgumentException("Credenciais invalidas");
        }

        String token = jwtUtils.generateToken(usuario.getEmail(), usuario.getPapel().name());
        LocalDateTime expiraEm = LocalDateTime.now().plusDays(1); // 1 day expiration

        return new Sessao(token, usuario.getId(), expiraEm, usuario);
    }

    public void logout(Sessao sessao) {
        // In a stateless JWT auth, logout is typically handled client-side by deleting the token.
        // We can implement a blacklist or just make this a no-op / log it.
    }

    private String gerarHashSenha(String senha) {
        return passwordEncoder.encode(senha);
    }

    @Getter
    @Setter
    public static class Sessao {
        private String token;
        private Long usuarioId;
        private LocalDateTime expiraEm;
        private Usuario usuario;

        public Sessao(String token, Long usuarioId, LocalDateTime expiraEm, Usuario usuario) {
            this.token = token;
            this.usuarioId = usuarioId;
            this.expiraEm = expiraEm;
            this.usuario = usuario;
        }
    }
}
