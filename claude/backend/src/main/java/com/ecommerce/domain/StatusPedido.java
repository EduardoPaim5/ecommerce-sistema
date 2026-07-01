package com.ecommerce.domain;

import java.util.Set;

/**
 * Status de um pedido e a maquina de estados associada (secao 4 dos requisitos).
 *
 * <pre>
 * AGUARDANDO_PAGAMENTO --(pagamento aprovado)--> PAGO
 * AGUARDANDO_PAGAMENTO --(pagamento recusado/cancelar)--> CANCELADO
 * PAGO --(separacao/envio)--> ENVIADO
 * PAGO --(cancelar)--> CANCELADO
 * ENVIADO --(confirmacao de recebimento)--> ENTREGUE
 * </pre>
 *
 * Estado inicial: {@code AGUARDANDO_PAGAMENTO}. Estados finais: {@code ENTREGUE}, {@code CANCELADO}.
 */
public enum StatusPedido {
    AGUARDANDO_PAGAMENTO,
    PAGO,
    ENVIADO,
    ENTREGUE,
    CANCELADO;

    private Set<StatusPedido> transicoesPermitidas() {
        return switch (this) {
            case AGUARDANDO_PAGAMENTO -> Set.of(PAGO, CANCELADO);
            case PAGO -> Set.of(ENVIADO, CANCELADO);
            case ENVIADO -> Set.of(ENTREGUE);
            case ENTREGUE, CANCELADO -> Set.of();
        };
    }

    public boolean podeTransicionarPara(StatusPedido destino) {
        return transicoesPermitidas().contains(destino);
    }

    public boolean ehFinal() {
        return this == ENTREGUE || this == CANCELADO;
    }
}
