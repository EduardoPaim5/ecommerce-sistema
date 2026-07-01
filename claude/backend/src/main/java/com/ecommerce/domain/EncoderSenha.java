package com.ecommerce.domain;

/**
 * Abstracao de hashing de senha usada pelo dominio para manter as entidades
 * livres de dependencia direta do Spring Security (RF05).
 *
 * <p>Um adaptador na camada de seguranca implementa esta interface delegando
 * para um {@code PasswordEncoder} (BCrypt).</p>
 */
public interface EncoderSenha {

    /** Gera o hash seguro de uma senha em texto puro. */
    String codificar(String senhaPlana);

    /** Verifica se a senha em texto puro corresponde ao hash armazenado. */
    boolean corresponde(String senhaPlana, String hash);
}
