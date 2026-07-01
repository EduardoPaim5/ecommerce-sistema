# Loja Virtual — Aplicação gerada a partir dos artefatos MDE

Aplicação completa de e-commerce gerada a partir dos artefatos de modelagem (MDE)
deste repositório:

- Diagrama de classes de domínio: `../diagrams/ia/diagrama-classes-ecommerce-ia.puml`
- Diagrama de serviços de aplicação: `../diagrams/ia/diagrama-servicos-ecommerce-ia.puml`
- Descrição textual: `../docs/texto/descricao-diagrama-ecommerce-ia.md`
- Requisitos (RF01–RF25, RN01–RN05, máquina de estados): `../docs/requisitos/requisitos-ecommerce.pdf`

## Arquitetura

| Camada | Tecnologia |
| --- | --- |
| Backend | Java 17 · Spring Boot 3 · Spring Data JPA · Spring Security (JWT) |
| Banco | PostgreSQL 16 (perfil `h2` em memória disponível para testes) |
| Frontend | React 18 · TypeScript · Vite · React Router |
| Orquestração | Docker Compose |

O backend segue a divisão de responsabilidades dos diagramas: as **regras de
negócio ficam nas entidades de domínio** (`Produto`, `Carrinho`, `Pedido`, ...)
e os **serviços de aplicação apenas orquestram** os casos de uso.

```
app/
├── backend/    # API REST Spring Boot
│   └── src/main/java/com/ecommerce/
│       ├── domain/        # entidades + enums + regras (diagrama de classes)
│       ├── repository/    # Spring Data JPA
│       ├── service/       # serviços de aplicação (diagrama de serviços)
│       ├── security/      # JWT + BCrypt + configuração
│       ├── web/           # controllers REST + DTOs + tratamento de erros
│       └── config/        # seed de dados
├── frontend/   # SPA React + Vite
└── docker-compose.yml
```

## Como executar

### Opção 1 — Docker Compose (recomendado)

Sobe banco, backend e frontend de uma vez:

```bash
cd app
docker compose up --build
```

- Frontend: http://localhost:8081
- API: http://localhost:8080/api
- PostgreSQL: localhost:5432 (`ecommerce` / `ecommerce`)

### Opção 2 — Execução local (desenvolvimento)

**Backend** (precisa de um PostgreSQL local ou use o perfil `h2` em memória):

```bash
cd app/backend
# Com PostgreSQL local em localhost:5432 (db/usuario/senha = ecommerce):
mvn spring-boot:run
# OU, sem instalar Postgres, usando banco H2 em memória:
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

**Frontend** (proxy para o backend em :8080 já configurado no Vite):

```bash
cd app/frontend
npm install
npm run dev
# abre em http://localhost:5173
```

## Credenciais de demonstração (seed automático)

| Papel | Email | Senha |
| --- | --- | --- |
| Administrador | `admin@loja.com` | `admin123` |
| Cliente | `cliente@loja.com` | `cliente123` |

O seed cria categorias e produtos de exemplo (inclusive um produto sem estoque,
para demonstrar RF10/RF15).

## Endpoints principais da API

| Método | Rota | Acesso | Requisito |
| --- | --- | --- | --- |
| POST | `/api/auth/cadastro` | público | RF01, RF02 |
| POST | `/api/auth/login` | público | RF03 |
| GET | `/api/catalogo/produtos?nome=&categoriaId=` | público | RF06–RF08 |
| GET | `/api/catalogo/produtos/{id}` | público | RF09, RF10 |
| GET | `/api/catalogo/categorias` | público | — |
| GET/POST/PUT/DELETE | `/api/carrinho/itens...` | cliente | RF11–RF15 |
| POST | `/api/checkout` | cliente | RF16–RF20 |
| GET | `/api/pedidos`, `/api/pedidos/{id}` | cliente | RF21, RN05 |
| GET/POST/PUT/DELETE | `/api/admin/produtos...` | admin | RF22 |
| GET/POST/PUT | `/api/admin/categorias...` | admin | RF23 |
| GET | `/api/admin/pedidos` | admin | RF24 |
| PATCH | `/api/admin/pedidos/{id}/status` | admin | RF25 |

A autenticação usa **JWT** no cabeçalho `Authorization: Bearer <token>`.

## Regras de negócio implementadas

- **RN01** — `ItemPedido.criarSnapshot(...)` congela nome e preço no momento da compra.
- **RN02** — checkout rejeita carrinho vazio.
- **RN03** — baixa de estoque só ocorre quando o pagamento simulado é aprovado.
- **RN04** — produto desativado some do catálogo, mas é preservado em pedidos antigos.
- **RN05** — apenas o próprio cliente (ou admin) acessa o detalhe de um pedido.
- **Máquina de estados** — `Pedido`/`StatusPedido` validam as transições
  `AGUARDANDO_PAGAMENTO → PAGO → ENVIADO → ENTREGUE` e os cancelamentos, com
  estorno de estoque ao cancelar pedido ainda não enviado.

## Testes

```bash
cd app/backend
mvn test          # usa o perfil h2 em memória
```
