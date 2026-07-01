// Tipos espelhando os DTOs do backend.

export type Papel = 'CLIENTE' | 'ADMIN';

export type StatusPedido =
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface Sessao {
  token: string;
  usuarioId: number;
  nome: string;
  email: string;
  papel: Papel;
  expiraEm: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  imagemUrl: string | null;
  preco: number;
  quantidadeEstoque: number;
  ativo: boolean;
  disponivel: boolean;
  categoria: Categoria;
}

export interface ItemCarrinho {
  produtoId: number;
  nomeProduto: string;
  imagemUrl: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  estoqueDisponivel: number;
}

export interface Carrinho {
  id: number;
  itens: ItemCarrinho[];
  total: number;
  vazio: boolean;
}

export interface ItemPedido {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  cidade: string;
  estado: string;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  itens: ItemPedido[];
  enderecoEntrega: Endereco | null;
  valorTotal: number;
  status: StatusPedido;
  dataCriacao: string;
}
