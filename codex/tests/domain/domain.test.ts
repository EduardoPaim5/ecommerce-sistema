import { describe, expect, it } from "vitest";
import {
  Carrinho,
  Categoria,
  DomainError,
  Endereco,
  ItemPedido,
  PapelUsuario,
  Pedido,
  Produto,
  ResultadoPagamento,
  StatusPedido,
  Usuario
} from "../../src/index.js";

const categoria = () => new Categoria({ id: 1, nome: "Eletronicos", descricao: "Produtos eletronicos" });

const produto = (override: Partial<ConstructorParameters<typeof Produto>[0]> = {}) =>
  new Produto({
    id: 10,
    nome: "Teclado mecanico",
    descricao: "Teclado com switches brown",
    imagemUrl: "https://example.com/teclado.jpg",
    preco: 250,
    quantidadeEstoque: 5,
    categoria: categoria(),
    ...override
  });

const endereco = () =>
  new Endereco({
    cep: "01001000",
    logradouro: "Praca da Se",
    numero: "100",
    cidade: "Sao Paulo",
    estado: "SP"
  });

describe("Produto", () => {
  it("valida preco e estoque nao negativos", () => {
    expect(() => produto({ preco: -1 })).toThrow(DomainError);
    expect(() => produto({ quantidadeEstoque: -1 })).toThrow(DomainError);
  });

  it("baixa e estorna estoque", () => {
    const item = produto();

    item.baixarEstoque(2);
    expect(item.quantidadeEstoque).toBe(3);

    item.estornarEstoque(1);
    expect(item.quantidadeEstoque).toBe(4);
  });
});

describe("Carrinho", () => {
  it("adiciona produtos e calcula o total", () => {
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    const item = produto();

    carrinho.adicionarProduto(item, 2);

    expect(carrinho.estaVazio()).toBe(false);
    expect(carrinho.calcularTotal()).toBe(500);
  });

  it("bloqueia quantidade maior que o estoque disponivel", () => {
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    const item = produto({ quantidadeEstoque: 1 });

    expect(() => carrinho.adicionarProduto(item, 2)).toThrow(DomainError);
  });

  it("altera e remove item do carrinho", () => {
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    const item = produto();

    carrinho.adicionarProduto(item, 1);
    carrinho.alterarQuantidade(item, 3);
    expect(carrinho.calcularTotal()).toBe(750);

    carrinho.removerProduto(item);
    expect(carrinho.estaVazio()).toBe(true);
  });
});

describe("Pedido", () => {
  it("cria pedido aguardando pagamento e calcula total", () => {
    const item = produto();
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    carrinho.adicionarProduto(item, 2);

    const pedido = new Pedido({
      id: 1,
      usuarioId: 99,
      itens: [ItemPedido.criarSnapshot(carrinho.itens[0]!, item)],
      enderecoEntrega: endereco()
    });

    expect(pedido.status).toBe(StatusPedido.AGUARDANDO_PAGAMENTO);
    expect(pedido.valorTotal).toBe(500);
  });

  it("aplica transicoes validas da maquina de estados", () => {
    const item = produto();
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    carrinho.adicionarProduto(item, 1);
    const pedido = new Pedido({
      id: 1,
      usuarioId: 99,
      itens: [ItemPedido.criarSnapshot(carrinho.itens[0]!, item)],
      enderecoEntrega: endereco()
    });

    pedido.confirmarPagamento(ResultadoPagamento.APROVADO);
    pedido.enviar();
    pedido.confirmarRecebimento();

    expect(pedido.status).toBe(StatusPedido.ENTREGUE);
  });

  it("bloqueia transicoes invalidas", () => {
    const item = produto();
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    carrinho.adicionarProduto(item, 1);
    const pedido = new Pedido({
      id: 1,
      usuarioId: 99,
      itens: [ItemPedido.criarSnapshot(carrinho.itens[0]!, item)],
      enderecoEntrega: endereco()
    });

    expect(() => pedido.enviar()).toThrow(DomainError);
  });

  it("cancela pagamento recusado", () => {
    const item = produto();
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    carrinho.adicionarProduto(item, 1);
    const pedido = new Pedido({
      id: 1,
      usuarioId: 99,
      itens: [ItemPedido.criarSnapshot(carrinho.itens[0]!, item)],
      enderecoEntrega: endereco()
    });

    pedido.confirmarPagamento(ResultadoPagamento.RECUSADO);

    expect(pedido.status).toBe(StatusPedido.CANCELADO);
  });
});

describe("ItemPedido", () => {
  it("mantem snapshot historico mesmo se o produto mudar depois", () => {
    const item = produto({ nome: "Mouse gamer", preco: 120 });
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    carrinho.adicionarProduto(item, 2);

    const snapshot = ItemPedido.criarSnapshot(carrinho.itens[0]!, item);
    item.atualizarDados("Mouse basico", "Novo nome", 80, "", categoria());

    expect(snapshot.nomeProduto).toBe("Mouse gamer");
    expect(snapshot.precoUnitario).toBe(120);
    expect(snapshot.subtotal).toBe(240);
  });
});

describe("Usuario", () => {
  it("permite administrador visualizar qualquer pedido e cliente apenas o proprio", () => {
    const item = produto();
    const carrinho = new Carrinho({ id: 1, usuarioId: 99 });
    carrinho.adicionarProduto(item, 1);
    const pedido = new Pedido({
      id: 1,
      usuarioId: 99,
      itens: [ItemPedido.criarSnapshot(carrinho.itens[0]!, item)],
      enderecoEntrega: endereco()
    });

    const cliente = new Usuario({
      id: 99,
      nome: "Cliente",
      email: "cliente@example.com",
      senhaHash: "hash",
      papel: PapelUsuario.CLIENTE
    });
    const outroCliente = new Usuario({
      id: 100,
      nome: "Outro Cliente",
      email: "outro@example.com",
      senhaHash: "hash",
      papel: PapelUsuario.CLIENTE
    });
    const admin = new Usuario({
      id: 1,
      nome: "Admin",
      email: "admin@example.com",
      senhaHash: "hash",
      papel: PapelUsuario.ADMIN
    });

    expect(cliente.podeVisualizarPedido(pedido)).toBe(true);
    expect(outroCliente.podeVisualizarPedido(pedido)).toBe(false);
    expect(admin.podeVisualizarPedido(pedido)).toBe(true);
  });
});
