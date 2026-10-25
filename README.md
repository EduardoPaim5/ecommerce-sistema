# E-commerce: implementações a partir de modelos e requisitos

Experimento acadêmico de geração e avaliação de software com assistência de IA. Este repositório reúne implementações distintas a partir de artefatos MDE; as pastas não são módulos de uma única aplicação.

| Variante | Implementação | Persistência e estado | Instruções |
|---|---|---|---|
| `codex` | TypeScript, Fastify, React e Vitest | Repositórios em memória; sem Prisma ou banco relacional nesta variante. Autenticação simplificada para o experimento. | [README](codex/README.md) · [Auditoria registrada](codex/AUDITORIA_FINAL.md) |
| `claude` | Java/Spring Boot e React | JPA/PostgreSQL, com configuração de teste documentada na variante | [README](claude/README.md) |
| `gemini` | Java/Spring Boot e React | H2 em desenvolvimento e configuração PostgreSQL/Docker | [README](gemini/README.md) |

## O que avaliar

O trabalho permite comparar atendimento aos requisitos, localização das regras de negócio, integração entre interface e API e limitações das implementações geradas. A auditoria da variante TypeScript registra lacunas e resultados da execução daquela revisão; não certifica as outras variantes nem um estado de produção.

Minha apresentação deste projeto distingue preparação dos artefatos, geração assistida e avaliação. O código gerado não é apresentado como implementação manual integral.

## Como executar

Escolha **uma variante** e siga o README da sua pasta. Não existe um comando único na raiz. Leia as credenciais e limitações locais antes de executar. Use somente dados fictícios.

## Modelagem

[Requisitos e diagramas do experimento](https://github.com/EduardoPaim5/ecommerce-diagramas).

Projeto acadêmico; não é uma loja comercial nem uma implementação pronta para produção. Para conhecer minha atuação em aplicações institucionais, consulte [meu perfil](https://github.com/EduardoPaim5).
