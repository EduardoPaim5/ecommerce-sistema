package com.ecommerce.security;

import com.ecommerce.domain.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Geracao e validacao de tokens JWT usados como sessao do usuario (RF03/RF04).
 */
@Service
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoMinutos;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secretBase64,
            @Value("${app.security.jwt.expiration-minutes}") long expiracaoMinutos) {
        this.chave = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretBase64));
        this.expiracaoMinutos = expiracaoMinutos;
    }

    public TokenGerado gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        Instant expira = agora.plus(expiracaoMinutos, ChronoUnit.MINUTES);
        String token = Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim("email", usuario.getEmail())
                .claim("papel", usuario.getPapel().name())
                .claim("nome", usuario.getNome())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expira))
                .signWith(chave)
                .compact();
        return new TokenGerado(token, expira);
    }

    public Long extrairUsuarioId(String token) {
        return Long.valueOf(parse(token).getSubject());
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Token gerado junto com seu instante de expiracao. */
    public record TokenGerado(String token, Instant expiraEm) {
    }
}
