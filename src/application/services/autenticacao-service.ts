import { Usuario } from "../../domain/entities/usuario.js";
import { PapelUsuario } from "../../domain/enums/papel-usuario.js";
import { ApplicationError } from "../errors/application-error.js";
import { Repositories } from "../repositories.js";
import { PasswordHasher } from "../security/password-hasher.js";
import { TokenGenerator } from "../security/token-generator.js";

export type UsuarioAutenticado = {
  id: number;
  nome: string;
  email: string;
  papel: PapelUsuario;
};

export class AutenticacaoService {
  constructor(
    private readonly repositories: Repositories,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator
  ) {}

  async registrar(input: { nome: string; email: string; senha: string }): Promise<UsuarioAutenticado> {
    if (!input.senha.trim()) throw new ApplicationError("Senha e obrigatoria.");
    const email = input.email.trim().toLowerCase();
    const usuarioExistente = await this.repositories.usuarios.buscarPorEmail(email);
    if (usuarioExistente) throw new ApplicationError("Email ja cadastrado.", 409);

    const usuario = new Usuario({
      id: this.repositories.usuarios.proximoId(),
      nome: input.nome,
      email,
      senhaHash: this.passwordHasher.hash(input.senha),
      papel: PapelUsuario.CLIENTE
    });

    await this.repositories.usuarios.salvar(usuario);
    return this.toDto(usuario);
  }

  async login(input: { email: string; senha: string }): Promise<{ token: string; usuario: UsuarioAutenticado }> {
    const usuario = await this.repositories.usuarios.buscarPorEmail(input.email);
    if (!usuario || !this.passwordHasher.verify(input.senha, usuario.obterSenhaHash())) {
      throw new ApplicationError("Credenciais invalidas.", 401);
    }

    const token = this.tokenGenerator.gerar();
    await this.repositories.sessoes.salvar(token, usuario.id);
    return { token, usuario: this.toDto(usuario) };
  }

  async autenticarToken(token: string | undefined): Promise<Usuario> {
    if (!token) throw new ApplicationError("Token de autenticacao nao informado.", 401);
    const usuarioId = await this.repositories.sessoes.buscarUsuarioId(token);
    if (!usuarioId) throw new ApplicationError("Sessao invalida.", 401);
    const usuario = await this.repositories.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new ApplicationError("Usuario da sessao nao encontrado.", 401);
    return usuario;
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) await this.repositories.sessoes.remover(token);
  }

  toDto(usuario: Usuario): UsuarioAutenticado {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel
    };
  }

}
