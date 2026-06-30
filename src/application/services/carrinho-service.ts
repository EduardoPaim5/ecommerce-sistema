import { Carrinho } from "../../domain/entities/carrinho.js";
import { ApplicationError } from "../errors/application-error.js";
import { Repositories } from "../repositories.js";

export class CarrinhoService {
  constructor(private readonly repositories: Repositories) {}

  async obterCarrinho(usuarioId: number): Promise<Carrinho> {
    const carrinho = await this.repositories.carrinhos.buscarPorUsuarioId(usuarioId);
    if (carrinho) return carrinho;

    const novoCarrinho = new Carrinho({ id: this.repositories.carrinhos.proximoId(), usuarioId });
    await this.repositories.carrinhos.salvar(novoCarrinho);
    return novoCarrinho;
  }

  async adicionarItem(usuarioId: number, produtoId: number, quantidade: number): Promise<Carrinho> {
    const [carrinho, produto] = await Promise.all([
      this.obterCarrinho(usuarioId),
      this.repositories.produtos.buscarPorId(produtoId)
    ]);
    if (!produto || !produto.ativo) throw new ApplicationError("Produto nao encontrado.", 404);

    carrinho.adicionarProduto(produto, quantidade);
    await this.repositories.carrinhos.salvar(carrinho);
    return carrinho;
  }

  async alterarItem(usuarioId: number, produtoId: number, quantidade: number): Promise<Carrinho> {
    const [carrinho, produto] = await Promise.all([
      this.obterCarrinho(usuarioId),
      this.repositories.produtos.buscarPorId(produtoId)
    ]);
    if (!produto || !produto.ativo) throw new ApplicationError("Produto nao encontrado.", 404);

    carrinho.alterarQuantidade(produto, quantidade);
    await this.repositories.carrinhos.salvar(carrinho);
    return carrinho;
  }

  async removerItem(usuarioId: number, produtoId: number): Promise<Carrinho> {
    const [carrinho, produto] = await Promise.all([
      this.obterCarrinho(usuarioId),
      this.repositories.produtos.buscarPorId(produtoId)
    ]);
    if (!produto) throw new ApplicationError("Produto nao encontrado.", 404);

    carrinho.removerProduto(produto);
    await this.repositories.carrinhos.salvar(carrinho);
    return carrinho;
  }

  async limpar(usuarioId: number): Promise<Carrinho> {
    const carrinho = await this.obterCarrinho(usuarioId);
    carrinho.limpar();
    await this.repositories.carrinhos.salvar(carrinho);
    return carrinho;
  }
}
