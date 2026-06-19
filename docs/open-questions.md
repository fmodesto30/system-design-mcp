# Open Questions

Dúvidas e hipóteses assumidas, registradas em vez de escondidas (regra do projeto:
na dúvida, registrar e seguir com a melhor hipótese explícita).

| # | Questão | Hipótese assumida | Impacto se errada |
|---|---------|-------------------|-------------------|
| OQ-1 | O código Go dos repos foi lido via README + árvore de arquivos, não linha a linha. | Citações `repo:<arquivo>` apontam o arquivo provável do conceito (ex.: `pkg/hashring/` p/ hashing consistente). | Baixo — o conceito está correto; o caminho exato do arquivo pode variar. |
| OQ-2 | Páginas exatas de subtópicos finos do PDF. | Citei a página do início da seção (do sumário) e confirmei o trecho no texto extraído. | Baixo — a página pode estar ±1 do parágrafo exato. |
| OQ-3 | `Polling Publisher` e `Transaction Log Tailing` não têm capítulo próprio no workbook. | Tratados como **referência conceitual** (microservices.io) e relacionados ao Outbox / `routines/` do `msc-transactions-api`. | Médio — são padrões reais, só não detalhados pela fonte primária. |
| OQ-4 | Versão do Spring Boot. | 3.4.x (estável, baseline Java 21) — o material não exige versão. | Baixo. |
| OQ-5 | Idioma do conteúdo. | PT-BR (fonte e público são PT-BR; código/identificadores em inglês). | Baixo. |
| OQ-6 | Mapeamento exato dos read models do ledger. | ScyllaDB = saldo (LWT por versão), MongoDB = extrato (dedup por erro 11000), conforme README do repo. | Baixo — confirmado no README. |

Nenhuma destas bloqueia o uso do Lab; todas têm a fonte rastreável em
`docs/source-inventory.md` para auditoria.
