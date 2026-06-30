# E-commerce Sistema

Sistema web de e-commerce em TypeScript, com dominio separado da camada HTTP.

## Stack

- Node.js 22+
- TypeScript
- Fastify para API HTTP
- React + Vite para frontend web
- Vitest para testes automatizados

Nesta etapa a aplicacao possui dominio, services de aplicacao, repositories em memoria, seeds, autenticacao simples por token, API HTTP e frontend web funcional. Ainda nao ha banco real.

## Como instalar

```bash
npm install
```

## Como validar

```bash
npm run build
npm test
```

O build valida TypeScript da API e do frontend e gera os arquivos estaticos do frontend em `dist/frontend`.

## Como rodar localmente

Em um terminal, suba a API:

```bash
npm run dev:api
```

Ou sem watch:

```bash
npm start
```

Por padrao a API sobe em `http://localhost:3000`. Use `PORT=3001 npm start` para trocar a porta.

Em outro terminal, suba o frontend:

```bash
npm run dev:frontend
```

Por padrao o frontend Vite sobe em `http://localhost:5173` e encaminha chamadas `/api` para `http://localhost:3000`.

Para apontar o proxy do Vite para outra porta da API:

```bash
VITE_PROXY_TARGET=http://localhost:3001 npm run dev:frontend
```

## Credenciais seed

- Admin: `admin@ecommerce.local` / `admin123`
- Cliente: `cliente@ecommerce.local` / `cliente123`

Na tela de login ha botoes para preencher as credenciais seed de cliente e admin.

## Autenticacao

Faca login e envie o token nas rotas protegidas:

```http
Authorization: Bearer <token>
```

## Rotas principais

### Saude

- `GET /health`

### Autenticacao

- `POST /auth/register` cria cliente com `{ "nome", "email", "senha" }`
- `POST /auth/login` retorna `{ token, usuario }`
- `POST /auth/logout` encerra a sessao atual
- `GET /auth/me` retorna usuario autenticado

### Catalogo

- `GET /catalogo/categorias`
- `GET /catalogo/produtos`
- `GET /catalogo/produtos?categoriaId=1`
- `GET /catalogo/produtos/:id`

### Carrinho

- `GET /carrinho`
- `POST /carrinho/itens` com `{ "produtoId": 1, "quantidade": 2 }`
- `PATCH /carrinho/itens/:produtoId` com `{ "quantidade": 3 }`
- `DELETE /carrinho/itens/:produtoId`
- `DELETE /carrinho`

### Checkout

- `POST /checkout`

Exemplo de payload:

```json
{
  "enderecoEntrega": {
    "cep": "01001000",
    "logradouro": "Praca da Se",
    "numero": "100",
    "cidade": "Sao Paulo",
    "estado": "SP"
  }
}
```

Para testes, tambem e aceito `resultadoPagamento` com `APROVADO` ou `RECUSADO`.

### Pedidos

- `GET /pedidos`
- `GET /pedidos/:id`
- `PATCH /pedidos/:id/cancelar`
- `PATCH /pedidos/:id/confirmar-recebimento`

### Administracao

Rotas restritas a usuario admin.

- `POST /admin/categorias`
- `PUT /admin/categorias/:id`
- `POST /admin/produtos`
- `PUT /admin/produtos/:id`
- `PATCH /admin/produtos/:id/ativar`
- `PATCH /admin/produtos/:id/desativar`
- `PATCH /admin/pedidos/:id/pagamento`
- `PATCH /admin/pedidos/:id/enviar`

## Estrutura

```text
src/
  application/
    services/      Orquestracao de casos de uso
    security/      Hash de senha e geracao de token
  domain/
    entities/      Entidades e objetos de valor do dominio
    enums/         Enumeracoes do dominio
    errors/        Erro base de regras de negocio
  infra/
    http/          App Fastify e servidor
    repositories/  Persistencia em memoria
    seeds/         Dados iniciais
  index.ts         Exportacoes publicas iniciais
tests/
  application/     Testes de services
  domain/          Testes unitarios das regras de dominio
  frontend/        Teste minimo de componentes React
  http/            Testes de fluxo HTTP
frontend/
  src/             Interface React/Vite
```

## Regras ja modeladas

- Produto valida preco e estoque, ativa/desativa, baixa e estorna estoque.
- Carrinho adiciona, altera, remove e soma itens, bloqueando quantidade acima do estoque.
- Pedido inicia aguardando pagamento e controla as transicoes de status permitidas.
- ItemPedido e um snapshot historico imutavel do produto no momento da compra.
- Usuario distingue cliente e administrador e valida permissao basica de visualizacao de pedido.

## Pendencias previstas

- Substituir repositories em memoria por banco real.
- Evoluir autenticacao/token para estrategia com expiracao e revogacao persistente.
- Servir o build estatico do frontend pela propria API em ambiente produtivo, se necessario.
- Ampliar testes de UI para fluxos completos de carrinho, checkout e administracao.
