const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token || localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Ocorreu um erro desconhecido';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || Object.values(errorData).join(', ') || errorMessage;
    } catch {
      // JSON parsing failed, use statusText or generic message
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  cadastro: (body: any) => request<any>('/auth/cadastro', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  // Catalog
  listarProdutos: (params?: { busca?: string; categoriaId?: number | string }) => {
    let url = '/catalogo/produtos';
    const query = new URLSearchParams();
    if (params?.busca) query.set('busca', params.busca);
    if (params?.categoriaId) query.set('categoriaId', params.categoriaId.toString());
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;
    return request<any[]>(url);
  },
  listarCategorias: () => request<any[]>('/catalogo/categorias'),
  obterProduto: (id: number | string) => request<any>(`/catalogo/produtos/${id}`),

  // Cart
  obterCarrinho: () => request<any>('/carrinho'),
  adicionarItem: (produtoId: number, quantidade: number) => 
    request<any>('/carrinho/itens', { method: 'POST', body: JSON.stringify({ produtoId, quantidade }) }),
  alterarQuantidade: (produtoId: number, quantidade: number) => 
    request<any>('/carrinho/itens', { method: 'PUT', body: JSON.stringify({ produtoId, quantidade }) }),
  removerItem: (produtoId: number) => 
    request<any>(`/carrinho/itens/${produtoId}`, { method: 'DELETE' }),

  // Orders
  finalizarCompra: (enderecoEntrega: any) => 
    request<any>('/pedidos', { method: 'POST', body: JSON.stringify({ enderecoEntrega }) }),
  listarPedidosCliente: () => request<any[]>('/pedidos'),
  obterPedido: (id: number | string) => request<any>(`/pedidos/${id}`),
  pagarPedido: (id: number | string) => request<any>(`/pedidos/${id}/pagar`, { method: 'POST' }),

  // Admin
  adminListarPedidos: () => request<any[]>('/admin/pedidos'),
  adminAtualizarStatus: (id: number | string, status: string) => 
    request<any>(`/admin/pedidos/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminCadastrarProduto: (body: any) => 
    request<any>('/admin/produtos', { method: 'POST', body: JSON.stringify(body) }),
  adminEditarProduto: (id: number | string, body: any) => 
    request<any>(`/admin/produtos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDesativarProduto: (id: number | string) => 
    request<void>(`/admin/produtos/${id}`, { method: 'DELETE' }),
  adminCadastrarCategoria: (body: any) => 
    request<any>('/admin/categorias', { method: 'POST', body: JSON.stringify(body) }),
  adminEditarCategoria: (id: number | string, body: any) => 
    request<any>(`/admin/categorias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};
