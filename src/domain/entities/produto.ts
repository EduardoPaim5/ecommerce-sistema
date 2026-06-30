import { Categoria } from "./categoria.js";
import { DomainError } from "../errors/domain-error.js";

export type ProdutoProps = {
  id: number;
  nome: string;
  descricao: string;
  imagemUrl: string;
  preco: number;
  quantidadeEstoque: number;
  categoria: Categoria;
  ativo?: boolean;
};

export class Produto {
  readonly id: number;
  nome: string;
  descricao: string;
  imagemUrl: string;
  preco: number;
  quantidadeEstoque: number;
  categoria: Categoria;
  ativo: boolean;

  constructor(props: ProdutoProps) {
    this.id = props.id;
    this.nome = "";
    this.descricao = "";
    this.imagemUrl = "";
    this.preco = 0;
    this.quantidadeEstoque = 0;
    this.categoria = props.categoria;
    this.ativo = props.ativo ?? true;
    this.atualizarDados(props.nome, props.descricao, props.preco, props.imagemUrl, props.categoria);
    this.definirEstoque(props.quantidadeEstoque);
  }

  atualizarDados(nome: string, descricao: string, preco: number, imagemUrl: string, categoria: Categoria): void {
    if (!nome.trim()) throw new DomainError("Nome do produto e obrigatorio.");
    if (preco < 0) throw new DomainError("Preco do produto nao pode ser negativo.");

    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.imagemUrl = imagemUrl;
    this.categoria = categoria;
  }

  ativar(): void {
    this.ativo = true;
  }

  desativar(): void {
    this.ativo = false;
  }

  temEstoque(quantidade: number): boolean {
    return Number.isInteger(quantidade) && quantidade > 0 && this.quantidadeEstoque >= quantidade;
  }

  baixarEstoque(quantidade: number): void {
    this.validarQuantidadePositiva(quantidade);
    if (!this.temEstoque(quantidade)) throw new DomainError("Estoque insuficiente.");
    this.quantidadeEstoque -= quantidade;
  }

  estornarEstoque(quantidade: number): void {
    this.validarQuantidadePositiva(quantidade);
    this.quantidadeEstoque += quantidade;
  }

  private definirEstoque(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new DomainError("Estoque do produto deve ser um inteiro maior ou igual a zero.");
    }

    this.quantidadeEstoque = quantidade;
  }

  private validarQuantidadePositiva(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new DomainError("Quantidade deve ser um inteiro positivo.");
    }
  }
}
