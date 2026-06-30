import { Pedido } from "../../domain/entities/pedido.js";
import { Produto } from "../../domain/entities/produto.js";
import { ResultadoPagamento } from "../../domain/enums/resultado-pagamento.js";
import { StatusPedido } from "../../domain/enums/status-pedido.js";
import { Usuario } from "../../domain/entities/usuario.js";
import { ApplicationError } from "../errors/application-error.js";
import { Repositories } from "../repositories.js";

export class PedidoService {
  constructor(private readonly repositories: Repositories) {}

  async listar(usuario: Usuario): Promise<Pedido[]> {
    return usuario.ehAdministrador()
      ? this.repositories.pedidos.listar()
      : this.repositories.pedidos.listarPorUsuarioId(usuario.id);
  }

  async obter(usuario: Usuario, pedidoId: number): Promise<Pedido> {
    const pedido = await this.repositories.pedidos.buscarPorId(pedidoId);
    if (!pedido) throw new ApplicationError("Pedido nao encontrado.", 404);
    if (!usuario.podeVisualizarPedido(pedido)) throw new ApplicationError("Acesso negado ao pedido.", 403);
    return pedido;
  }

  async confirmarPagamento(usuario: Usuario, pedidoId: number, resultado: ResultadoPagamento): Promise<Pedido> {
    this.garantirAdmin(usuario);
    const pedido = await this.obter(usuario, pedidoId);
    pedido.validarConfirmacaoPagamento();
    if (resultado === ResultadoPagamento.APROVADO) await this.baixarEstoque(pedido);
    pedido.confirmarPagamento(resultado);
    await this.repositories.pedidos.salvar(pedido);
    return pedido;
  }

  async enviar(usuario: Usuario, pedidoId: number): Promise<Pedido> {
    this.garantirAdmin(usuario);
    const pedido = await this.obter(usuario, pedidoId);
    pedido.enviar();
    await this.repositories.pedidos.salvar(pedido);
    return pedido;
  }

  async confirmarRecebimento(usuario: Usuario, pedidoId: number): Promise<Pedido> {
    const pedido = await this.obter(usuario, pedidoId);
    pedido.confirmarRecebimento();
    await this.repositories.pedidos.salvar(pedido);
    return pedido;
  }

  async cancelar(usuario: Usuario, pedidoId: number): Promise<Pedido> {
    const pedido = await this.obter(usuario, pedidoId);
    const statusAnterior = pedido.status;
    pedido.cancelar();
    if (statusAnterior === StatusPedido.PAGO) {
      await this.estornarEstoque(pedido);
    }
    await this.repositories.pedidos.salvar(pedido);
    return pedido;
  }

  private garantirAdmin(usuario: Usuario): void {
    if (!usuario.ehAdministrador()) throw new ApplicationError("Acesso restrito a administradores.", 403);
  }

  private async baixarEstoque(pedido: Pedido): Promise<void> {
    const produtosBaixados: Array<{ produtoId: number; quantidade: number }> = [];

    try {
      for (const item of pedido.itens) {
        const produto = await this.repositories.produtos.buscarPorId(item.produtoId);
        if (produto instanceof Produto) {
          produto.baixarEstoque(item.quantidade);
          produtosBaixados.push({ produtoId: produto.id, quantidade: item.quantidade });
          await this.repositories.produtos.salvar(produto);
          continue;
        }

        throw new ApplicationError(`Produto ${item.produtoId} nao encontrado.`, 400);
      }
    } catch (error) {
      await this.estornarProdutos(produtosBaixados);
      throw error;
    }
  }

  private async estornarEstoque(pedido: Pedido): Promise<void> {
    const itens = pedido.itens.map((item) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade
    }));
    await this.estornarProdutos(itens);
  }

  private async estornarProdutos(itens: Array<{ produtoId: number; quantidade: number }>): Promise<void> {
    for (const item of itens) {
      const produto = await this.repositories.produtos.buscarPorId(item.produtoId);
      if (produto instanceof Produto) {
        produto.estornarEstoque(item.quantidade);
        await this.repositories.produtos.salvar(produto);
      }
    }
  }
}
