package com.ecommerce.domain.exception;

/**
 * Lancada quando um usuario tenta acessar um recurso ao qual nao tem permissao
 * (ex.: RN05 - visualizar pedido de outro cliente). Traduzida para HTTP 403.
 */
public class AcessoNegadoException extends RuntimeException {

    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
