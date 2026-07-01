import { beforeEach, describe, expect, it } from "vitest";
import {
  ApplicationError,
  criarAppContext,
  ResultadoPagamento,
  seedCredentials,
  StatusPedido
} from "../../src/index.js";
import { carregarSeeds } from "../../src/infra/seeds/seed.js";
import { PapelUsuario } from "../../src/domain/enums/papel-usuario.js";

const endereco = {
  cep: "01001000",
  logradouro: "Praca da Se",
  numero: "100",
  cidade: "Sao Paulo",
  estado: "SP"
};

describe("Services", () => {
  let context: ReturnType<typeof criarAppContext>;

  beforeEach(async () => {
    context = criarAppContext();
    await carregarSeeds(context);
  });

  it("autentica usuario seed e rejeita senha incorreta", async () => {
    const login = await context.services.autenticacao.login({
      email: seedCredentials.cliente.email,
      senha: seedCredentials.cliente.senha
    });

    expect(login.token).toHaveLength(64);
    expect(login.usuario.papel).toBe(PapelUsuario.CLIENTE);

    await expect(
      context.services.autenticacao.login({ email: seedCredentials.cliente.email, senha: "errada" })
    ).rejects.toThrow(ApplicationError);
  });

  it("checkout cria pedido aguardando pagamento sem baixar estoque e limpa carrinho", async () => {
    await context.services.carrinho.adicionarItem(2, 1, 2);
    const produtoAntes = await context.repositories.produtos.buscarPorId(1);
    const estoqueAntes = produtoAntes?.quantidadeEstoque ?? 0;

    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco
    });

    const produtoDepois = await context.repositories.produtos.buscarPorId(1);
    const carrinho = await context.services.carrinho.obterCarrinho(2);

    expect(pedido.status).toBe(StatusPedido.AGUARDANDO_PAGAMENTO);
    expect(pedido.valorTotal).toBe(500);
    expect(produtoDepois?.quantidadeEstoque).toBe(estoqueAntes);
    expect(carrinho.estaVazio()).toBe(true);
  });

  it("admin aprova pagamento, baixa estoque e pedido vira pago", async () => {
    const admin = await context.repositories.usuarios.buscarPorId(1);
    expect(admin).toBeDefined();

    await context.services.carrinho.adicionarItem(2, 1, 2);
    const produtoAntes = await context.repositories.produtos.buscarPorId(1);
    const estoqueAntes = produtoAntes?.quantidadeEstoque ?? 0;
    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco
    });

    const pedidoPago = await context.services.pedido.confirmarPagamento(
      admin!,
      pedido.id,
      ResultadoPagamento.APROVADO
    );

    const produtoDepois = await context.repositories.produtos.buscarPorId(1);
    expect(pedidoPago.status).toBe(StatusPedido.PAGO);
    expect(produtoDepois?.quantidadeEstoque).toBe(estoqueAntes - 2);
  });

  it("dupla aprovacao de pagamento nao baixa estoque duas vezes", async () => {
    const admin = await context.repositories.usuarios.buscarPorId(1);
    expect(admin).toBeDefined();

    await context.services.carrinho.adicionarItem(2, 1, 2);
    const produtoAntes = await context.repositories.produtos.buscarPorId(1);
    const estoqueAntes = produtoAntes?.quantidadeEstoque ?? 0;
    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco
    });

    await context.services.pedido.confirmarPagamento(admin!, pedido.id, ResultadoPagamento.APROVADO);
    const produtoAposPrimeiraAprovacao = await context.repositories.produtos.buscarPorId(1);

    await expect(
      context.services.pedido.confirmarPagamento(admin!, pedido.id, ResultadoPagamento.APROVADO)
    ).rejects.toThrow();

    const produtoDepois = await context.repositories.produtos.buscarPorId(1);
    expect(produtoAposPrimeiraAprovacao?.quantidadeEstoque).toBe(estoqueAntes - 2);
    expect(produtoDepois?.quantidadeEstoque).toBe(estoqueAntes - 2);
  });

  it("recusar pedido ja pago falha sem alterar estoque", async () => {
    const admin = await context.repositories.usuarios.buscarPorId(1);
    expect(admin).toBeDefined();

    await context.services.carrinho.adicionarItem(2, 1, 1);
    const produtoAntes = await context.repositories.produtos.buscarPorId(1);
    const estoqueAntes = produtoAntes?.quantidadeEstoque ?? 0;
    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco
    });

    await context.services.pedido.confirmarPagamento(admin!, pedido.id, ResultadoPagamento.APROVADO);
    const produtoAposAprovacao = await context.repositories.produtos.buscarPorId(1);

    await expect(
      context.services.pedido.confirmarPagamento(admin!, pedido.id, ResultadoPagamento.RECUSADO)
    ).rejects.toThrow();

    const produtoDepois = await context.repositories.produtos.buscarPorId(1);
    const pedidoDepois = await context.repositories.pedidos.buscarPorId(pedido.id);
    expect(produtoAposAprovacao?.quantidadeEstoque).toBe(estoqueAntes - 1);
    expect(produtoDepois?.quantidadeEstoque).toBe(estoqueAntes - 1);
    expect(pedidoDepois?.status).toBe(StatusPedido.PAGO);
  });

  it("aprovar pedido cancelado falha sem alterar estoque", async () => {
    const admin = await context.repositories.usuarios.buscarPorId(1);
    expect(admin).toBeDefined();

    await context.services.carrinho.adicionarItem(2, 2, 1);
    const produtoAntes = await context.repositories.produtos.buscarPorId(2);
    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco
    });

    await context.services.pedido.confirmarPagamento(admin!, pedido.id, ResultadoPagamento.RECUSADO);

    await expect(
      context.services.pedido.confirmarPagamento(admin!, pedido.id, ResultadoPagamento.APROVADO)
    ).rejects.toThrow();

    const produtoDepois = await context.repositories.produtos.buscarPorId(2);
    const pedidoDepois = await context.repositories.pedidos.buscarPorId(pedido.id);
    expect(produtoDepois?.quantidadeEstoque).toBe(produtoAntes?.quantidadeEstoque);
    expect(pedidoDepois?.status).toBe(StatusPedido.CANCELADO);
  });

  it("admin recusa pagamento, pedido vira cancelado e estoque nao e estornado sem baixa previa", async () => {
    const admin = await context.repositories.usuarios.buscarPorId(1);
    expect(admin).toBeDefined();

    await context.services.carrinho.adicionarItem(2, 2, 1);
    const produtoAntes = await context.repositories.produtos.buscarPorId(2);

    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco
    });

    const pedidoCancelado = await context.services.pedido.confirmarPagamento(
      admin!,
      pedido.id,
      ResultadoPagamento.RECUSADO
    );

    const produtoDepois = await context.repositories.produtos.buscarPorId(2);
    expect(pedidoCancelado.status).toBe(StatusPedido.CANCELADO);
    expect(produtoDepois?.quantidadeEstoque).toBe(produtoAntes?.quantidadeEstoque);
  });

  it("bloqueia administracao para cliente", async () => {
    const cliente = await context.repositories.usuarios.buscarPorId(2);
    expect(cliente).toBeDefined();

    await expect(
      context.services.administracao.criarCategoria(cliente!, {
        nome: "Restrita",
        descricao: "Nao deve criar"
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
