import { Endereco, EnderecoProps } from "../../domain/entities/endereco.js";
import { ItemPedido } from "../../domain/entities/item-pedido.js";
import { Pedido } from "../../domain/entities/pedido.js";
import { ApplicationError } from "../errors/application-error.js";
import { Repositories } from "../repositories.js";
import { CarrinhoService } from "./carrinho-service.js";

export class CheckoutService {
  constructor(
    private readonly repositories: Repositories,
    private readonly carrinhoService: CarrinhoService
  ) {}

  async finalizarCompra(input: {
    usuarioId: number;
    enderecoEntrega: EnderecoProps;
  }): Promise<Pedido> {
    const carrinho = await this.carrinhoService.obterCarrinho(input.usuarioId);
    if (carrinho.estaVazio()) throw new ApplicationError("Carrinho vazio.", 400);

    const enderecoEntrega = new Endereco(input.enderecoEntrega);
    const snapshots: ItemPedido[] = [];

    for (const item of carrinho.itens) {
      const produto = await this.repositories.produtos.buscarPorId(item.produtoId);
      if (!produto || !produto.ativo) throw new ApplicationError(`Produto ${item.produtoId} indisponivel.`, 400);
      if (!produto.temEstoque(item.quantidade)) {
        throw new ApplicationError(`Estoque insuficiente para o produto ${item.produtoId}.`, 400);
      }

      snapshots.push(ItemPedido.criarSnapshot(item, produto));
    }

    const pedido = new Pedido({
      id: this.repositories.pedidos.proximoId(),
      usuarioId: input.usuarioId,
      itens: snapshots,
      enderecoEntrega
    });

    await this.repositories.pedidos.salvar(pedido);
    carrinho.limpar();
    await this.repositories.carrinhos.salvar(carrinho);
    return pedido;
  }
}
