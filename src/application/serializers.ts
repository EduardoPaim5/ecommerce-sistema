import { Carrinho } from "../domain/entities/carrinho.js";
import { Categoria } from "../domain/entities/categoria.js";
import { Pedido } from "../domain/entities/pedido.js";
import { Produto } from "../domain/entities/produto.js";
import { Usuario } from "../domain/entities/usuario.js";

export function serializarUsuario(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    dataCadastro: usuario.dataCadastro.toISOString()
  };
}

export function serializarCategoria(categoria: Categoria) {
  return {
    id: categoria.id,
    nome: categoria.nome,
    descricao: categoria.descricao
  };
}

export function serializarProduto(produto: Produto) {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    imagemUrl: produto.imagemUrl,
    preco: produto.preco,
    quantidadeEstoque: produto.quantidadeEstoque,
    ativo: produto.ativo,
    categoria: serializarCategoria(produto.categoria)
  };
}

export function serializarCarrinho(carrinho: Carrinho) {
  return {
    id: carrinho.id,
    usuarioId: carrinho.usuarioId,
    itens: carrinho.itens.map((item) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: item.calcularSubtotal()
    })),
    total: carrinho.calcularTotal(),
    atualizadoEm: carrinho.atualizadoEm.toISOString()
  };
}

export function serializarPedido(pedido: Pedido) {
  return {
    id: pedido.id,
    usuarioId: pedido.usuarioId,
    status: pedido.status,
    valorTotal: pedido.valorTotal,
    dataCriacao: pedido.dataCriacao.toISOString(),
    enderecoEntrega: {
      cep: pedido.enderecoEntrega.cep,
      logradouro: pedido.enderecoEntrega.logradouro,
      numero: pedido.enderecoEntrega.numero,
      complemento: pedido.enderecoEntrega.complemento,
      cidade: pedido.enderecoEntrega.cidade,
      estado: pedido.enderecoEntrega.estado
    },
    itens: pedido.itens.map((item) => ({
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: item.subtotal
    }))
  };
}
