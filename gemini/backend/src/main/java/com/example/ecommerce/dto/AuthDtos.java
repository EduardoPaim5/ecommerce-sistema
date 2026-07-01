package com.example.ecommerce.dto;

import com.example.ecommerce.entity.PapelUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

public class AuthDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        private String email;

        @NotBlank(message = "Senha e obrigatoria")
        private String senha;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Nome e obrigatorio")
        private String nome;

        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        private String email;

        @NotBlank(message = "Senha e obrigatoria")
        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
        private String senha;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SessionResponse {
        private String token;
        private Long usuarioId;
        private LocalDateTime expiraEm;
        private String nome;
        private String email;
        private PapelUsuario papel;
    }
}
