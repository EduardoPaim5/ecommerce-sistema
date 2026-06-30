export type PapelUsuario = "ADMIN" | "CLIENTE";
export type ResultadoPagamento = "APROVADO" | "RECUSADO";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  papel: PapelUsuario;
};

export type Categoria = {
  id: number;
  nome: string;
  descricao: string;
};

export type Produto = {
  id: number;
  nome: string;
  descricao: string;
  imagemUrl: string;
  preco: number;
  quantidadeEstoque: number;
  ativo: boolean;
  categoria: Categoria;
};

export type Carrinho = {
  id: number;
  usuarioId: number;
  itens: Array<{
    produtoId: number;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }>;
  total: number;
};

export type Pedido = {
  id: number;
  usuarioId: number;
  status: string;
  valorTotal: number;
  dataCriacao: string;
  enderecoEntrega: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    cidade: string;
    estado: string;
  };
  itens: Array<{
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }>;
};

export type ProdutoInput = {
  nome: string;
  descricao: string;
  imagemUrl: string;
  preco: number;
  quantidadeEstoque: number;
  categoriaId: number;
  ativo?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiClient {
  constructor(private token?: string) {}

  setToken(token?: string) {
    this.token = token;
  }

  async login(email: string, senha: string): Promise<{ token: string; usuario: Usuario }> {
    return this.request("/auth/login", { method: "POST", body: { email, senha } });
  }

  async me(): Promise<Usuario> {
    return this.request("/auth/me");
  }

  async listarCategorias(): Promise<Categoria[]> {
    return this.request("/catalogo/categorias");
  }

  async listarProdutos(categoriaId?: number): Promise<Produto[]> {
    const query = categoriaId ? `?categoriaId=${categoriaId}` : "";
    return this.request(`/catalogo/produtos${query}`);
  }

  async obterProduto(id: number): Promise<Produto> {
    return this.request(`/catalogo/produtos/${id}`);
  }

  async obterCarrinho(): Promise<Carrinho> {
    return this.request("/carrinho");
  }

  async adicionarItem(produtoId: number, quantidade: number): Promise<Carrinho> {
    return this.request("/carrinho/itens", { method: "POST", body: { produtoId, quantidade } });
  }

  async alterarItem(produtoId: number, quantidade: number): Promise<Carrinho> {
    return this.request(`/carrinho/itens/${produtoId}`, { method: "PATCH", body: { quantidade } });
  }

  async removerItem(produtoId: number): Promise<Carrinho> {
    return this.request(`/carrinho/itens/${produtoId}`, { method: "DELETE" });
  }

  async checkout(input: {
    enderecoEntrega: Pedido["enderecoEntrega"];
    resultadoPagamento: ResultadoPagamento;
  }): Promise<Pedido> {
    return this.request("/checkout", { method: "POST", body: input });
  }

  async listarPedidos(): Promise<Pedido[]> {
    return this.request("/pedidos");
  }

  async criarCategoria(input: Omit<Categoria, "id">): Promise<Categoria> {
    return this.request("/admin/categorias", { method: "POST", body: input });
  }

  async atualizarCategoria(id: number, input: Omit<Categoria, "id">): Promise<Categoria> {
    return this.request(`/admin/categorias/${id}`, { method: "PUT", body: input });
  }

  async criarProduto(input: ProdutoInput): Promise<Produto> {
    return this.request("/admin/produtos", { method: "POST", body: input });
  }

  async atualizarProduto(id: number, input: ProdutoInput): Promise<Produto> {
    return this.request(`/admin/produtos/${id}`, { method: "PUT", body: input });
  }

  async alternarProduto(produto: Produto): Promise<Produto> {
    const acao = produto.ativo ? "desativar" : "ativar";
    return this.request(`/admin/produtos/${produto.id}/${acao}`, { method: "PATCH" });
  }

  async confirmarPagamento(pedidoId: number, resultado: ResultadoPagamento): Promise<Pedido> {
    return this.request(`/admin/pedidos/${pedidoId}/pagamento`, {
      method: "PATCH",
      body: { resultado }
    });
  }

  async enviarPedido(pedidoId: number): Promise<Pedido> {
    return this.request(`/admin/pedidos/${pedidoId}/enviar`, { method: "PATCH" });
  }

  private async request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    const init: RequestInit = {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
      }
    };
    if (options.body !== undefined) init.body = JSON.stringify(options.body);

    const response = await fetch(`${API_BASE_URL}${path}`, init);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Erro ao chamar API.");
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}

export const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
