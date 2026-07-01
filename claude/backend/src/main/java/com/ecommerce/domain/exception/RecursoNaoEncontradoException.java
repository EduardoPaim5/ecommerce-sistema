package com.ecommerce.domain.exception;

/**
 * Lancada quando um recurso solicitado nao existe.
 * Traduzida para HTTP 404 pela camada web.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
