import { Categoria } from "../../domain/entities/categoria.js";
import { Produto } from "../../domain/entities/produto.js";
import { Usuario } from "../../domain/entities/usuario.js";
import { ApplicationError } from "../errors/application-error.js";
import { Repositories } from "../repositories.js";

export class AdministracaoService {
  constructor(private readonly repositories: Repositories) {}

  async criarCategoria(admin: Usuario, input: { nome: string; descricao: string }): Promise<Categoria> {
    this.garantirAdmin(admin);
    const categoria = new Categoria({
      id: this.repositories.categorias.proximoId(),
      nome: input.nome,
      descricao: input.descricao
    });
    await this.repositories.categorias.salvar(categoria);
    return categoria;
  }

  async atualizarCategoria(
    admin: Usuario,
    categoriaId: number,
    input: { nome: string; descricao: string }
  ): Promise<Categoria> {
    this.garantirAdmin(admin);
    const categoria = await this.obterCategoria(categoriaId);
    categoria.atualizarDados(input.nome, input.descricao);
    await this.repositories.categorias.salvar(categoria);
    return categoria;
  }

  async criarProduto(
    admin: Usuario,
    input: {
      nome: string;
      descricao: string;
      imagemUrl: string;
      preco: number;
      quantidadeEstoque: number;
      categoriaId: number;
    }
  ): Promise<Produto> {
    this.garantirAdmin(admin);
    const categoria = await this.obterCategoria(input.categoriaId);
    const produto = new Produto({
      id: this.repositories.produtos.proximoId(),
      nome: input.nome,
      descricao: input.descricao,
      imagemUrl: input.imagemUrl,
      preco: input.preco,
      quantidadeEstoque: input.quantidadeEstoque,
      categoria
    });
    await this.repositories.produtos.salvar(produto);
    return produto;
  }

  async atualizarProduto(
    admin: Usuario,
    produtoId: number,
    input: {
      nome: string;
      descricao: string;
      imagemUrl: string;
      preco: number;
      quantidadeEstoque: number;
      categoriaId: number;
      ativo?: boolean;
    }
  ): Promise<Produto> {
    this.garantirAdmin(admin);
    const produto = await this.obterProduto(produtoId);
    const categoria = await this.obterCategoria(input.categoriaId);
    produto.atualizarDados(input.nome, input.descricao, input.preco, input.imagemUrl, categoria);
    this.ajustarEstoque(produto, input.quantidadeEstoque);
    if (input.ativo === true) produto.ativar();
    if (input.ativo === false) produto.desativar();
    await this.repositories.produtos.salvar(produto);
    return produto;
  }

  async ativarProduto(admin: Usuario, produtoId: number): Promise<Produto> {
    this.garantirAdmin(admin);
    const produto = await this.obterProduto(produtoId);
    produto.ativar();
    await this.repositories.produtos.salvar(produto);
    return produto;
  }

  async desativarProduto(admin: Usuario, produtoId: number): Promise<Produto> {
    this.garantirAdmin(admin);
    const produto = await this.obterProduto(produtoId);
    produto.desativar();
    await this.repositories.produtos.salvar(produto);
    return produto;
  }

  private garantirAdmin(usuario: Usuario): void {
    if (!usuario.ehAdministrador()) throw new ApplicationError("Acesso restrito a administradores.", 403);
  }

  private async obterCategoria(id: number): Promise<Categoria> {
    const categoria = await this.repositories.categorias.buscarPorId(id);
    if (!categoria) throw new ApplicationError("Categoria nao encontrada.", 404);
    return categoria;
  }

  private async obterProduto(id: number): Promise<Produto> {
    const produto = await this.repositories.produtos.buscarPorId(id);
    if (!produto) throw new ApplicationError("Produto nao encontrado.", 404);
    return produto;
  }

  private ajustarEstoque(produto: Produto, quantidadeDesejada: number): void {
    const diferenca = quantidadeDesejada - produto.quantidadeEstoque;
    if (diferenca > 0) produto.estornarEstoque(diferenca);
    if (diferenca < 0) produto.baixarEstoque(Math.abs(diferenca));
  }
}
