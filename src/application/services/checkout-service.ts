import { Endereco, EnderecoProps } from "../../domain/entities/endereco.js";
import { ItemPedido } from "../../domain/entities/item-pedido.js";
import { Pedido } from "../../domain/entities/pedido.js";
import { ResultadoPagamento } from "../../domain/enums/resultado-pagamento.js";
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
    resultadoPagamento?: ResultadoPagamento;
  }): Promise<Pedido> {
    const carrinho = await this.carrinhoService.obterCarrinho(input.usuarioId);
    if (carrinho.estaVazio()) throw new ApplicationError("Carrinho vazio.", 400);

    const enderecoEntrega = new Endereco(input.enderecoEntrega);
    const snapshots: ItemPedido[] = [];
    const produtosBaixados: Array<{ produtoId: number; quantidade: number }> = [];

    try {
      for (const item of carrinho.itens) {
        const produto = await this.repositories.produtos.buscarPorId(item.produtoId);
        if (!produto || !produto.ativo) throw new ApplicationError(`Produto ${item.produtoId} indisponivel.`, 400);

        produto.baixarEstoque(item.quantidade);
        produtosBaixados.push({ produtoId: produto.id, quantidade: item.quantidade });
        snapshots.push(ItemPedido.criarSnapshot(item, produto));
        await this.repositories.produtos.salvar(produto);
      }

      const pedido = new Pedido({
        id: this.repositories.pedidos.proximoId(),
        usuarioId: input.usuarioId,
        itens: snapshots,
        enderecoEntrega
      });

      const resultado = input.resultadoPagamento ?? ResultadoPagamento.APROVADO;
      pedido.confirmarPagamento(resultado);
      if (resultado === ResultadoPagamento.RECUSADO) {
        await this.estornarProdutos(produtosBaixados);
      }

      await this.repositories.pedidos.salvar(pedido);
      carrinho.limpar();
      await this.repositories.carrinhos.salvar(carrinho);
      return pedido;
    } catch (error) {
      await this.estornarProdutos(produtosBaixados);
      throw error;
    }
  }

  private async estornarProdutos(produtosBaixados: Array<{ produtoId: number; quantidade: number }>): Promise<void> {
    for (const item of produtosBaixados) {
      const produto = await this.repositories.produtos.buscarPorId(item.produtoId);
      if (produto) {
        produto.estornarEstoque(item.quantidade);
        await this.repositories.produtos.salvar(produto);
      }
    }
  }
}
