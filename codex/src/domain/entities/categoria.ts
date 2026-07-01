import { DomainError } from "../errors/domain-error.js";

export type CategoriaProps = {
  id: number;
  nome: string;
  descricao: string;
};

export class Categoria {
  readonly id: number;
  nome: string;
  descricao: string;

  constructor(props: CategoriaProps) {
    this.id = props.id;
    this.nome = "";
    this.descricao = "";
    this.atualizarDados(props.nome, props.descricao);
  }

  atualizarDados(nome: string, descricao: string): void {
    if (!nome.trim()) throw new DomainError("Nome da categoria e obrigatorio.");

    this.nome = nome;
    this.descricao = descricao;
  }
}
