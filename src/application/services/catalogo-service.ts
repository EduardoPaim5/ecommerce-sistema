import { Categoria } from "../../domain/entities/categoria.js";
import { Produto } from "../../domain/entities/produto.js";
import { ApplicationError } from "../errors/application-error.js";
import { Repositories } from "../repositories.js";

export class CatalogoService {
  constructor(private readonly repositories: Repositories) {}

  async listarCategorias(): Promise<Categoria[]> {
    return this.repositories.categorias.listar();
  }

  async listarProdutos(filtros: { categoriaId?: number; incluirInativos?: boolean } = {}): Promise<Produto[]> {
    const produtos = await this.repositories.produtos.listar();
    return produtos.filter((produto) => {
      const statusValido = filtros.incluirInativos || produto.ativo;
      const categoriaValida = filtros.categoriaId === undefined || produto.categoria.id === filtros.categoriaId;
      return statusValido && categoriaValida;
    });
  }

  async obterProduto(id: number, incluirInativos = false): Promise<Produto> {
    const produto = await this.repositories.produtos.buscarPorId(id);
    if (!produto || (!incluirInativos && !produto.ativo)) throw new ApplicationError("Produto nao encontrado.", 404);
    return produto;
  }
}
