package com.example.ecommerce.dto;

import com.example.ecommerce.entity.Endereco;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class OrderDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderRequest {
        @NotNull(message = "Endereco de entrega e obrigatorio")
        private Endereco enderecoEntrega;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusRequest {
        @NotNull(message = "Status e obrigatorio")
        private String status;
    }
}
