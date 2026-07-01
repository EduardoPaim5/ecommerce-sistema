  Você deve gerar um sistema web completo de e-commerce básico com base nos requisitos e diagramas já preparados.

  Fontes de verdade:
  - Repositório de modelagem: https://github.com/EduardoPaim5/ecommerce-diagramas
  - Requisitos: `docs/requisitos/requisitos-ecommerce.pdf`
  - Descrição textual: `docs/texto/descricao-diagrama-ecommerce-ia.md`
  - Diagrama de domínio para IA: `diagrams/ia/diagrama-classes-ecommerce-ia.puml`
  - Diagrama de serviços para IA: `diagrams/ia/diagrama-servicos-ecommerce-ia.puml`

  Objetivo:
  Criar o sistema completo de e-commerce conforme os requisitos levantados.

  Escopo funcional obrigatório:
  - Cadastro de usuário com nome, email e senha.
  - Login e logout com sessão/token.
  - Senha armazenada como hash, nunca em texto puro.
  - Validação de email único.
  - Catálogo com listagem de produtos ativos.
  - Busca de produtos por nome.
  - Filtro por categoria.
  - Detalhe de produto.
  - Indicação de produto sem estoque.
  - Carrinho do cliente autenticado.
  - Adicionar produto ao carrinho informando quantidade.
  - Alterar quantidade de item no carrinho.
  - Remover item do carrinho.
  - Calcular e exibir total do carrinho.
  - Bloquear quantidade maior que estoque disponível.
  - Checkout a partir do carrinho.
  - Endereço de entrega no checkout.
  - Pagamento simulado com resultado aprovado/recusado.
  - Criação de pedido com status inicial `AGUARDANDO_PAGAMENTO`.
  - Baixa de estoque apenas após pagamento aprovado.
  - Cancelamento antes do envio deve estornar estoque.
  - Cliente pode listar e visualizar seus pedidos.
  - Administrador pode cadastrar, editar e desativar produtos.
  - Administrador pode gerenciar categorias.
  - Administrador pode visualizar todos os pedidos.
  - Administrador pode atualizar status do pedido conforme a máquina de estados.

  Regras de domínio:
  - Siga o modelo do diagrama de classes.
  - As entidades de domínio devem concentrar as regras principais.
  - Os services devem apenas orquestrar casos de uso.
  - `Pedido` controla suas transições de estado.
  - `Carrinho` controla itens, validação de quantidade, carrinho vazio e cálculo de total.
  - `Produto` controla validação e ajuste de estoque.
  - `ItemPedido` deve ser snapshot histórico imutável do produto no momento da compra.
  - Alterações futuras em `Produto` não devem alterar pedidos antigos.

  Máquina de estados de `Pedido`:
  - Estado inicial: `AGUARDANDO_PAGAMENTO`.
  - Estados finais: `ENTREGUE` e `CANCELADO`.
  - Transições permitidas:
    - `AGUARDANDO_PAGAMENTO -> PAGO`
    - `AGUARDANDO_PAGAMENTO -> CANCELADO`
    - `PAGO -> ENVIADO`
    - `PAGO -> CANCELADO`
    - `ENVIADO -> ENTREGUE`

  Fora de escopo:
  - Gateway de pagamento real.
  - Integração com transportadora.
  - Cálculo real de frete por CEP.
  - Avaliações, comentários e lista de desejos.
  - Cupons e promoções.
  - Marketplace com múltiplos vendedores.
  - Notificações por email/SMS.

  Stack:
  Escolha uma stack simples, moderna e fácil de rodar localmente. Priorize clareza e completude sobre sofisticação.

  Requisitos técnicos:
  - Criar estrutura completa do projeto.
  - Criar README com instruções de instalação, execução, testes e credenciais de acesso/seeds.
  - Criar dados iniciais para categorias, produtos, cliente e administrador.
  - Implementar validações das regras de negócio.
  - Implementar testes para as regras principais do domínio e fluxos críticos.
  - Rodar build/testes ao final.
  - Corrigir erros encontrados até o projeto ficar executável.

  Critérios de aceite:
  - O sistema deve rodar localmente seguindo apenas o README.
  - Deve ser possível cadastrar/login como cliente.
  - Deve ser possível navegar no catálogo, adicionar ao carrinho e finalizar compra.
  - Deve ser possível simular pagamento aprovado e recusado.
  - Deve ser possível consultar pedidos como cliente.
  - Deve ser possível gerenciar produtos, categorias e pedidos como administrador.
  - As regras de estoque, carrinho vazio, status de pedido e snapshot de item de pedido devem funcionar corretamente.

  Ao finalizar:
  - Informe a stack escolhida.
  - Informe os comandos para rodar.
  - Informe os comandos de teste.
  - Liste usuários/seeds criados.
  - Liste qualquer limitação ou pendência.
