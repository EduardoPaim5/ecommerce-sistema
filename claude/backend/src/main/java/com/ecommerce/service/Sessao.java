package com.ecommerce.service;

import com.ecommerce.domain.PapelUsuario;
import java.time.Instant;

/**
 * Sessao retornada apos o login (diagrama de servicos): token, identificacao
 * do usuario e instante de expiracao.
 */
public record Sessao(
        String token,
        Long usuarioId,
        String nome,
        String email,
        PapelUsuario papel,
        Instant expiraEm) {
}
