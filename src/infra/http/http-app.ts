import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import { AppContext, criarAppContext } from "../../application/app-context.js";
import {
  serializarCarrinho,
  serializarCategoria,
  serializarPedido,
  serializarProduto,
  serializarUsuario
} from "../../application/serializers.js";
import { ApplicationError } from "../../application/errors/application-error.js";
import { DomainError } from "../../domain/errors/domain-error.js";
import { ResultadoPagamento } from "../../domain/enums/resultado-pagamento.js";
import { carregarSeeds } from "../seeds/seed.js";

type HttpAppOptions = {
  context?: AppContext;
  seed?: boolean;
};

export async function criarHttpApp(options: HttpAppOptions = {}): Promise<FastifyInstance> {
  const context = options.context ?? criarAppContext();
  if (options.seed ?? true) await carregarSeeds(context);

  const app = Fastify({ logger: false });
  registrarTratamentoErros(app);
  registrarRotas(app, context);
  return app;
}

function registrarRotas(app: FastifyInstance, context: AppContext): void {
  app.get("/health", async () => ({ status: "ok" }));

  app.post("/auth/register", async (request, reply) => {
    const body = objeto(request.body);
    const usuario = await context.services.autenticacao.registrar({
      nome: texto(body.nome),
      email: texto(body.email),
      senha: texto(body.senha)
    });
    return reply.code(201).send(usuario);
  });

  app.post("/auth/login", async (request) => {
    const body = objeto(request.body);
    return context.services.autenticacao.login({
      email: texto(body.email),
      senha: texto(body.senha)
    });
  });

  app.post("/auth/logout", async (request, reply) => {
    await context.services.autenticacao.logout(extrairToken(request));
    return reply.code(204).send();
  });

  app.get("/auth/me", async (request) => {
    const usuario = await autenticar(request, context);
    return serializarUsuario(usuario);
  });

  app.get("/catalogo/categorias", async () => {
    const categorias = await context.services.catalogo.listarCategorias();
    return categorias.map(serializarCategoria);
  });

  app.get("/catalogo/produtos", async (request) => {
    const query = objeto(request.query);
    const categoriaId = query.categoriaId === undefined ? undefined : numero(query.categoriaId);
    const produtos = await context.services.catalogo.listarProdutos(
      categoriaId === undefined ? {} : { categoriaId }
    );
    return produtos.map(serializarProduto);
  });

  app.get("/catalogo/produtos/:id", async (request) => {
    const produto = await context.services.catalogo.obterProduto(paramId(request));
    return serializarProduto(produto);
  });

  app.get("/carrinho", async (request) => {
    const usuario = await autenticar(request, context);
    const carrinho = await context.services.carrinho.obterCarrinho(usuario.id);
    return serializarCarrinho(carrinho);
  });

  app.post("/carrinho/itens", async (request, reply) => {
    const usuario = await autenticar(request, context);
    const body = objeto(request.body);
    const carrinho = await context.services.carrinho.adicionarItem(
      usuario.id,
      numero(body.produtoId),
      numero(body.quantidade)
    );
    return reply.code(201).send(serializarCarrinho(carrinho));
  });

  app.patch("/carrinho/itens/:produtoId", async (request) => {
    const usuario = await autenticar(request, context);
    const body = objeto(request.body);
    const carrinho = await context.services.carrinho.alterarItem(
      usuario.id,
      paramNumero(request, "produtoId"),
      numero(body.quantidade)
    );
    return serializarCarrinho(carrinho);
  });

  app.delete("/carrinho/itens/:produtoId", async (request) => {
    const usuario = await autenticar(request, context);
    const carrinho = await context.services.carrinho.removerItem(usuario.id, paramNumero(request, "produtoId"));
    return serializarCarrinho(carrinho);
  });

  app.delete("/carrinho", async (request) => {
    const usuario = await autenticar(request, context);
    const carrinho = await context.services.carrinho.limpar(usuario.id);
    return serializarCarrinho(carrinho);
  });

  app.post("/checkout", async (request, reply) => {
    const usuario = await autenticar(request, context);
    const body = objeto(request.body);
    const checkoutInput = {
      usuarioId: usuario.id,
      enderecoEntrega: objeto(body.enderecoEntrega) as {
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string;
        cidade: string;
        estado: string;
      }
    };
    const pedido = await context.services.checkout.finalizarCompra(checkoutInput);
    return reply.code(201).send(serializarPedido(pedido));
  });

  app.get("/pedidos", async (request) => {
    const usuario = await autenticar(request, context);
    const pedidos = await context.services.pedido.listar(usuario);
    return pedidos.map(serializarPedido);
  });

  app.get("/pedidos/:id", async (request) => {
    const usuario = await autenticar(request, context);
    const pedido = await context.services.pedido.obter(usuario, paramId(request));
    return serializarPedido(pedido);
  });

  app.patch("/pedidos/:id/cancelar", async (request) => {
    const usuario = await autenticar(request, context);
    const pedido = await context.services.pedido.cancelar(usuario, paramId(request));
    return serializarPedido(pedido);
  });

  app.patch("/pedidos/:id/confirmar-recebimento", async (request) => {
    const usuario = await autenticar(request, context);
    const pedido = await context.services.pedido.confirmarRecebimento(usuario, paramId(request));
    return serializarPedido(pedido);
  });

  app.patch("/admin/pedidos/:id/pagamento", async (request) => {
    const usuario = await autenticar(request, context);
    const body = objeto(request.body);
    const pedido = await context.services.pedido.confirmarPagamento(
      usuario,
      paramId(request),
      resultadoPagamento(body.resultado)
    );
    return serializarPedido(pedido);
  });

  app.patch("/admin/pedidos/:id/enviar", async (request) => {
    const usuario = await autenticar(request, context);
    const pedido = await context.services.pedido.enviar(usuario, paramId(request));
    return serializarPedido(pedido);
  });

  app.post("/admin/categorias", async (request, reply) => {
    const usuario = await autenticar(request, context);
    const body = objeto(request.body);
    const categoria = await context.services.administracao.criarCategoria(usuario, {
      nome: texto(body.nome),
      descricao: texto(body.descricao)
    });
    return reply.code(201).send(serializarCategoria(categoria));
  });

  app.put("/admin/categorias/:id", async (request) => {
    const usuario = await autenticar(request, context);
    const body = objeto(request.body);
    const categoria = await context.services.administracao.atualizarCategoria(usuario, paramId(request), {
      nome: texto(body.nome),
      descricao: texto(body.descricao)
    });
    return serializarCategoria(categoria);
  });

  app.post("/admin/produtos", async (request, reply) => {
    const usuario = await autenticar(request, context);
    const produto = await context.services.administracao.criarProduto(usuario, produtoInput(request.body));
    return reply.code(201).send(serializarProduto(produto));
  });

  app.put("/admin/produtos/:id", async (request) => {
    const usuario = await autenticar(request, context);
    const produto = await context.services.administracao.atualizarProduto(
      usuario,
      paramId(request),
      produtoInput(request.body)
    );
    return serializarProduto(produto);
  });

  app.patch("/admin/produtos/:id/ativar", async (request) => {
    const usuario = await autenticar(request, context);
    const produto = await context.services.administracao.ativarProduto(usuario, paramId(request));
    return serializarProduto(produto);
  });

  app.patch("/admin/produtos/:id/desativar", async (request) => {
    const usuario = await autenticar(request, context);
    const produto = await context.services.administracao.desativarProduto(usuario, paramId(request));
    return serializarProduto(produto);
  });
}

function registrarTratamentoErros(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApplicationError) {
      return reply.code(error.statusCode).send({ error: error.message });
    }
    if (error instanceof DomainError) {
      return reply.code(400).send({ error: error.message });
    }
    return reply.code(500).send({ error: "Erro interno." });
  });
}

async function autenticar(request: FastifyRequest, context: AppContext) {
  return context.services.autenticacao.autenticarToken(extrairToken(request));
}

function extrairToken(request: FastifyRequest): string | undefined {
  const authorization = request.headers.authorization;
  if (!authorization) return undefined;
  const [tipo, token] = authorization.split(" ");
  return tipo?.toLowerCase() === "bearer" ? token : authorization;
}

function paramId(request: FastifyRequest): number {
  return paramNumero(request, "id");
}

function paramNumero(request: FastifyRequest, nome: string): number {
  const params = objeto(request.params);
  return numero(params[nome]);
}

function produtoInput(body: unknown): {
  nome: string;
  descricao: string;
  imagemUrl: string;
  preco: number;
  quantidadeEstoque: number;
  categoriaId: number;
  ativo?: boolean;
} {
  const input = objeto(body);
  const produto = {
    nome: texto(input.nome),
    descricao: texto(input.descricao),
    imagemUrl: texto(input.imagemUrl),
    preco: numero(input.preco),
    quantidadeEstoque: numero(input.quantidadeEstoque),
    categoriaId: numero(input.categoriaId)
  };
  return input.ativo === undefined ? produto : { ...produto, ativo: Boolean(input.ativo) };
}

function objeto(valor: unknown): Record<string, unknown> {
  if (typeof valor !== "object" || valor === null) throw new ApplicationError("Payload invalido.", 400);
  return valor as Record<string, unknown>;
}

function texto(valor: unknown): string {
  if (typeof valor !== "string") throw new ApplicationError("Campo textual invalido.", 400);
  return valor;
}

function numero(valor: unknown): number {
  const numeroConvertido = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(numeroConvertido)) throw new ApplicationError("Campo numerico invalido.", 400);
  return numeroConvertido;
}

function resultadoPagamento(valor: unknown): ResultadoPagamento {
  if (valor === ResultadoPagamento.APROVADO || valor === ResultadoPagamento.RECUSADO) return valor;
  throw new ApplicationError("Resultado de pagamento invalido.", 400);
}
