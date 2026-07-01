package com.example.ecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class CartDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRequest {
        @NotNull(message = "ID do produto e obrigatorio")
        private Long produtoId;

        @NotNull(message = "Quantidade e obrigatoria")
        @Min(value = 1, message = "A quantidade deve ser pelo menos 1")
        private Integer quantidade;
    }
}
