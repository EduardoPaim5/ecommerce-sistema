package com.example.ecommerce.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

public class AdminDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRequest {
        @NotBlank(message = "Nome do produto e obrigatorio")
        private String nome;

        private String descricao;
        
        private String imagemUrl;

        @NotNull(message = "Preco e obrigatorio")
        @DecimalMin(value = "0.0", message = "Preco deve ser maior ou igual a zero")
        private BigDecimal preco;

        @NotNull(message = "Quantidade em estoque e obrigatoria")
        @Min(value = 0, message = "Estoque deve ser maior ou igual a zero")
        private Integer quantidadeEstoque;

        @NotNull(message = "Ativo e obrigatorio")
        private Boolean ativo;

        @NotNull(message = "Categoria e obrigatoria")
        private Long categoriaId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryRequest {
        @NotBlank(message = "Nome da categoria e obrigatorio")
        private String nome;

        private String descricao;
    }
}
