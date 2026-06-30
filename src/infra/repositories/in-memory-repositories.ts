import { Carrinho } from "../../domain/entities/carrinho.js";
import { Categoria } from "../../domain/entities/categoria.js";
import { Pedido } from "../../domain/entities/pedido.js";
import { Produto } from "../../domain/entities/produto.js";
import { Usuario } from "../../domain/entities/usuario.js";
import {
  CarrinhoRepository,
  CategoriaRepository,
  PedidoRepository,
  ProdutoRepository,
  Repositories,
  SessaoRepository,
  UsuarioRepository
} from "../../application/repositories.js";

class Sequencia {
  private valor: number;

  constructor(valorInicial = 1) {
    this.valor = valorInicial;
  }

  proximo(): number {
    return this.valor++;
  }

  tocar(id: number): void {
    if (id >= this.valor) this.valor = id + 1;
  }
}

export class InMemoryUsuarioRepository implements UsuarioRepository {
  private readonly items = new Map<number, Usuario>();
  private readonly sequencia = new Sequencia();

  proximoId(): number {
    return this.sequencia.proximo();
  }

  async salvar(usuario: Usuario): Promise<void> {
    this.sequencia.tocar(usuario.id);
    this.items.set(usuario.id, usuario);
  }

  async buscarPorId(id: number): Promise<Usuario | undefined> {
    return this.items.get(id);
  }

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    const emailNormalizado = email.trim().toLowerCase();
    return [...this.items.values()].find((usuario) => usuario.email.toLowerCase() === emailNormalizado);
  }
}

export class InMemoryCategoriaRepository implements CategoriaRepository {
  private readonly items = new Map<number, Categoria>();
  private readonly sequencia = new Sequencia();

  proximoId(): number {
    return this.sequencia.proximo();
  }

  async salvar(categoria: Categoria): Promise<void> {
    this.sequencia.tocar(categoria.id);
    this.items.set(categoria.id, categoria);
  }

  async listar(): Promise<Categoria[]> {
    return [...this.items.values()];
  }

  async buscarPorId(id: number): Promise<Categoria | undefined> {
    return this.items.get(id);
  }
}

export class InMemoryProdutoRepository implements ProdutoRepository {
  private readonly items = new Map<number, Produto>();
  private readonly sequencia = new Sequencia();

  proximoId(): number {
    return this.sequencia.proximo();
  }

  async salvar(produto: Produto): Promise<void> {
    this.sequencia.tocar(produto.id);
    this.items.set(produto.id, produto);
  }

  async listar(): Promise<Produto[]> {
    return [...this.items.values()];
  }

  async buscarPorId(id: number): Promise<Produto | undefined> {
    return this.items.get(id);
  }
}

export class InMemoryCarrinhoRepository implements CarrinhoRepository {
  private readonly items = new Map<number, Carrinho>();
  private readonly sequencia = new Sequencia();

  proximoId(): number {
    return this.sequencia.proximo();
  }

  async salvar(carrinho: Carrinho): Promise<void> {
    this.sequencia.tocar(carrinho.id);
    this.items.set(carrinho.usuarioId, carrinho);
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<Carrinho | undefined> {
    return this.items.get(usuarioId);
  }
}

export class InMemoryPedidoRepository implements PedidoRepository {
  private readonly items = new Map<number, Pedido>();
  private readonly sequencia = new Sequencia();

  proximoId(): number {
    return this.sequencia.proximo();
  }

  async salvar(pedido: Pedido): Promise<void> {
    this.sequencia.tocar(pedido.id);
    this.items.set(pedido.id, pedido);
  }

  async listar(): Promise<Pedido[]> {
    return [...this.items.values()];
  }

  async listarPorUsuarioId(usuarioId: number): Promise<Pedido[]> {
    return [...this.items.values()].filter((pedido) => pedido.usuarioId === usuarioId);
  }

  async buscarPorId(id: number): Promise<Pedido | undefined> {
    return this.items.get(id);
  }
}

export class InMemorySessaoRepository implements SessaoRepository {
  private readonly items = new Map<string, number>();

  async salvar(token: string, usuarioId: number): Promise<void> {
    this.items.set(token, usuarioId);
  }

  async buscarUsuarioId(token: string): Promise<number | undefined> {
    return this.items.get(token);
  }

  async remover(token: string): Promise<void> {
    this.items.delete(token);
  }
}

export function criarRepositoriesEmMemoria(): Repositories {
  return {
    usuarios: new InMemoryUsuarioRepository(),
    categorias: new InMemoryCategoriaRepository(),
    produtos: new InMemoryProdutoRepository(),
    carrinhos: new InMemoryCarrinhoRepository(),
    pedidos: new InMemoryPedidoRepository(),
    sessoes: new InMemorySessaoRepository()
  };
}
