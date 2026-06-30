import { AdministracaoService } from "./services/administracao-service.js";
import { AutenticacaoService } from "./services/autenticacao-service.js";
import { CarrinhoService } from "./services/carrinho-service.js";
import { CatalogoService } from "./services/catalogo-service.js";
import { CheckoutService } from "./services/checkout-service.js";
import { PedidoService } from "./services/pedido-service.js";
import { PasswordHasher, ScryptPasswordHasher } from "./security/password-hasher.js";
import { RandomTokenGenerator, TokenGenerator } from "./security/token-generator.js";
import { Repositories } from "./repositories.js";
import { criarRepositoriesEmMemoria } from "../infra/repositories/in-memory-repositories.js";

export type AppContext = {
  repositories: Repositories;
  passwordHasher: PasswordHasher;
  tokenGenerator: TokenGenerator;
  services: {
    autenticacao: AutenticacaoService;
    catalogo: CatalogoService;
    carrinho: CarrinhoService;
    checkout: CheckoutService;
    pedido: PedidoService;
    administracao: AdministracaoService;
  };
};

export function criarAppContext(repositories = criarRepositoriesEmMemoria()): AppContext {
  const passwordHasher = new ScryptPasswordHasher();
  const tokenGenerator = new RandomTokenGenerator();
  const carrinho = new CarrinhoService(repositories);

  return {
    repositories,
    passwordHasher,
    tokenGenerator,
    services: {
      autenticacao: new AutenticacaoService(repositories, passwordHasher, tokenGenerator),
      catalogo: new CatalogoService(repositories),
      carrinho,
      checkout: new CheckoutService(repositories, carrinho),
      pedido: new PedidoService(repositories),
      administracao: new AdministracaoService(repositories)
    }
  };
}
