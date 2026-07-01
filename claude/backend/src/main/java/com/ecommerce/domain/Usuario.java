package com.ecommerce.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Usuario do sistema: representa clientes e administradores (diagrama de dominio).
 *
 * <p>Regras: {@code email} unico; a senha e armazenada apenas como hash em
 * {@code senhaHash} (RF05), nunca em texto puro.</p>
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PapelUsuario papel;

    @Column(name = "data_cadastro", nullable = false)
    private LocalDateTime dataCadastro;

    protected Usuario() {
        // exigido pelo JPA
    }

    public Usuario(String nome, String email, String senhaHash, PapelUsuario papel) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.papel = papel;
        this.dataCadastro = LocalDateTime.now();
    }

    /** Verifica a senha em texto puro contra o hash armazenado (RF05). */
    public boolean verificarSenha(String senhaPlana, EncoderSenha encoder) {
        return encoder.corresponde(senhaPlana, this.senhaHash);
    }

    public boolean ehAdministrador() {
        return this.papel == PapelUsuario.ADMIN;
    }

    /** RN05: apenas o proprio cliente ou um administrador pode visualizar um pedido. */
    public boolean podeVisualizarPedido(Pedido pedido) {
        return ehAdministrador() || (pedido != null && this.id != null && this.id.equals(pedido.getUsuarioId()));
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public PapelUsuario getPapel() {
        return papel;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }
}
