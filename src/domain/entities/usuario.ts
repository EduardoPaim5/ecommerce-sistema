import { Pedido } from "./pedido.js";
import { PapelUsuario } from "../enums/papel-usuario.js";
import { DomainError } from "../errors/domain-error.js";

export type UsuarioProps = {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  papel: PapelUsuario;
  dataCadastro?: Date;
};

export class Usuario {
  readonly id: number;
  nome: string;
  email: string;
  private readonly senhaHash: string;
  papel: PapelUsuario;
  readonly dataCadastro: Date;

  constructor(props: UsuarioProps) {
    if (!props.nome.trim()) throw new DomainError("Nome do usuario e obrigatorio.");
    if (!props.email.trim()) throw new DomainError("Email do usuario e obrigatorio.");
    if (!props.senhaHash.trim()) throw new DomainError("Hash da senha e obrigatorio.");

    this.id = props.id;
    this.nome = props.nome;
    this.email = props.email;
    this.senhaHash = props.senhaHash;
    this.papel = props.papel;
    this.dataCadastro = props.dataCadastro ?? new Date();
  }

  verificarSenha(senhaHash: string): boolean {
    return this.senhaHash === senhaHash;
  }

  obterSenhaHash(): string {
    return this.senhaHash;
  }

  ehAdministrador(): boolean {
    return this.papel === PapelUsuario.ADMIN;
  }

  podeVisualizarPedido(pedido: Pedido): boolean {
    return this.ehAdministrador() || pedido.usuarioId === this.id;
  }
}
