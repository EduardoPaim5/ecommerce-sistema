import { DomainError } from "../errors/domain-error.js";

export type EnderecoProps = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  estado: string;
};

export class Endereco {
  readonly cep: string;
  readonly logradouro: string;
  readonly numero: string;
  readonly complemento: string;
  readonly cidade: string;
  readonly estado: string;

  constructor(props: EnderecoProps) {
    if (!props.cep.trim()) throw new DomainError("CEP e obrigatorio.");
    if (!props.logradouro.trim()) throw new DomainError("Logradouro e obrigatorio.");
    if (!props.numero.trim()) throw new DomainError("Numero e obrigatorio.");
    if (!props.cidade.trim()) throw new DomainError("Cidade e obrigatoria.");
    if (!props.estado.trim()) throw new DomainError("Estado e obrigatorio.");

    this.cep = props.cep;
    this.logradouro = props.logradouro;
    this.numero = props.numero;
    this.complemento = props.complemento ?? "";
    this.cidade = props.cidade;
    this.estado = props.estado;
  }
}
