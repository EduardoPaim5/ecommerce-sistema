package com.ecommerce.security;

import com.ecommerce.domain.Usuario;
import com.ecommerce.domain.exception.AcessoNegadoException;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilitario para obter o usuario autenticado no contexto de seguranca atual.
 */
public final class UsuarioAutenticado {

    private UsuarioAutenticado() {
    }

    public static Usuario obrigatorio() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Usuario usuario) {
            return usuario;
        }
        throw new AcessoNegadoException("Usuario nao autenticado.");
    }
}
