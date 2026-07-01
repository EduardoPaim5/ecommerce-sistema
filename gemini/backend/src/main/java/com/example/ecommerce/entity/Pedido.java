package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ItemPedido> itens = new ArrayList<>();

    @Embedded
    private Endereco enderecoEntrega;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        if (status == null) {
            status = StatusPedido.AGUARDANDO_PAGAMENTO;
        }
    }

    public void confirmarPagamento(ResultadoPagamento resultado) {
        if (this.status != StatusPedido.AGUARDANDO_PAGAMENTO) {
            throw new IllegalStateException("Apenas pedidos aguardando pagamento podem ter o pagamento confirmado. Status atual: " + this.status);
        }
        if (resultado == ResultadoPagamento.APROVADO) {
            this.status = StatusPedido.PAGO;
        } else {
            this.status = StatusPedido.CANCELADO;
        }
    }

    public void enviar() {
        if (this.status != StatusPedido.PAGO) {
            throw new IllegalStateException("Apenas pedidos pagos podem ser enviados. Status atual: " + this.status);
        }
        this.status = StatusPedido.ENVIADO;
    }

    public void confirmarRecebimento() {
        if (this.status != StatusPedido.ENVIADO) {
            throw new IllegalStateException("Apenas pedidos enviados podem ter recebimento confirmado. Status atual: " + this.status);
        }
        this.status = StatusPedido.ENTREGUE;
    }

    public void cancelar() {
        if (!podeSerCancelado()) {
            throw new IllegalStateException("Pedido nao pode ser cancelado no status atual: " + this.status);
        }
        this.status = StatusPedido.CANCELADO;
    }

    public Boolean podeSerCancelado() {
        return this.status == StatusPedido.AGUARDANDO_PAGAMENTO || this.status == StatusPedido.PAGO;
    }
}
