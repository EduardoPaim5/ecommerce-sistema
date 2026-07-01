package com.ecommerce.service;

import com.ecommerce.domain.Carrinho;
import com.ecommerce.domain.EncoderSenha;
import com.ecommerce.domain.PapelUsuario;
import com.ecommerce.domain.Usuario;
import com.ecommerce.domain.exception.RecursoNaoEncontradoException;
import com.ecommerce.domain.exception.RegraNegocioException;
import com.ecommerce.repository.CarrinhoRepository;
import com.ecommerce.repository.UsuarioRepository;
import com.ecommerce.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Casos de uso de autenticacao e contas (RF01-RF05).
 */
@Service
public class AutenticacaoService {

    private final UsuarioRepository usuarioRepository;
    private final CarrinhoRepository carrinhoRepository;
    private final EncoderSenha encoderSenha;
    private final JwtService jwtService;

    public AutenticacaoService(UsuarioRepository usuarioRepository,
                               CarrinhoRepository carrinhoRepository,
                               EncoderSenha encoderSenha,
                               JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.carrinhoRepository = carrinhoRepository;
        this.encoderSenha = encoderSenha;
        this.jwtService = jwtService;
    }

    /** Cadastro de um novo cliente (RF01); valida unicidade de email (RF02). */
    @Transactional
    public Usuario cadastrar(String nome, String email, String senha) {
        String emailNormalizado = normalizarEmail(email);
        if (usuarioRepository.existsByEmail(emailNormalizado)) {
            throw new RegraNegocioException("Ja existe um usuario com este email.");
        }
        Usuario usuario = new Usuario(nome, emailNormalizado, gerarHashSenha(senha), PapelUsuario.CLIENTE);
        usuario = usuarioRepository.save(usuario);
        // Um usuario possui exatamente um carrinho ativo (diagrama de dominio).
        carrinhoRepository.save(new Carrinho(usuario.getId()));
        return usuario;
    }

    /** Login com email e senha, retornando uma sessao/token (RF03). */
    @Transactional(readOnly = true)
    public Sessao login(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmail(normalizarEmail(email))
                .orElseThrow(() -> new BadCredentialsException("Email ou senha invalidos."));
        if (!usuario.verificarSenha(senha, encoderSenha)) {
            throw new BadCredentialsException("Email ou senha invalidos.");
        }
        JwtService.TokenGerado token = jwtService.gerarToken(usuario);
        return new Sessao(
                token.token(),
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPapel(),
                token.expiraEm());
    }

    /**
     * Logout (RF04). A sessao e baseada em JWT stateless, portanto o logout e
     * concluido no cliente descartando o token; este metodo existe para
     * completar o caso de uso do diagrama de servicos.
     */
    public void logout(Sessao sessao) {
        // Nada a invalidar no servidor para tokens stateless.
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));
    }

    private String gerarHashSenha(String senha) {
        if (senha == null || senha.length() < 6) {
            throw new RegraNegocioException("A senha deve ter ao menos 6 caracteres.");
        }
        return encoderSenha.codificar(senha);
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
