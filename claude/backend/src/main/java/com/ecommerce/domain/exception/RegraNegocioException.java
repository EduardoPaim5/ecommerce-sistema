package com.ecommerce.domain.exception;

/**
 * Lancada quando uma regra de negocio do dominio e violada
 * (ex.: estoque insuficiente, transicao de status invalida, carrinho vazio).
 *
 * <p>E traduzida para HTTP 422 (Unprocessable Entity) pela camada web.</p>
 */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
