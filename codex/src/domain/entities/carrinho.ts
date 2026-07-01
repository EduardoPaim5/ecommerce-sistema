import { ItemCarrinho } from "./item-carrinho.js";
import { Produto } from "./produto.js";
import { DomainError } from "../errors/domain-error.js";

export type CarrinhoProps = {
  id: number;
  usuarioId: number;
  atualizadoEm?: Date;
};

export class Carrinho {
  readonly id: number;
  readonly usuarioId: number;
  readonly itens: ItemCarrinho[];
  atualizadoEm: Date;

  constructor(props: CarrinhoProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.itens = [];
    this.atualizadoEm = props.atualizadoEm ?? new Date();
  }

  adicionarProduto(produto: Produto, quantidade: number): void {
    this.garantirEstoque(produto, quantidade);

    const itemExistente = this.buscarItem(produto.id);
    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + quantidade;
      this.garantirEstoque(produto, novaQuantidade);
      itemExistente.alterarQuantidade(novaQuantidade);
    } else {
      this.itens.push(new ItemCarrinho(produto, quantidade));
    }

    this.tocar();
  }

  alterarQuantidade(produto: Produto, quantidade: number): void {
    this.garantirEstoque(produto, quantidade);

    const item = this.buscarItem(produto.id);
    if (!item) throw new DomainError("Produto nao encontrado no carrinho.");

    item.alterarQuantidade(quantidade);
    this.tocar();
  }

  removerProduto(produto: Produto): void {
    const index = this.itens.findIndex((item) => item.produtoId === produto.id);
    if (index >= 0) {
      this.itens.splice(index, 1);
      this.tocar();
    }
  }

  limpar(): void {
    this.itens.splice(0, this.itens.length);
    this.tocar();
  }

  calcularTotal(): number {
    return this.itens.reduce((total, item) => total + item.calcularSubtotal(), 0);
  }

  estaVazio(): boolean {
    return this.itens.length === 0;
  }

  private buscarItem(produtoId: number): ItemCarrinho | undefined {
    return this.itens.find((item) => item.produtoId === produtoId);
  }

  private garantirEstoque(produto: Produto, quantidade: number): void {
    if (!produto.temEstoque(quantidade)) {
      throw new DomainError("Quantidade solicitada excede o estoque disponivel.");
    }
  }

  private tocar(): void {
    this.atualizadoEm = new Date();
  }
}
