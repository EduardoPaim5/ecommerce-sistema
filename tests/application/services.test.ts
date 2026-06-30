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

  it("finaliza checkout, baixa estoque e limpa carrinho", async () => {
    await context.services.carrinho.adicionarItem(2, 1, 2);
    const produtoAntes = await context.repositories.produtos.buscarPorId(1);
    const estoqueAntes = produtoAntes?.quantidadeEstoque ?? 0;

    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco,
      resultadoPagamento: ResultadoPagamento.APROVADO
    });

    const produtoDepois = await context.repositories.produtos.buscarPorId(1);
    const carrinho = await context.services.carrinho.obterCarrinho(2);

    expect(pedido.status).toBe(StatusPedido.PAGO);
    expect(pedido.valorTotal).toBe(500);
    expect(produtoDepois?.quantidadeEstoque).toBe(estoqueAntes - 2);
    expect(carrinho.estaVazio()).toBe(true);
  });

  it("estorna estoque quando pagamento do checkout e recusado", async () => {
    await context.services.carrinho.adicionarItem(2, 2, 1);
    const produtoAntes = await context.repositories.produtos.buscarPorId(2);

    const pedido = await context.services.checkout.finalizarCompra({
      usuarioId: 2,
      enderecoEntrega: endereco,
      resultadoPagamento: ResultadoPagamento.RECUSADO
    });

    const produtoDepois = await context.repositories.produtos.buscarPorId(2);
    expect(pedido.status).toBe(StatusPedido.CANCELADO);
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
