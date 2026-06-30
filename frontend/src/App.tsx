import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Tags,
  Trash2
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiClient,
  Carrinho,
  Categoria,
  Pedido,
  Produto,
  ProdutoInput,
  ResultadoPagamento,
  Usuario,
  formatarMoeda
} from "./api.js";

type View = "catalogo" | "carrinho" | "checkout" | "pedidos" | "admin";

const seed = {
  cliente: { email: "cliente@ecommerce.local", senha: "cliente123" },
  admin: { email: "admin@ecommerce.local", senha: "admin123" }
};

const produtoVazio: ProdutoInput = {
  nome: "",
  descricao: "",
  imagemUrl: "https://example.com/produto.jpg",
  preco: 1,
  quantidadeEstoque: 1,
  categoriaId: 1,
  ativo: true
};

export function App() {
  const [api] = useState(() => new ApiClient(localStorage.getItem("token") ?? undefined));
  const [token, setToken] = useState(() => localStorage.getItem("token") ?? "");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [view, setView] = useState<View>("catalogo");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const carregarBase = useCallback(async () => {
    const [categoriasApi, produtosApi] = await Promise.all([api.listarCategorias(), api.listarProdutos()]);
    setCategorias(categoriasApi);
    setProdutos(produtosApi);
  }, [api]);

  const carregarCarrinho = useCallback(async () => {
    if (!token) return;
    setCarrinho(await api.obterCarrinho());
  }, [api, token]);

  const carregarPedidos = useCallback(async () => {
    if (!token) return;
    setPedidos(await api.listarPedidos());
  }, [api, token]);

  useEffect(() => {
    void carregarBase().catch((error: Error) => setErro(error.message));
  }, [carregarBase]);

  useEffect(() => {
    if (!token) return;
    api.setToken(token);
    void api
      .me()
      .then(setUsuario)
      .then(carregarCarrinho)
      .then(carregarPedidos)
      .catch(() => {
        localStorage.removeItem("token");
        setToken("");
        api.setToken(undefined);
      });
  }, [api, carregarCarrinho, carregarPedidos, token]);

  async function executar(acao: () => Promise<void>, sucesso?: string) {
    setErro("");
    setMensagem("");
    try {
      await acao();
      if (sucesso) setMensagem(sucesso);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    }
  }

  async function login(email: string, senha: string) {
    await executar(async () => {
      const resposta = await api.login(email, senha);
      api.setToken(resposta.token);
      localStorage.setItem("token", resposta.token);
      setToken(resposta.token);
      setUsuario(resposta.usuario);
      setView(resposta.usuario.papel === "ADMIN" ? "admin" : "catalogo");
      setCarrinho(await api.obterCarrinho());
      setPedidos(await api.listarPedidos());
    });
  }

  function sair() {
    localStorage.removeItem("token");
    api.setToken(undefined);
    setToken("");
    setUsuario(null);
    setCarrinho(null);
    setPedidos([]);
    setView("catalogo");
  }

  const produtoPorId = useMemo(() => new Map(produtos.map((produto) => [produto.id, produto])), [produtos]);

  return (
    <main>
      <header className="topbar">
        <div>
          <strong>E-commerce Sistema</strong>
          <span>{usuario ? `${usuario.nome} (${usuario.papel})` : "Acesso local"}</span>
        </div>
        {usuario && (
          <nav>
            <button onClick={() => setView("catalogo")}>
              <Package size={18} /> Catálogo
            </button>
            <button onClick={() => setView("carrinho")}>
              <ShoppingCart size={18} /> Carrinho
            </button>
            <button onClick={() => setView("pedidos")}>
              <Boxes size={18} /> Pedidos
            </button>
            {usuario.papel === "ADMIN" && (
              <button onClick={() => setView("admin")}>
                <LayoutDashboard size={18} /> Admin
              </button>
            )}
            <button onClick={sair}>
              <LogOut size={18} /> Sair
            </button>
          </nav>
        )}
      </header>

      {erro && <p className="alert erro">{erro}</p>}
      {mensagem && <p className="alert ok">{mensagem}</p>}

      {!usuario ? (
        <Login onLogin={login} />
      ) : (
        <>
          {view === "catalogo" && (
            <ProductCatalog
              categorias={categorias}
              produtos={produtos.filter((produto) => produto.ativo)}
              onAdd={(produtoId) =>
                executar(async () => setCarrinho(await api.adicionarItem(produtoId, 1)), "Produto adicionado.")
              }
            />
          )}
          {view === "carrinho" && carrinho && (
            <CarrinhoView
              carrinho={carrinho}
              produtoPorId={produtoPorId}
              onQuantidade={(produtoId, quantidade) =>
                executar(async () => setCarrinho(await api.alterarItem(produtoId, quantidade)))
              }
              onRemover={(produtoId) => executar(async () => setCarrinho(await api.removerItem(produtoId)))}
              onCheckout={() => setView("checkout")}
            />
          )}
          {view === "checkout" && carrinho && (
            <CheckoutView
              total={carrinho.total}
              onSubmit={(input) =>
                executar(async () => {
                  await api.checkout(input);
                  setCarrinho(await api.obterCarrinho());
                  setPedidos(await api.listarPedidos());
                  setView("pedidos");
                }, "Checkout finalizado.")
              }
            />
          )}
          {view === "pedidos" && <PedidosView pedidos={pedidos} />}
          {view === "admin" && usuario.papel === "ADMIN" && (
            <AdminView
              api={api}
              categorias={categorias}
              produtos={produtos}
              pedidos={pedidos}
              onRefresh={async () => {
                await carregarBase();
                await carregarPedidos();
              }}
              executar={executar}
            />
          )}
        </>
      )}
    </main>
  );
}

function Login({ onLogin }: { onLogin: (email: string, senha: string) => Promise<void> }) {
  const [email, setEmail] = useState(seed.cliente.email);
  const [senha, setSenha] = useState(seed.cliente.senha);

  function preencher(tipo: "cliente" | "admin") {
    setEmail(seed[tipo].email);
    setSenha(seed[tipo].senha);
  }

  return (
    <section className="panel login">
      <h1>Login</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onLogin(email, senha);
        }}
      >
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} />
        </label>
        <div className="actions">
          <button type="button" onClick={() => preencher("cliente")}>
            Cliente seed
          </button>
          <button type="button" onClick={() => preencher("admin")}>
            Admin seed
          </button>
          <button className="primary" type="submit">
            Entrar
          </button>
        </div>
      </form>
    </section>
  );
}

export function ProductCatalog({
  categorias,
  produtos,
  onAdd
}: {
  categorias: Categoria[];
  produtos: Produto[];
  onAdd: (produtoId: number) => void;
}) {
  const [categoriaId, setCategoriaId] = useState("todas");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Produto | null>(null);

  const filtrados = produtos.filter((produto) => {
    const porCategoria = categoriaId === "todas" || produto.categoria.id === Number(categoriaId);
    const porBusca = produto.nome.toLowerCase().includes(busca.trim().toLowerCase());
    return porCategoria && porBusca;
  });

  return (
    <section>
      <div className="toolbar">
        <label>
          <Tags size={18} />
          <select value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)}>
            <option value="todas">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <Search size={18} />
          <input
            aria-label="Buscar por nome"
            placeholder="Buscar por nome"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>
      </div>

      <div className="grid">
        {filtrados.map((produto) => (
          <article className="card produto" key={produto.id}>
            <div className="thumb">{produto.nome.slice(0, 2).toUpperCase()}</div>
            <h2>{produto.nome}</h2>
            <p>{produto.descricao}</p>
            <strong>{formatarMoeda(produto.preco)}</strong>
            <span>{produto.categoria.nome}</span>
            <div className="actions">
              <button onClick={() => setSelecionado(produto)}>Detalhes</button>
              <button className="primary" onClick={() => onAdd(produto.id)} disabled={produto.quantidadeEstoque <= 0}>
                <ShoppingCart size={18} /> Adicionar
              </button>
            </div>
          </article>
        ))}
      </div>

      {selecionado && (
        <dialog open>
          <h2>{selecionado.nome}</h2>
          <p>{selecionado.descricao}</p>
          <p>Categoria: {selecionado.categoria.nome}</p>
          <p>Estoque: {selecionado.quantidadeEstoque}</p>
          <strong>{formatarMoeda(selecionado.preco)}</strong>
          <div className="actions">
            <button onClick={() => setSelecionado(null)}>Fechar</button>
            <button className="primary" onClick={() => onAdd(selecionado.id)}>
              <ShoppingCart size={18} /> Adicionar
            </button>
          </div>
        </dialog>
      )}
    </section>
  );
}

function CarrinhoView({
  carrinho,
  produtoPorId,
  onQuantidade,
  onRemover,
  onCheckout
}: {
  carrinho: Carrinho;
  produtoPorId: Map<number, Produto>;
  onQuantidade: (produtoId: number, quantidade: number) => void;
  onRemover: (produtoId: number) => void;
  onCheckout: () => void;
}) {
  return (
    <section className="panel">
      <h1>Carrinho</h1>
      {carrinho.itens.length === 0 ? (
        <p>Carrinho vazio.</p>
      ) : (
        <>
          <div className="list">
            {carrinho.itens.map((item) => {
              const produto = produtoPorId.get(item.produtoId);
              return (
                <article className="row" key={item.produtoId}>
                  <div>
                    <strong>{produto?.nome ?? `Produto ${item.produtoId}`}</strong>
                    <span>{formatarMoeda(item.precoUnitario)}</span>
                  </div>
                  <div className="quantity">
                    <button onClick={() => onQuantidade(item.produtoId, Math.max(1, item.quantidade - 1))}>
                      <Minus size={16} />
                    </button>
                    <input
                      aria-label={`Quantidade ${produto?.nome ?? item.produtoId}`}
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(event) => onQuantidade(item.produtoId, Number(event.target.value))}
                    />
                    <button onClick={() => onQuantidade(item.produtoId, item.quantidade + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <strong>{formatarMoeda(item.subtotal)}</strong>
                  <button onClick={() => onRemover(item.produtoId)}>
                    <Trash2 size={16} /> Remover
                  </button>
                </article>
              );
            })}
          </div>
          <footer className="total">
            <strong>Total: {formatarMoeda(carrinho.total)}</strong>
            <button className="primary" onClick={onCheckout}>
              <CreditCard size={18} /> Checkout
            </button>
          </footer>
        </>
      )}
    </section>
  );
}

function CheckoutView({
  total,
  onSubmit
}: {
  total: number;
  onSubmit: (input: {
    enderecoEntrega: Pedido["enderecoEntrega"];
    resultadoPagamento: ResultadoPagamento;
  }) => void;
}) {
  const [endereco, setEndereco] = useState({
    cep: "01001000",
    logradouro: "Praca da Se",
    numero: "100",
    complemento: "",
    cidade: "Sao Paulo",
    estado: "SP"
  });
  const [resultadoPagamento, setResultadoPagamento] = useState<ResultadoPagamento>("APROVADO");

  function atualizar(campo: keyof typeof endereco, valor: string) {
    setEndereco((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <section className="panel">
      <h1>Checkout</h1>
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ enderecoEntrega: endereco, resultadoPagamento });
        }}
      >
        {Object.entries(endereco).map(([campo, valor]) => (
          <label key={campo}>
            {campo}
            <input value={valor} onChange={(event) => atualizar(campo as keyof typeof endereco, event.target.value)} />
          </label>
        ))}
        <label>
          Pagamento
          <select
            value={resultadoPagamento}
            onChange={(event) => setResultadoPagamento(event.target.value as ResultadoPagamento)}
          >
            <option value="APROVADO">Aprovado</option>
            <option value="RECUSADO">Recusado</option>
          </select>
        </label>
        <footer className="total">
          <strong>Total: {formatarMoeda(total)}</strong>
          <button className="primary" type="submit">
            Finalizar
          </button>
        </footer>
      </form>
    </section>
  );
}

function PedidosView({ pedidos }: { pedidos: Pedido[] }) {
  return (
    <section className="panel">
      <h1>Pedidos</h1>
      <div className="list">
        {pedidos.map((pedido) => (
          <article className="card" key={pedido.id}>
            <div className="split">
              <strong>Pedido #{pedido.id}</strong>
              <span>{pedido.status}</span>
            </div>
            <p>{formatarMoeda(pedido.valorTotal)}</p>
            <small>{new Date(pedido.dataCriacao).toLocaleString("pt-BR")}</small>
            <ul>
              {pedido.itens.map((item) => (
                <li key={item.produtoId}>
                  {item.quantidade}x {item.nomeProduto}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminView({
  api,
  categorias,
  produtos,
  pedidos,
  onRefresh,
  executar
}: {
  api: ApiClient;
  categorias: Categoria[];
  produtos: Produto[];
  pedidos: Pedido[];
  onRefresh: () => Promise<void>;
  executar: (acao: () => Promise<void>, sucesso?: string) => Promise<void>;
}) {
  return (
    <section className="admin">
      <AdminCategorias api={api} categorias={categorias} executar={executar} onRefresh={onRefresh} />
      <AdminProdutos api={api} categorias={categorias} produtos={produtos} executar={executar} onRefresh={onRefresh} />
      <AdminPedidos api={api} pedidos={pedidos} executar={executar} onRefresh={onRefresh} />
    </section>
  );
}

function AdminCategorias({
  api,
  categorias,
  executar,
  onRefresh
}: {
  api: ApiClient;
  categorias: Categoria[];
  executar: (acao: () => Promise<void>, sucesso?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await executar(async () => {
      if (editandoId) await api.atualizarCategoria(editandoId, { nome, descricao });
      else await api.criarCategoria({ nome, descricao });
      setEditandoId(null);
      setNome("");
      setDescricao("");
      await onRefresh();
    }, "Categoria salva.");
  }

  function editar(categoria: Categoria) {
    setEditandoId(categoria.id);
    setNome(categoria.nome);
    setDescricao(categoria.descricao);
  }

  return (
    <section className="panel">
      <h1>Categorias</h1>
      <form onSubmit={submit} className="inline-form">
        <input placeholder="Nome" value={nome} onChange={(event) => setNome(event.target.value)} />
        <input placeholder="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        <button className="primary" type="submit">
          {editandoId ? "Atualizar" : "Criar"}
        </button>
      </form>
      <div className="list compact">
        {categorias.map((categoria) => (
          <article className="row" key={categoria.id}>
            <span>
              {categoria.nome} - {categoria.descricao}
            </span>
            <button onClick={() => editar(categoria)}>Editar</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminProdutos({
  api,
  categorias,
  produtos,
  executar,
  onRefresh
}: {
  api: ApiClient;
  categorias: Categoria[];
  produtos: Produto[];
  executar: (acao: () => Promise<void>, sucesso?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProdutoInput>(() => ({ ...produtoVazio, categoriaId: categorias[0]?.id ?? 1 }));
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    const primeiraCategoria = categorias[0];
    if (primeiraCategoria && form.categoriaId === 1) {
      setForm((atual) => ({ ...atual, categoriaId: primeiraCategoria.id }));
    }
  }, [categorias, form.categoriaId]);

  function campo<K extends keyof ProdutoInput>(nome: K, valor: ProdutoInput[K]) {
    setForm((atual) => ({ ...atual, [nome]: valor }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await executar(async () => {
      if (editandoId) await api.atualizarProduto(editandoId, form);
      else await api.criarProduto(form);
      setEditandoId(null);
      setForm({ ...produtoVazio, categoriaId: categorias[0]?.id ?? 1 });
      await onRefresh();
    }, "Produto salvo.");
  }

  function editar(produto: Produto) {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome,
      descricao: produto.descricao,
      imagemUrl: produto.imagemUrl,
      preco: produto.preco,
      quantidadeEstoque: produto.quantidadeEstoque,
      categoriaId: produto.categoria.id,
      ativo: produto.ativo
    });
  }

  return (
    <section className="panel">
      <h1>Produtos</h1>
      <form onSubmit={submit} className="form-grid">
        <input placeholder="Nome" value={form.nome} onChange={(event) => campo("nome", event.target.value)} />
        <input
          placeholder="Descrição"
          value={form.descricao}
          onChange={(event) => campo("descricao", event.target.value)}
        />
        <input
          placeholder="Imagem URL"
          value={form.imagemUrl}
          onChange={(event) => campo("imagemUrl", event.target.value)}
        />
        <input
          type="number"
          min={1}
          step="0.01"
          value={form.preco}
          onChange={(event) => campo("preco", Number(event.target.value))}
        />
        <input
          type="number"
          min={0}
          value={form.quantidadeEstoque}
          onChange={(event) => campo("quantidadeEstoque", Number(event.target.value))}
        />
        <select value={form.categoriaId} onChange={(event) => campo("categoriaId", Number(event.target.value))}>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
        <label className="check">
          <input
            type="checkbox"
            checked={form.ativo ?? true}
            onChange={(event) => campo("ativo", event.target.checked)}
          />
          Ativo
        </label>
        <button className="primary" type="submit">
          {editandoId ? "Atualizar" : "Criar"}
        </button>
      </form>
      <div className="list">
        {produtos.map((produto) => (
          <article className="row" key={produto.id}>
            <div>
              <strong>{produto.nome}</strong>
              <span>
                {formatarMoeda(produto.preco)} - {produto.categoria.nome} - {produto.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            <button onClick={() => editar(produto)}>Editar</button>
            <button
              onClick={() =>
                executar(async () => {
                  await api.alternarProduto(produto);
                  await onRefresh();
                }, "Status atualizado.")
              }
            >
              {produto.ativo ? "Desativar" : "Ativar"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminPedidos({
  api,
  pedidos,
  executar,
  onRefresh
}: {
  api: ApiClient;
  pedidos: Pedido[];
  executar: (acao: () => Promise<void>, sucesso?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  return (
    <section className="panel">
      <h1>Pedidos Admin</h1>
      <div className="list">
        {pedidos.map((pedido) => (
          <article className="row" key={pedido.id}>
            <div>
              <strong>#{pedido.id} - {pedido.status}</strong>
              <span>
                Cliente {pedido.usuarioId} - {formatarMoeda(pedido.valorTotal)}
              </span>
            </div>
            <button
              onClick={() =>
                executar(async () => {
                  await api.confirmarPagamento(pedido.id, "APROVADO");
                  await onRefresh();
                }, "Pagamento aprovado.")
              }
            >
              Aprovar
            </button>
            <button
              onClick={() =>
                executar(async () => {
                  await api.confirmarPagamento(pedido.id, "RECUSADO");
                  await onRefresh();
                }, "Pagamento recusado.")
              }
            >
              Recusar
            </button>
            <button
              onClick={() =>
                executar(async () => {
                  await api.enviarPedido(pedido.id);
                  await onRefresh();
                }, "Pedido enviado.")
              }
            >
              Enviar
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
