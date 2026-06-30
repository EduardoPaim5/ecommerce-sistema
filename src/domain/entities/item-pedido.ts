import { ItemCarrinho } from "./item-carrinho.js";
import { Produto } from "./produto.js";

export type ItemPedidoProps = {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

export class ItemPedido {
  readonly produtoId: number;
  readonly nomeProduto: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
  readonly subtotal: number;

  private constructor(props: ItemPedidoProps) {
    this.produtoId = props.produtoId;
    this.nomeProduto = props.nomeProduto;
    this.quantidade = props.quantidade;
    this.precoUnitario = props.precoUnitario;
    this.subtotal = props.subtotal;
  }

  static criarSnapshot(item: ItemCarrinho, produto: Produto): ItemPedido {
    return new ItemPedido({
      produtoId: produto.id,
      nomeProduto: produto.nome,
      quantidade: item.quantidade,
      precoUnitario: produto.preco,
      subtotal: item.quantidade * produto.preco
    });
  }
}
