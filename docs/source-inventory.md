# Source Inventory — System Design Specialist Lab

> **FASE 1 — Descoberta e inventário das fontes.**
> Este documento é a base de evidências do projeto. Tudo que o Lab afirma como
> fato precisa rastrear de volta a uma das fontes catalogadas aqui. Nenhuma
> afirmação é "invenção": ou aponta para uma página do workbook, um arquivo de
> repositório, ou um padrão de referência conceitual.

Gerado a partir da análise das fontes reais (não de memória):
- texto integral do PDF extraído para `docs/_sources/workbook-fulltext.txt` (682
  páginas, 226 entradas de sumário em `docs/_sources/toc.txt`);
- READMEs e estrutura dos 3 repositórios lidos via GitHub;
- catálogo de padrões de `microservices.io/patterns/index.html`.

---

## 1. Documentos e repositórios analisados

| # | Fonte | Tipo | Autor | Como foi lida | Identificador de citação |
|---|-------|------|-------|---------------|--------------------------|
| S1 | **System Design Workbook** | Livro (PDF, 682 p.) | Matheus Scarpato Fidelis | Texto extraído integralmente (`pymupdf`) + sumário com nº de página | `PDF p.<n>` |
| S2 | **msc-shard-router** | Repositório (Go 1.25) | msfidelis | README + árvore de arquivos via GitHub | `shard-router:<arquivo>` |
| S3 | **msc-transactions-api** | Repositório (Go/Fiber) | msfidelis | README + árvore de arquivos via GitHub | `transactions-api:<arquivo>` |
| S4 | **event-source-distributed-ledger** | Repositório (Go) | msfidelis | README + árvore de arquivos via GitHub | `ledger:<arquivo>` |
| S5 | **microservices.io / patterns** | Catálogo conceitual | Chris Richardson | Índice de padrões lido | `microservices.io:<padrão>` |

> **Observação de proveniência:** o autor do workbook (Matheus Scarpato Fidelis,
> `msfidelis`) é o mesmo autor dos 3 repositórios. O livro é a **teoria**; os
> repositórios são as **implementações de referência** dos mesmos conceitos. Isso
> é o que torna o cruzamento "teoria → código" honesto e não fabricado.

### Metadados do PDF (S1)
- Título: `System Design Workbook` · Autor: `Matheus Scarpato Fidelis`
- ISBN (edição digital): `978-65-02-00869-0` (PDF p.11)
- DOI: `https://doi.org/10.5281/zenodo.19204003` (PDF p.12)
- Idioma: Português (Brasil). Palavras-chave: *System Design, Arquitetura de
  Software, Sistemas Distribuídos, Confiabilidade, Escalabilidade*.

---

## 2. Mapa Capítulo do Workbook → Tópico do Lab (S1)

Cada capítulo do livro vira um tópico navegável no Lab. Páginas conferidas no
sumário (`toc.txt`).

| Capítulo (PDF) | Página | Tópico do Lab (`id`) |
|----------------|:------:|----------------------|
| Teoria das Janelas Quebradas na Engenharia de Software | 19 | `broken-windows` |
| Protocolos e Comunicação de Rede (OSI) | 24 | `network-protocols` |
| Storage, RAID e Sistemas de Arquivos | 55 | `storage-raid` |
| Teorema CAP, ACID, BASE e Bancos Distribuídos | 72 | `cap-acid-base` |
| Teorema PACELC | 88 | `pacelc` |
| Databases, Modelos de Dados e Indexação | 98 | `databases-indexing` |
| Estratégias de Cache | 128 | `caching` |
| Microsserviços, Monolitos e Domínios | 147 | `microservices-monoliths` |
| Load Balancers e Proxies Reversos | 162 | `load-balancing` |
| API Gateways | 185 | `api-gateway` |
| Backend for Frontends (BFFs) | 201 | `bff` |
| Service Mesh Pattern | 210 | `service-mesh` |
| Paralelismo, Concorrência e Multithreading | 225 | `concurrency-parallelism` |
| Padrões de Comunicação Síncronos (REST/gRPC/GraphQL) | 263 | `sync-communication` |
| Mensageria, Eventos, Streaming (Kafka) | 294 | `messaging-streaming` |
| Performance, Capacidade e Escalabilidade (Scale Cube) | 343 | `performance-scalability` |
| Princípios de Sharding e Particionamento | 372 | `sharding-partitioning` |
| Replicação de Dados | 406 | `data-replication` |
| CQRS | 420 | `cqrs` |
| Saga Pattern | 449 | `saga` |
| Event Sourcing Pattern | 475 | `event-sourcing` |
| Patterns de Resiliência | 496 | `resilience-patterns` |
| Monitoramento e Observabilidade (USE/RED/4 Golden Signals) | 533 | `observability` |
| Bulkhead Pattern | 558 | `bulkhead` |
| Cell-Based Pattern | 576 | `cell-based` |
| Estratégias de Deployment | 591 | `deployment-strategies` |
| Capacity Planning e Teoria das Filas (Lei de Little) | 609 | `capacity-queueing` |
| Testes de Carga e Estresse | 639 | `load-stress-testing` |
| Single Point of Failure e Disaster Recovery | 667 | `spof-dr` |

---

## 3. Principais componentes encontrados (S2, S3, S4)

### S2 — msc-shard-router (proxy/router com hash consistente)
- **Função:** proxy que roteia requisições HTTP para shards via *consistent
  hashing*. Parte de uma pesquisa de mestrado sobre arquitetura celular.
- **Stack:** Go 1.25, Gorilla Mux, Prometheus, Docker Compose, Air (hot reload).
- **Componentes:** `pkg/hashring/` (anel de hash consistente, SHA-512 default,
  réplicas virtuais, busca binária O(log n)), `pkg/sharding/` (roteamento),
  `pkg/setup/` (descoberta dinâmica de shards via env `SHARD_(\d+)_URL`),
  `main.go` (servidor HTTP + circuit breaker).
- **Endpoints:** `/*` (proxy), `/healthz`, `/metrics` (Prometheus).
- **Resiliência:** circuit breaker (`CB_FAILURE_THRESHOLD=5`,
  `CB_OPEN_TIMEOUT_SEC=30`, `CB_HALF_OPEN_SUCCESS_THRESHOLD=2`); bulkheads por
  isolamento de shard.
- **Métricas:** `shard_router_requests_total`, `shard_router_responses_total`.

### S3 — msc-transactions-api (API transacional financeira)
- **Função:** API de transações financeiras (débito/crédito) com controle
  transacional forte de **saldo** e **limite** do cliente.
- **Stack:** Go + Fiber, PostgreSQL 16, Redis 7.2.4, ORM Bun, Docker Compose,
  Prometheus.
- **Estrutura:** `dto/`, `entities/`, `listeners/`, `migrations/`, `pkg/`,
  `routes/`, `routines/`, `services/` (lógica de negócio), `main.go`.
- **Características:** consistência forte na transação; Redis como cache; modo
  `ENV=shadow` para cenários de rollback; migrações automáticas.

### S4 — event-source-distributed-ledger (ledger event-sourced + CQRS)
- **Função:** ledger financeiro distribuído com **Event Sourcing** e **CQRS**;
  cria contas e processa movimentações com consistência eventual entre stores.
- **Stack:** Go, PostgreSQL (Event Store), ScyllaDB (read model de saldo),
  MongoDB (read model de extrato), Apache Kafka, Envoy (rate limit), Kong (gw).
- **Serviços:** `ledger/` (núcleo event sourcing), `balance-api/` + `balance/`
  (saldo/Scylla), `statement-api/` + `statement/` (extrato/Mongo), `simulador/`,
  `database/`, `envoy/`, `kong/`.
- **Event Store (Postgres):** tabela `events` append-only com
  `UNIQUE(aggregate_id, version)` garantindo ordem; `accounts` e `transactions`
  como read models atualizados na mesma transação SQL.
- **Tópicos Kafka — entrada (comandos):** `conta_criada`, `conta_movimentacao`.
- **Tópicos Kafka — saída (confirmações):** `ledger_nova_conta_registrada`,
  `ledger_nova_transacao_confirmada` (→ Mongo), `ledger_saldo_atualizado` (→ Scylla).
- **Garantias:** atomicidade (evento + read models numa transação Postgres,
  publish **pós-commit**); idempotência (`movimentacao_id` único nos read models);
  ordenação (versão por agregado + LWT no Scylla, `UPDATE ... IF version < ?`).

---

## 4. Principais fluxos de negócio identificados

| Fluxo (`id`) | Fonte | Resumo |
|--------------|-------|--------|
| `shard-router-request` | S2 | Cliente → header de sharding (`id_client`) → hash → shard determinístico → proxy + circuit breaker + métricas. |
| `transactional-debit-credit` | S3 | Requisição de movimentação → transação SQL forte → valida saldo/limite → commit/rollback; Redis no caminho de leitura. |
| `event-sourced-write` | S4 | Comando via Kafka → ledger abre transação → persiste evento (optimistic locking por versão) → recalcula saldo → atualiza read models → commit → publica confirmações. |
| `cqrs-read-model-update` | S4 | Confirmações Kafka → ingestão Balance (Scylla, LWT) e Statement (Mongo, dedup por erro 11000) atualizam read models de forma idempotente. |
| `account-creation` | S4 | `conta_criada` → ledger registra evento de criação → publica `ledger_nova_conta_registrada`. |
| `bff-knowledge-query` | Lab | Frontend → BFF (Java/Spring) → carrega knowledge-base local → devolve tópico/padrão/fluxo/diagrama/Q&A (sem LLM em runtime). |

---

## 5. Principais padrões arquiteturais identificados

Cruzamento dos padrões do **microservices.io (S5)** com onde aparecem nas fontes:

| Padrão (S5) | Onde aparece nas fontes |
|-------------|--------------------------|
| Database per Service | S4 (Event Store/Scylla/Mongo separados por responsabilidade) |
| Saga | S1 cap. Saga (PDF p.449); compensação e dual-write |
| API Composition | S1 BFF (PDF p.203, "API Composition Pattern nos BFFs") |
| CQRS | S1 cap. CQRS (PDF p.420) + S4 (command/query split) |
| Domain Event | S1 Mensageria/Eventos (PDF p.296) + S4 (eventos de domínio) |
| Event Sourcing | S1 cap. Event Sourcing (PDF p.475) + S4 (Event Store) |
| Transactional Outbox | S1 Saga "Dual Write" (PDF p.467); S4 evita dual-write publicando pós-commit |
| Polling Publisher | S5 (referência) + S3 `routines/` (processos de fundo) |
| Transaction Log Tailing | S5 (referência conceitual; CDC) |
| Idempotent Consumer | S1 Event Sourcing "Idempotência" (PDF p.494) + S4 (`movimentacao_id`) |
| API Gateway | S1 cap. API Gateways (PDF p.185) + S4 (Kong) |
| Backend for Frontend | S1 cap. BFF (PDF p.201) + este Lab (bff/) |
| Circuit Breaker | S1 Resiliência (PDF p.501) + S2 (`CB_*`) |
| Health Check API | S2 (`/healthz`) + S1 Observabilidade (PDF p.533) |
| Application Metrics | S2/S3 (Prometheus) + S1 USE/RED/4 Golden Signals (PDF p.551) |
| Distributed Tracing | S1 Três Pilares da Observabilidade (PDF p.538) |
| Audit Logging | S4 (Event Store append-only = trilha de auditoria natural) |
| Consistent Hashing | S1 Sharding (PDF p.377, Sharding Keys/Hot Partitions) + S2 (`pkg/hashring`) |
| Bulkhead | S1 cap. Bulkhead (PDF p.558) + S2 (isolamento de shard) |
| Cell-Based Architecture | S1 cap. Cell-Based (PDF p.576) + S2 (tese de arquitetura celular) |

---

## 6. Partes que não ficaram claras / a confirmar

Registradas também em `docs/open-questions.md`.

- **OQ-1:** o detalhe fino de cada arquivo Go dos repositórios não foi lido linha
  a linha — as afirmações sobre código se baseiam no README e na árvore de
  arquivos. Citações `repo:<arquivo>` indicam o arquivo provável, não a linha.
- **OQ-2:** páginas exatas de subtópicos finos do PDF (ex.: fórmula da Lei de
  Little) são citadas pela seção do sumário; a verificação fina é feita lendo o
  trecho em `workbook-fulltext.txt`.
- **OQ-3:** `Polling Publisher` e `Transaction Log Tailing` não têm capítulo
  dedicado no workbook — são tratados como **referência conceitual** (S5) e
  relacionados ao Outbox / `routines/` do S3.

## 7. Riscos de interpretação

- **R-1:** confundir o modelo **transacional forte** (S3) com o modelo
  **event-sourced/eventual** (S4). São abordagens **diferentes** para o mesmo
  problema (movimentação financeira) — o Lab as compara explicitamente, não as
  funde.
- **R-2:** tratar microservices.io como verdade absoluta. É **referência
  conceitual**; a fonte primária de fatos é o workbook + os repositórios.
- **R-3:** assumir que "tem read model em NoSQL" implica CQRS canônico em todo
  lugar — o Lab distingue CQRS com mesmo banco vs. stores separados (S1 p.433-439).

---

## 8. Matriz Afirmação / Evidência / Fonte (núcleo)

| # | Afirmação | Evidência | Fonte |
|---|-----------|-----------|-------|
| A1 | Hash consistente reduz remapeamento ao adicionar/remover shard | "Stable under shard addition/removal", anel com réplicas virtuais e busca binária | `shard-router:pkg/hashring` (S2) |
| A2 | O ledger publica no Kafka só **depois** do commit no Postgres | "Kafka publishing happens post-commit" | `ledger:README` (S4) |
| A3 | Idempotência no consumidor usa um id único da movimentação | `movimentacao_id` único nos read models; Mongo ignora erro 11000 | `ledger:statement/consumer.go` (S4) |
| A4 | Ordenação por agregado é garantida por versão + LWT | `UNIQUE(aggregate_id, version)` + `UPDATE ... IF version < ?` (Scylla LWT) | `ledger:database/migrations`, `ledger:balance` (S4) |
| A5 | Saga existe para evitar transações distribuídas longas com lock | Capítulo Saga: "problema de transações longas", ação/compensação | `PDF p.454-465` (S1) |
| A6 | CQRS separa o modelo de escrita do de leitura | Capítulo CQRS: "Separação de Responsabilidades" | `PDF p.420-421` (S1) |
| A7 | Event Sourcing persiste eventos, não estado; estado é reconstituído | "Persistência Tradicional e Event Sourcing", "Rehydration", "Snapshotting" | `PDF p.476-490` (S1) |
| A8 | BFF aplica API Composition e segrega canais | Seções "API Composition Pattern nos BFFs", "Segregação de Canais" | `PDF p.203-204` (S1) |
| A9 | Circuit Breaker tem estados closed/open/half-open com thresholds | `CB_FAILURE_THRESHOLD`, `CB_OPEN_TIMEOUT_SEC`, `CB_HALF_OPEN_SUCCESS_THRESHOLD` | `shard-router:main.go` (S2) |
| A10 | Sharding key mal escolhida gera hot partitions | Seção "Sharding Keys e Hot Partitions" | `PDF p.377` (S1) |
| A11 | Transação financeira forte valida saldo e limite antes de efetivar | API transacional com "balance/limit enforcement", rollback | `transactions-api:services` (S3) |
| A12 | Observabilidade tem 3 pilares e frameworks USE/RED/4 Golden Signals | Seções "Três Pilares", "USE Method", "RED Method", "Four Golden Signals" | `PDF p.538-555` (S1) |
| A13 | Bulkhead isola falhas como anteparas de navio | "Bulkheads e a Engenharia Naval", "Contenção de Falhas" | `PDF p.558-561` (S1) |
| A14 | Cell-based isola estado em células com roteamento próprio | "Isolamento de estado", "Estratégias de roteamento para células" | `PDF p.578-579` (S1) |

> Esta matriz é o núcleo. A versão completa e por-item vive em
> `knowledge-base/evidence.json` e é servida pelo endpoint `GET /api/evidence`.
