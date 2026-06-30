import { Categoria } from "../../domain/entities/categoria.js";
import { Produto } from "../../domain/entities/produto.js";
import { Usuario } from "../../domain/entities/usuario.js";
import { PapelUsuario } from "../../domain/enums/papel-usuario.js";
import { AppContext } from "../../application/app-context.js";

export const seedCredentials = {
  admin: { email: "admin@ecommerce.local", senha: "admin123" },
  cliente: { email: "cliente@ecommerce.local", senha: "cliente123" }
} as const;

export async function carregarSeeds(context: AppContext): Promise<void> {
  const eletronicos = new Categoria({
    id: 1,
    nome: "Eletronicos",
    descricao: "Dispositivos, perifericos e acessorios."
  });
  const livros = new Categoria({
    id: 2,
    nome: "Livros",
    descricao: "Livros tecnicos e literatura."
  });

  await context.repositories.categorias.salvar(eletronicos);
  await context.repositories.categorias.salvar(livros);

  await context.repositories.produtos.salvar(
    new Produto({
      id: 1,
      nome: "Teclado mecanico",
      descricao: "Teclado mecanico ABNT2 com switches brown.",
      imagemUrl: "https://example.com/teclado.jpg",
      preco: 250,
      quantidadeEstoque: 10,
      categoria: eletronicos
    })
  );
  await context.repositories.produtos.salvar(
    new Produto({
      id: 2,
      nome: "Mouse sem fio",
      descricao: "Mouse ergonomico com bateria recarregavel.",
      imagemUrl: "https://example.com/mouse.jpg",
      preco: 120,
      quantidadeEstoque: 15,
      categoria: eletronicos
    })
  );
  await context.repositories.produtos.salvar(
    new Produto({
      id: 3,
      nome: "Clean Code",
      descricao: "Livro sobre boas praticas de desenvolvimento.",
      imagemUrl: "https://example.com/clean-code.jpg",
      preco: 180,
      quantidadeEstoque: 6,
      categoria: livros
    })
  );

  await context.repositories.usuarios.salvar(
    new Usuario({
      id: 1,
      nome: "Administrador",
      email: seedCredentials.admin.email,
      senhaHash: context.passwordHasher.hash(seedCredentials.admin.senha),
      papel: PapelUsuario.ADMIN
    })
  );
  await context.repositories.usuarios.salvar(
    new Usuario({
      id: 2,
      nome: "Cliente Seed",
      email: seedCredentials.cliente.email,
      senhaHash: context.passwordHasher.hash(seedCredentials.cliente.senha),
      papel: PapelUsuario.CLIENTE
    })
  );
}
