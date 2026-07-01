# Auditoria final do sistema de e-commerce

Data da auditoria: 2026-06-30

## Fontes avaliadas

- Requisitos: `/tmp/ecommerce-diagramas/docs/requisitos/requisitos-ecommerce.pdf`
- Descricao textual da versao IA: `/tmp/ecommerce-diagramas/docs/texto/descricao-diagrama-ecommerce-ia.md`
- Diagrama de classes IA: `/tmp/ecommerce-diagramas/diagrams/ia/diagrama-classes-ecommerce-ia.puml`
- Diagrama de servicos IA: `/tmp/ecommerce-diagramas/diagrams/ia/diagrama-servicos-ecommerce-ia.puml`
- Codigo auditado: `/home/e5x401/ecommerce-sistema`

## Escopo da auditoria

A avaliacao considera dominio, services, API HTTP, frontend React e testes automatizados. Nao foram assumidos requisitos fora do PDF, da descricao textual e dos diagramas indicados.

## Resultado de build e testes

- `npm run build`: aprovado. O comando executou `tsc --noEmit && vite build` e gerou o build Vite em `dist/frontend`.
- `npm test`: aprovado. Resultado: 4 arquivos de teste aprovados, 21 testes aprovados.

## Requisitos funcionais implementados

- RF02 - Validar email unico no cadastro: implementado no `AutenticacaoService.registrar`, com normalizacao para minusculas e erro 409 quando ja existe usuario.
- RF03 - Login com email e senha retornando token: implementado na API `/auth/login`, no service de autenticacao e no frontend.
- RF05 - Armazenar senha com hash: implementado com `ScryptPasswordHasher`; seeds e cadastro usam hash, e a senha nao e exposta nos serializers.
- RF06 - Listar produtos ativos com nome, preco e descricao/imagem: implementado na API e no frontend para produtos ativos. A UI exibe nome, descricao, preco e categoria; a URL de imagem existe no modelo/API.
- RF08 - Filtrar produtos por categoria: implementado na API por `categoriaId` e tambem no frontend.
- RF12 - Alterar quantidade de item no carrinho: implementado na API/service/dominio e na UI do carrinho.
- RF13 - Remover item do carrinho: implementado na API/service/dominio e na UI.
- RF14 - Calcular e exibir total do carrinho: implementado por `Carrinho.calcularTotal`, serializer e UI.
- RF15 - Bloquear quantidade maior que estoque: implementado em `Carrinho`/`Produto` e coberto por testes.
- RF16 - Finalizar compra a partir do carrinho: implementado por `/checkout` e `CheckoutService.finalizarCompra`.
- RF17 - Informar endereco de entrega no checkout: implementado por `Endereco`, payload `/checkout` e formulario no frontend.
- RF19 - Dar baixa no estoque quando o pagamento e aprovado: implementado em `PedidoService.confirmarPagamento` para resultado `APROVADO`.
- RF20 - Gerar pedido com status inicial `AGUARDANDO_PAGAMENTO`: implementado em `Pedido`.
- RF22 - Administrador cadastrar, editar e desativar produtos: implementado na API, service e UI admin.
- RF23 - Administrador gerenciar categorias: implementado para criar e editar categorias na API, service e UI admin.
- RF24 - Administrador visualizar todos os pedidos: implementado por `PedidoService.listar`; quando o usuario e admin, `/pedidos` retorna todos.

## Requisitos funcionais parcialmente implementados

- RF01 - Cadastro de visitante: a API `/auth/register` existe, mas o frontend nao oferece tela/formulario de cadastro para visitante.
- RF04 - Logout: a API `/auth/logout` remove a sessao, mas o frontend apenas limpa o token local e nao chama o endpoint; a sessao do backend permanece valida ate ser perdida em memoria.
- RF07 - Buscar produtos por nome: implementado apenas como filtro local no componente `ProductCatalog`; nao ha metodo/endpoint correspondente em `CatalogoService` conforme o diagrama de servicos.
- RF09 - Exibir detalhe de produto: a API possui `/catalogo/produtos/:id` e a UI abre um dialog com detalhes, mas o frontend nao usa o endpoint de detalhe nem possui pagina dedicada.
- RF10 - Indicar produto sem estoque: a UI desabilita o botao de adicionar quando estoque e zero e mostra estoque no detalhe, mas nao ha indicacao textual explicita no card/listagem.
- RF11 - Adicionar produto ao carrinho informando quantidade: implementado na API/service/dominio; no frontend, o catalogo adiciona quantidade fixa 1 e a quantidade so pode ser ajustada depois, no carrinho.
- RF18 - Simular pagamento sem integracao real: ha aprovacao/recusa manual via rota administrativa `/admin/pedidos/:id/pagamento`, mas o `CheckoutService` nao possui `simularPagamento` e o checkout nao simula automaticamente o resultado como descrito no diagrama de servicos.
- RF21 - Cliente listar e visualizar detalhe dos seus pedidos: a API possui listagem e detalhe protegido, mas o frontend mostra apenas uma listagem com itens e nao oferece uma tela/acao de detalhe completa.
- RF25 - Administrador atualizar status conforme maquina de estados: ha rotas para aprovar/recusar pagamento e enviar pedido; cancelamento e confirmacao de recebimento existem fora do namespace admin. Nao ha um caso de uso administrativo generico `atualizarStatus(admin, pedidoId, novoStatus)` como no diagrama.

## Requisitos funcionais nao implementados

- Nenhum RF do PDF esta completamente ausente em todas as camadas. As lacunas relevantes sao parciais, principalmente por diferencas entre API, frontend e diagrama de servicos.

## Regras de negocio implementadas

- RN01 - Preco do item no pedido congelado no momento da compra: implementado por `ItemPedido.criarSnapshot`, copiando `produtoId`, `nomeProduto`, `quantidade`, `precoUnitario` e `subtotal`.
- RN02 - Nao finalizar pedido com carrinho vazio: implementado em `CheckoutService.finalizarCompra`.
- RN03 - Baixa de estoque apenas apos pagamento aprovado: implementado porque o checkout nao baixa estoque e `PedidoService.confirmarPagamento(APROVADO)` baixa.
- RN04 - Produto desativado nao aparece no catalogo e permanece em pedidos antigos: catalogo filtra produtos ativos, e pedidos usam snapshot historico.
- RN05 - Apenas o proprio cliente ou admin visualiza detalhe de pedido: implementado por `Usuario.podeVisualizarPedido` e `PedidoService.obter`.
- Produto com preco negativo e estoque negativo e rejeitado no dominio.
- Quantidades de carrinho e estoque exigem inteiros positivos.
- Pedido inicia em `AGUARDANDO_PAGAMENTO` e bloqueia transicoes invalidas no dominio.
- Pagamento recusado muda pedido para `CANCELADO`.
- Cancelamento de pedido `PAGO` estorna estoque.

## Regras de negocio parcialmente implementadas

- "CheckoutService deve simular pagamento": a regra aparece na descricao textual/diagrama, mas o service apenas cria pedido aguardando pagamento. A simulacao foi deslocada para `PedidoService.confirmarPagamento`.
- "Ao cancelar um pedido ainda nao enviado, o estoque deve ser estornado": implementado para pedidos `PAGO`; para `AGUARDANDO_PAGAMENTO` nao ha estorno porque ainda nao houve baixa. Isso e coerente com a implementacao atual, mas depende da decisao de baixar estoque somente apos aprovacao.
- "Produto com estoque zero deve ser indicado como indisponivel": a indisponibilidade e inferida por botao desabilitado/estoque no detalhe, mas nao e explicitamente comunicada em todas as telas.
- "Services apenas orquestram e regras ficam nas entidades": em geral esta atendido, mas baixa/estorno atomico de estoque e permissoes administrativas relevantes ficam concentradas nos services.

## Regras de negocio nao implementadas

- Nao ha expiracao de sessao/token (`Sessao.expiraEm`) como previsto no diagrama de servicos. O PDF exige token/sessao, mas nao exige expiracao; portanto esta lacuna e uma divergencia com o diagrama, nao um RF obrigatorio do PDF.

## Divergencias entre codigo, requisitos e diagramas

- `CatalogoService` no diagrama possui `buscarProdutosPorNome`; o codigo nao possui esse metodo nem endpoint equivalente.
- `CheckoutService` no diagrama possui `simularPagamento(pedido)`; o codigo nao implementa esse metodo e nao simula pagamento no checkout.
- `PedidoService` no diagrama possui `listarPedidosDoCliente`, `listarTodosPedidos` e `atualizarStatus`; o codigo usa metodos diferentes (`listar`, `confirmarPagamento`, `enviar`, `cancelar`, `confirmarRecebimento`) e espalha as transicoes em endpoints especificos.
- `Sessao` no diagrama tem `expiraEm`; o repositorio de sessoes armazena somente `token -> usuarioId`.
- `Usuario.verificarSenha(senha: String)` no diagrama sugere verificacao por senha; no codigo o metodo compara hash diretamente e a verificacao real fica no `PasswordHasher` usado pelo service.
- O README informa que `/checkout` aceita `resultadoPagamento`, mas a rota atual le apenas `enderecoEntrega`; isso diverge do comportamento real.
- O frontend nao expõe todos os casos de uso que existem na API: cadastro, logout real, detalhe completo de pedido, confirmacao de recebimento e cancelamento de pedido.

## Bugs ou riscos encontrados

- O risco critico de baixa duplicada de estoque em aprovacao repetida foi corrigido: `PedidoService.confirmarPagamento` valida a transicao antes de baixar estoque, e ha testes para dupla aprovacao, recusa de pedido pago e aprovacao de pedido cancelado.
- A operacao de confirmar pagamento nao e transacional. Se houver falha depois de salvar parte dos produtos ou entre baixa de estoque e salvamento do pedido, memoria e pedido podem divergir.
- Checkout cria pedido mesmo sem reservar estoque. Dois usuarios podem finalizar pedidos concorrentes para o mesmo estoque; a falha so aparece na aprovacao posterior.
- `GET /pedidos` retorna todos os pedidos para admin e pedidos proprios para cliente. Funciona, mas mistura dois casos de uso que o diagrama separa; isso pode dificultar autorizacao e testes futuros.
- A cobertura de testes e boa para dominio basico, fluxo feliz e repeticao invalida de pagamento, mas ainda nao cobre cadastro HTTP, logout HTTP, busca por nome via API, permissao negativa de detalhe de pedido por outro cliente, ou fluxo UI completo de checkout/admin.

## Melhorias recomendadas essenciais

- Decidir e alinhar o fluxo de pagamento: ou implementar `CheckoutService.simularPagamento` conforme diagrama, ou atualizar os diagramas/requisitos derivados para deixar claro que a aprovacao e administrativa posterior.
- Implementar busca por nome no backend (`CatalogoService` e rota HTTP), mantendo o filtro local apenas como conveniencia de UI.
- Adicionar tela de cadastro de visitante e fazer o botao de logout chamar `/auth/logout`.
- Completar a UI de pedidos com detalhe de pedido e acoes previstas para cancelamento/confirmacao de recebimento quando aplicaveis.
- Ampliar testes para cenarios de seguranca e consistencia: dupla aprovacao de pagamento, acesso negado a pedido de outro cliente, logout, cadastro duplicado via HTTP e busca por nome.

## Melhorias recomendadas opcionais

- Adicionar expiracao de sessao/token para aderir ao `Sessao.expiraEm` do diagrama.
- Separar endpoints administrativos de pedidos (`/admin/pedidos`) dos endpoints do cliente, mesmo que internamente usem o mesmo service.
- Exibir imagem real do produto quando `imagemUrl` estiver disponivel, em vez de apenas iniciais no card.
- Adicionar persistencia real em banco de dados. Isso nao e exigido pelo PDF, mas reduziria perda de dados em memoria.
- Adicionar estados visuais mais claros para produto sem estoque.

## Parecer final

O sistema esta compilavel, testavel e cobre a maior parte do dominio essencial: autenticacao, catalogo, carrinho, pedido, snapshots, administracao basica e maquina de estados principal. Ainda nao esta plenamente aderente aos requisitos/diagramas para comparacao final sem ressalvas, principalmente por lacunas no fluxo de pagamento, busca por nome no backend, cadastro/logout no frontend e pelo risco critico de baixa duplicada de estoque em aprovacao repetida.
