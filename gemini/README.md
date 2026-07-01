# E-commerce Completo (Gerado via MDE)

Esta aplicação foi gerada de forma automatizada com base nos diagramas de classes e serviços MDE (Model-Driven Engineering) e requisitos funcionais estabelecidos para a loja virtual.

## Tecnologias Utilizadas

- **Backend**: Java 17 + Spring Boot 3 + Spring Data JPA + Spring Security (JWT).
- **Frontend**: React 19 + TypeScript + Vite + Lucide Icons (Vanilla CSS com Design System Premium).
- **Banco de Dados**: H2 em memória (Desenvolvimento) / PostgreSQL (Produção via Docker).
- **Orquestração**: Docker & Docker Compose.

---

## Recursos Implementados (Alinhados aos Requisitos)

- **Autenticação (RF01 - RF05)**:
  - Registro de usuários com provisão de carrinho automático.
  - Validação de e-mail único.
  - Autenticação JWT com expiração de sessão de 1 dia.
  - Senhas armazenadas com hash seguro (BCrypt).
- **Catálogo de Produtos (RF06 - RF10, RN04)**:
  - Listagem apenas de produtos ativos.
  - Busca por nome (case-insensitive) e filtragem por categorias.
  - Alerta visual para produtos com estoque zerado ("Sem estoque").
- **Carrinho de Compras (RF11 - RF15, RN02)**:
  - Adicionar, alterar quantidades e remover itens.
  - Cálculo dinâmico do valor total.
  - Validação de estoque máximo permitido no carrinho.
- **Pedido e Checkout (RF16 - RF21, RN01, RN03, RN05)**:
  - Fechamento de pedido a partir do carrinho de compras informando endereço de entrega.
  - Congelamento dos preços dos produtos no momento da compra (`ItemPedido` snapshot).
  - Simulação de processamento de pagamento.
  - Baixa automática de estoque de produtos somente após confirmação do pagamento (`PAGO`).
  - Histórico detalhado de pedidos de cada cliente.
- **Área do Administrador (RF22 - RF25)**:
  - CRUD completo de categorias.
  - CRUD de produtos (criar, editar, desativar).
  - Visualização de todos os pedidos da plataforma.
  - Atualização do status dos pedidos de acordo com a máquina de estados.

---

## Máquina de Estados do Pedido (Seção 4)

O sistema gerencia as seguintes transições de estado no domínio `Pedido`:

```
AGUARDANDO_PAGAMENTO --(pagamento aprovado)--> PAGO
AGUARDANDO_PAGAMENTO --(pagamento recusado/cancelar)--> CANCELADO
PAGO --(separação/envio)--> ENVIADO
ENVIADO --(confirmação de recebimento)--> ENTREGUE
PAGO --(cancelar)--> CANCELADO
```

- **Estorno de Estoque**: Se um pedido pago (`PAGO`) for cancelado pelo administrador antes de ser enviado, os itens correspondentes são automaticamente estornados para o estoque do produto.

---

## Contas de Teste Pré-Configuradas

O banco de dados é inicializado automaticamente no startup (`InitialDataConfig`) com as seguintes credenciais:

| Papel | E-mail | Senha | Descrição |
|-------|--------|-------|-----------|
| **Administrador** | `admin@loja.com` | `admin123` | Acesso completo ao painel de administração |
| **Cliente** | `cliente@loja.com` | `cliente123` | Acesso de compras e catálogo de pedidos |

---

## Como Executar a Aplicação

### 1. Com Docker Compose (Recomendado - Produção)

Para iniciar os serviços completos (Banco PostgreSQL, API Spring Boot e Frontend Nginx):

```bash
# Na raiz da pasta 'app'
docker compose up --build
```

- **Frontend**: Acesse [http://localhost:8081](http://localhost:8081) no seu navegador.
- **Backend API**: Acessível em [http://localhost:8080/api](http://localhost:8080/api).

### 2. Modo Desenvolvimento Local (Sem Docker)

Se preferir rodar cada serviço individualmente:

#### Executar o Backend:
```bash
cd backend
mvn spring-boot:run
```
*Utiliza o perfil `dev` com banco de dados em memória H2. O console H2 estará disponível em [http://localhost:8080/api/h2-console](http://localhost:8080/api/h2-console) (JDBC URL: `jdbc:h2:mem:ecommercedb`, Usuário: `sa`, Senha: `password`).*

#### Executar o Frontend:
```bash
cd frontend
npm install
npm run dev
```
*O servidor de desenvolvimento do Vite iniciará em [http://localhost:8081](http://localhost:8081) e redirecionará automaticamente chamadas `/api` para `http://localhost:8080/api`.*
