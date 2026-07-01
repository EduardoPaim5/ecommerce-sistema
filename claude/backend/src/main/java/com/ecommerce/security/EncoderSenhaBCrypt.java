package com.ecommerce.security;

import com.ecommerce.domain.EncoderSenha;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Adaptador que conecta a abstracao de dominio {@link EncoderSenha} ao
 * {@link PasswordEncoder} (BCrypt) do Spring Security (RF05).
 */
@Component
public class EncoderSenhaBCrypt implements EncoderSenha {

    private final PasswordEncoder passwordEncoder;

    public EncoderSenhaBCrypt(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public String codificar(String senhaPlana) {
        return passwordEncoder.encode(senhaPlana);
    }

    @Override
    public boolean corresponde(String senhaPlana, String hash) {
        return passwordEncoder.matches(senhaPlana, hash);
    }
}
