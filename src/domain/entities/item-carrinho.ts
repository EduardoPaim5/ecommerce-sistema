import { Produto } from "./produto.js";
import { DomainError } from "../errors/domain-error.js";

export class ItemCarrinho {
  readonly produtoId: number;
  quantidade: number;
  precoUnitario: number;

  constructor(produto: Produto, quantidade: number) {
    this.produtoId = produto.id;
    this.precoUnitario = produto.preco;
    this.quantidade = 0;
    this.alterarQuantidade(quantidade);
  }

  alterarQuantidade(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new DomainError("Quantidade do item deve ser um inteiro positivo.");
    }

    this.quantidade = quantidade;
  }

  calcularSubtotal(): number {
    return this.quantidade * this.precoUnitario;
  }
}
