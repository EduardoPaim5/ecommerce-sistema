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

  async function login(email: string, senha: string): Promise<string> {
    const resposta = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email, senha }
    });
    expect(resposta.statusCode).toBe(200);
    return resposta.json<{ token: string }>().token;
  }

  it("executa fluxo de login, carrinho e checkout", async () => {
    const token = await login(seedCredentials.cliente.email, seedCredentials.cliente.senha);

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
    expect(checkout.json<{ status: StatusPedido; valorTotal: number }>().status).toBe(
      StatusPedido.AGUARDANDO_PAGAMENTO
    );

    const pedidos = await app.inject({
      method: "GET",
      url: "/pedidos",
      headers: { authorization: `Bearer ${token}` }
    });
    expect(pedidos.statusCode).toBe(200);
    expect(pedidos.json<unknown[]>()).toHaveLength(1);
  });

  it("protege rotas administrativas", async () => {
    const token = await login(seedCredentials.cliente.email, seedCredentials.cliente.senha);

    const resposta = await app.inject({
      method: "POST",
      url: "/admin/categorias",
      headers: { authorization: `Bearer ${token}` },
      payload: { nome: "Nova", descricao: "Categoria" }
    });

    expect(resposta.statusCode).toBe(403);
  });

  it("permite que o administrador envie pedidos pagos", async () => {
    const tokenCliente = await login(seedCredentials.cliente.email, seedCredentials.cliente.senha);
    const tokenAdmin = await login(seedCredentials.admin.email, seedCredentials.admin.senha);

    await app.inject({
      method: "POST",
      url: "/carrinho/itens",
      headers: { authorization: `Bearer ${tokenCliente}` },
      payload: { produtoId: 1, quantidade: 1 }
    });

    const checkout = await app.inject({
      method: "POST",
      url: "/checkout",
      headers: { authorization: `Bearer ${tokenCliente}` },
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
    const pedidoId = checkout.json<{ id: number }>().id;

    const pagamento = await app.inject({
      method: "PATCH",
      url: `/admin/pedidos/${pedidoId}/pagamento`,
      headers: { authorization: `Bearer ${tokenAdmin}` },
      payload: { resultado: "APROVADO" }
    });

    expect(pagamento.statusCode).toBe(200);
    expect(pagamento.json<{ status: StatusPedido }>().status).toBe(StatusPedido.PAGO);

    const resposta = await app.inject({
      method: "PATCH",
      url: `/admin/pedidos/${pedidoId}/enviar`,
      headers: { authorization: `Bearer ${tokenAdmin}` }
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json<{ status: StatusPedido }>().status).toBe(StatusPedido.ENVIADO);
  });

  it("permite que o administrador desative produtos", async () => {
    const tokenAdmin = await login(seedCredentials.admin.email, seedCredentials.admin.senha);

    const resposta = await app.inject({
      method: "PATCH",
      url: "/admin/produtos/1/desativar",
      headers: { authorization: `Bearer ${tokenAdmin}` }
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json<{ ativo: boolean }>().ativo).toBe(false);
  });
});
