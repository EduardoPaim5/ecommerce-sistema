package com.ecommerce.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Agrupa os DTOs de entrada (requests) da API.
 */
public final class Requests {

    private Requests() {
    }

    public record CadastroRequest(
            @NotBlank String nome,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres") String senha) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String senha) {
    }

    public record AdicionarItemRequest(
            @NotNull Long produtoId,
            @NotNull @Min(1) Integer quantidade) {
    }

    public record AlterarQuantidadeRequest(
            @NotNull @Min(1) Integer quantidade) {
    }

    public record EnderecoRequest(
            @NotBlank String cep,
            @NotBlank String logradouro,
            @NotBlank String numero,
            String complemento,
            @NotBlank String cidade,
            @NotBlank String estado) {
    }

    public record CheckoutRequest(
            @NotNull @Valid EnderecoRequest endereco) {
    }

    public record ProdutoRequest(
            @NotBlank String nome,
            String descricao,
            @NotNull @DecimalMin(value = "0.0", message = "O preco deve ser maior ou igual a zero") BigDecimal preco,
            String imagemUrl,
            @NotNull @Min(0) Integer quantidadeEstoque,
            @NotNull Long categoriaId,
            Boolean ativo) {
    }

    public record CategoriaRequest(
            @NotBlank String nome,
            String descricao) {
    }

    public record AtualizarStatusRequest(
            @NotBlank String status) {
    }
}
