package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    @PrePersist
    protected void onCreate() {
        dataCadastro = LocalDateTime.now();
    }

    public Boolean verificarSenha(String senhaRaw, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return encoder.matches(senhaRaw, this.senhaHash);
    }

    public Boolean ehAdministrador() {
        return this.papel == PapelUsuario.ADMIN;
    }

    public Boolean podeVisualizarPedido(Pedido pedido) {
        return this.ehAdministrador() || pedido.getUsuarioId().equals(this.id);
    }
}
