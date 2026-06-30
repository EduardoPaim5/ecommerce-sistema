import { Endereco } from "./endereco.js";
import { ItemPedido } from "./item-pedido.js";
import { ResultadoPagamento } from "../enums/resultado-pagamento.js";
import { StatusPedido } from "../enums/status-pedido.js";
import { DomainError } from "../errors/domain-error.js";

export type PedidoProps = {
  id: number;
  usuarioId: number;
  itens: ItemPedido[];
  enderecoEntrega: Endereco;
  dataCriacao?: Date;
};

export class Pedido {
  readonly id: number;
  readonly usuarioId: number;
  readonly itens: readonly ItemPedido[];
  readonly enderecoEntrega: Endereco;
  readonly dataCriacao: Date;
  valorTotal: number;
  status: StatusPedido;

  constructor(props: PedidoProps) {
    if (props.itens.length === 0) throw new DomainError("Pedido deve possuir ao menos um item.");

    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.itens = [...props.itens];
    this.enderecoEntrega = props.enderecoEntrega;
    this.dataCriacao = props.dataCriacao ?? new Date();
    this.valorTotal = this.itens.reduce((total, item) => total + item.subtotal, 0);
    this.status = StatusPedido.AGUARDANDO_PAGAMENTO;
  }

  confirmarPagamento(resultado: ResultadoPagamento): void {
    this.validarConfirmacaoPagamento();
    this.status = resultado === ResultadoPagamento.APROVADO ? StatusPedido.PAGO : StatusPedido.CANCELADO;
  }

  validarConfirmacaoPagamento(): void {
    this.garantirStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
  }

  enviar(): void {
    this.garantirStatus(StatusPedido.PAGO);
    this.status = StatusPedido.ENVIADO;
  }

  confirmarRecebimento(): void {
    this.garantirStatus(StatusPedido.ENVIADO);
    this.status = StatusPedido.ENTREGUE;
  }

  cancelar(): void {
    if (!this.podeSerCancelado()) {
      throw new DomainError("Pedido nao pode ser cancelado no status atual.");
    }

    this.status = StatusPedido.CANCELADO;
  }

  podeSerCancelado(): boolean {
    return [StatusPedido.AGUARDANDO_PAGAMENTO, StatusPedido.PAGO].includes(this.status);
  }

  private garantirStatus(statusEsperado: StatusPedido): void {
    if (this.status !== statusEsperado) {
      throw new DomainError(`Transicao invalida a partir do status ${this.status}.`);
    }
  }
}
