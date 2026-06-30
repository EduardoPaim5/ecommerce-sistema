import { Carrinho } from "../domain/entities/carrinho.js";
import { Categoria } from "../domain/entities/categoria.js";
import { Pedido } from "../domain/entities/pedido.js";
import { Produto } from "../domain/entities/produto.js";
import { Usuario } from "../domain/entities/usuario.js";

export type UsuarioRepository = {
  proximoId(): number;
  salvar(usuario: Usuario): Promise<void>;
  buscarPorId(id: number): Promise<Usuario | undefined>;
  buscarPorEmail(email: string): Promise<Usuario | undefined>;
};

export type CategoriaRepository = {
  proximoId(): number;
  salvar(categoria: Categoria): Promise<void>;
  listar(): Promise<Categoria[]>;
  buscarPorId(id: number): Promise<Categoria | undefined>;
};

export type ProdutoRepository = {
  proximoId(): number;
  salvar(produto: Produto): Promise<void>;
  listar(): Promise<Produto[]>;
  buscarPorId(id: number): Promise<Produto | undefined>;
};

export type CarrinhoRepository = {
  proximoId(): number;
  salvar(carrinho: Carrinho): Promise<void>;
  buscarPorUsuarioId(usuarioId: number): Promise<Carrinho | undefined>;
};

export type PedidoRepository = {
  proximoId(): number;
  salvar(pedido: Pedido): Promise<void>;
  listar(): Promise<Pedido[]>;
  listarPorUsuarioId(usuarioId: number): Promise<Pedido[]>;
  buscarPorId(id: number): Promise<Pedido | undefined>;
};

export type SessaoRepository = {
  salvar(token: string, usuarioId: number): Promise<void>;
  buscarUsuarioId(token: string): Promise<number | undefined>;
  remover(token: string): Promise<void>;
};

export type Repositories = {
  usuarios: UsuarioRepository;
  categorias: CategoriaRepository;
  produtos: ProdutoRepository;
  carrinhos: CarrinhoRepository;
  pedidos: PedidoRepository;
  sessoes: SessaoRepository;
};
