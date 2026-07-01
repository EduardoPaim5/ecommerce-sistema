package com.ecommerce.domain;

import com.ecommerce.domain.exception.RegraNegocioException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pedido: compra finalizada por um usuario (diagrama de dominio).
 *
 * <p>O proprio pedido controla suas transicoes de estado por meio de
 * {@link #confirmarPagamento}, {@link #enviar}, {@link #confirmarRecebimento}
 * e {@link #cancelar}, respeitando a maquina de estados (secao 4 dos requisitos).
 * O valor total e a soma dos subtotais dos itens.</p>
 */
@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    @Embedded
    private Endereco enderecoEntrega;

    @Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    protected Pedido() {
        // exigido pelo JPA
    }

    public Pedido(Long usuarioId, List<ItemPedido> itens, Endereco enderecoEntrega) {
        if (itens == null || itens.isEmpty()) {
            throw new RegraNegocioException("Nao e possivel criar um pedido sem itens.");
        }
        this.usuarioId = usuarioId;
        this.enderecoEntrega = enderecoEntrega;
        this.status = StatusPedido.AGUARDANDO_PAGAMENTO;
        this.dataCriacao = LocalDateTime.now();
        for (ItemPedido item : itens) {
            item.associarPedido(this);
            this.itens.add(item);
        }
        this.valorTotal = this.itens.stream()
                .map(ItemPedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Aplica o resultado da simulacao de pagamento: APROVADO leva a PAGO,
     * RECUSADO leva a CANCELADO (secao 4, RF18).
     */
    public void confirmarPagamento(ResultadoPagamento resultado) {
        StatusPedido destino = resultado == ResultadoPagamento.APROVADO
                ? StatusPedido.PAGO
                : StatusPedido.CANCELADO;
        transicionar(destino);
    }

    /** PAGO -> ENVIADO (separacao/envio). */
    public void enviar() {
        transicionar(StatusPedido.ENVIADO);
    }

    /** ENVIADO -> ENTREGUE (confirmacao de recebimento). */
    public void confirmarRecebimento() {
        transicionar(StatusPedido.ENTREGUE);
    }

    /** Cancela o pedido enquanto permitido (AGUARDANDO_PAGAMENTO ou PAGO). */
    public void cancelar() {
        transicionar(StatusPedido.CANCELADO);
    }

    public boolean podeSerCancelado() {
        return status.podeTransicionarPara(StatusPedido.CANCELADO);
    }

    /** Indica se o estoque ja foi baixado (pagamento aprovado e ainda nao estornado). */
    public boolean estoqueFoiBaixado() {
        return status == StatusPedido.PAGO
                || status == StatusPedido.ENVIADO
                || status == StatusPedido.ENTREGUE;
    }

    private void transicionar(StatusPedido destino) {
        if (!status.podeTransicionarPara(destino)) {
            throw new RegraNegocioException(
                    "Transicao de status invalida: " + status + " -> " + destino + ".");
        }
        this.status = destino;
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public List<ItemPedido> getItens() {
        return List.copyOf(itens);
    }

    public Endereco getEnderecoEntrega() {
        return enderecoEntrega;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public StatusPedido getStatus() {
        return status;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
}
