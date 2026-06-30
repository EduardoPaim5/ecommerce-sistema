import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FastifyInstance } from "fastify";
import { criarHttpApp, seedCredentials, StatusPedido } from "../../src/index.js";

describe("API HTTP", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await criarHttpApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("executa fluxo de login, carrinho e checkout", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: seedCredentials.cliente.email, senha: seedCredentials.cliente.senha }
    });
    expect(login.statusCode).toBe(200);
    const { token } = login.json<{ token: string }>();

    const carrinho = await app.inject({
      method: "POST",
      url: "/carrinho/itens",
      headers: { authorization: `Bearer ${token}` },
      payload: { produtoId: 1, quantidade: 1 }
    });
    expect(carrinho.statusCode).toBe(201);
    expect(carrinho.json<{ total: number }>().total).toBe(250);

    const checkout = await app.inject({
      method: "POST",
      url: "/checkout",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        enderecoEntrega: {
          cep: "01001000",
          logradouro: "Praca da Se",
          numero: "100",
          cidade: "Sao Paulo",
          estado: "SP"
        }
      }
    });
    expect(checkout.statusCode).toBe(201);
    expect(checkout.json<{ status: StatusPedido; valorTotal: number }>().status).toBe(StatusPedido.PAGO);

    const pedidos = await app.inject({
      method: "GET",
      url: "/pedidos",
      headers: { authorization: `Bearer ${token}` }
    });
    expect(pedidos.statusCode).toBe(200);
    expect(pedidos.json<unknown[]>()).toHaveLength(1);
  });

  it("protege rotas administrativas", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: seedCredentials.cliente.email, senha: seedCredentials.cliente.senha }
    });
    const { token } = login.json<{ token: string }>();

    const resposta = await app.inject({
      method: "POST",
      url: "/admin/categorias",
      headers: { authorization: `Bearer ${token}` },
      payload: { nome: "Nova", descricao: "Categoria" }
    });

    expect(resposta.statusCode).toBe(403);
  });
});
