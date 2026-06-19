# System Design Specialist Lab

Base de conhecimento **interativa** de System Design — um produto de estudo/consulta
que funciona como um especialista em arquitetura distribuída, sistemas financeiros,
event-driven, sharding, CQRS, Event Sourcing, consistência distribuída, observabilidade,
resiliência e BFF/API Gateway.

Não é um chatbot e **não usa LLM em runtime**: todo o conteúdo é uma base de
conhecimento versionada (JSON), servida por um BFF em Java/Spring e navegada por um
frontend React. **Cada afirmação aponta para a sua fonte** — nada é inventado.

[![CI](https://github.com/fmodesto30/system-design-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/fmodesto30/system-design-mcp/actions/workflows/ci.yml)
![tópicos](https://img.shields.io/badge/tópicos-29-5b9dff) ![padrões](https://img.shields.io/badge/padrões-20-5b9dff) ![perguntas](https://img.shields.io/badge/perguntas%20de%20entrevista-31-5b9dff) ![diagramas](https://img.shields.io/badge/diagramas%20mermaid-12-7ee0c0)

---

## Objetivo

Estudar e demonstrar System Design no nível de entrevista de arquiteto/staff, com:
- um **mapa de conhecimento** dos temas centrais (CAP/PACELC, sharding, CQRS, Event
  Sourcing, Saga, resiliência, observabilidade, capacity planning…);
- um **catálogo de padrões** (microservices.io + extras do livro) mapeado para **onde
  cada padrão aparece em três implementações reais**;
- **fluxos arquiteturais** passo a passo;
- **30 perguntas de entrevista** com resposta curta, detalhada, desenho mental, riscos,
  trade-offs e como responder;
- **diagramas Mermaid**;
- uma **matriz de evidências** “afirmação → evidência → fonte”.

## Fontes (e por que confiar)

| Fonte | O que é | Papel |
|-------|---------|-------|
| **System Design Workbook** (Matheus Scarpato Fidelis, 682 p.) | Livro de System Design (PT-BR) | Teoria — citada por página (`p.X`) |
| [`msc-shard-router`](https://github.com/msfidelis/msc-shard-router) | Proxy/router Go com hashing consistente, bulkheads, circuit breaker | Impl. de referência (sharding/cell-based) |
| [`msc-transactions-api`](https://github.com/msfidelis/msc-transactions-api) | API transacional Go/Fiber, Postgres+Redis | Impl. de referência (consistência forte) |
| [`event-source-distributed-ledger`](https://github.com/msfidelis/event-source-distributed-ledger) | Ledger Go com Event Sourcing + CQRS, Kafka, Scylla, Mongo | Impl. de referência (event-driven) |
| [microservices.io](https://microservices.io/patterns/index.html) | Catálogo de padrões | Referência conceitual (escrito com nossas palavras) |

O autor do livro é o mesmo dos três repositórios — o livro é a teoria, os repos são a
prática dos mesmos conceitos. O inventário completo está em
[`docs/source-inventory.md`](docs/source-inventory.md).

## Arquitetura (resumo)

```
frontend (React + Vite, :5173)
      │  fetch /api/*  (proxy em dev)
      ▼
bff (Java 21 + Spring Boot, hexagonal, :8080)
      │  porta de saída KnowledgeBasePort
      ▼
knowledge-base/*.json  (fonte de verdade, versionada)
```

Detalhes em [`docs/architecture.md`](docs/architecture.md) e nos
[ADRs](docs/adr/). O BFF é **hexagonal**: domínio puro (records, sem anotações de
framework) → portas → adapters (web de entrada, JSON de saída).

## Como rodar

Pré-requisitos: **JDK 21** e **Node 20+**. (Maven não é necessário — o BFF traz o
wrapper `./mvnw`.)

### 1. BFF
```bash
cd bff
./mvnw spring-boot:run          # sobe em http://localhost:8080
```
> Em máquinas onde o antivírus bloqueia AF_UNIX/loopback para `java.exe`
> (`Selector.open() EINVAL`), exporte antes:
> `export JAVA_TOOL_OPTIONS="-Djdk.net.unixdomain.tmpdir=Z:\\nope"` (força TCP).
> Ver [`docs/runbook.md`](docs/runbook.md).

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                     # sobe em http://localhost:5173 (proxy /api -> :8080)
```

### 3. Tudo junto com Docker (caminho mais à prova de bala)
```bash
docker compose up --build       # abra http://localhost:5173 ; API direta em :18080
```
> No Docker o BFF não precisa do workaround AF_UNIX (é Linux). A UI fica em `:5173`
> (o nginx faz proxy de `/api` para o bff internamente); a API também é exposta em
> `:18080` para `curl`. (Host 8080 costuma estar ocupado nesta máquina por outra stack.)

### Atalhos
```bash
scripts/test.sh                 # roda os testes do BFF + type-check do frontend
scripts/build.sh                # empacota o jar do BFF + build do frontend
```

## Endpoints da API

| Método/rota | Retorna |
|-------------|---------|
| `GET /api/topics` · `GET /api/topics/{id}` | tópicos (resumo / completo) |
| `GET /api/patterns` · `GET /api/patterns/{id}` | padrões |
| `GET /api/flows` · `GET /api/flows/{id}` | fluxos arquiteturais |
| `GET /api/interview/questions` · `…/{id}` | perguntas de entrevista |
| `GET /api/diagrams` · `GET /api/diagrams/{id}` | diagramas Mermaid |
| `GET /api/evidence` | matriz de evidências |
| `GET /api/ai-glossary` | glossário IA &amp; Agentes (trilha separada) |
| `GET /api/meta/stats` | contagens |
| `GET /actuator/health` · `/actuator/prometheus` | health + métricas Micrometer |

Exemplo:
```bash
curl localhost:8080/api/meta/stats
# {"topics":29,"patterns":20,"flows":7,"interviewQuestions":30,"diagrams":12,"evidence":24}
curl localhost:8080/api/patterns/event-sourcing | jq '.sourceRefs'
```

## Telas

Início (mapa de tópicos) · Tópicos · Padrões · Fluxos · Diagramas ·
**Modo Entrevista** (Q&A expansível) · **Comparar** (transacional×event sourcing,
API Gateway×BFF, forte×eventual) · **Evidências e fontes** · **IA & Agentes**
(glossário pra dev backend — trilha separada, sourced a refs de IA).

## MCP server (`system-design-mcp`)

A base também é exposta como **MCP server stdio** (Node) — pra outro Claude/agente consultar como
**tools nativas**, com as fontes junto. Lê os mesmos `knowledge-base/*.json` (sem LLM/rede em runtime).

```bash
cd mcp && npm install && npm run build && npm run smoke   # build + prova
```
Tools: `overview` · `search {query,kinds?,limit?}` · `list {kind}` · `get {kind,id}`. Registro e
exemplos em [`docs/FOR-AGENTS.md`](docs/FOR-AGENTS.md); o repo já traz um `.mcp.json`. Um MCP stdio
**não é daemon**: o harness spawna `node mcp/dist/server.js` sob demanda; "rodar" = registrar.

## Estrutura

```
system-design-specialist-lab/
  bff/                 # Java 21 + Spring Boot, hexagonal (mvnw incluso)
  frontend/            # React + Vite + TypeScript
  mcp/                 # MCP server stdio (Node) — expõe a base como tools
  knowledge-base/      # JSON versionado (fonte de verdade) + schema/
  docs/                # inventário, mapa de conhecimento, ADRs, runbook, guia, trade-offs, glossário, FOR-AGENTS
  scripts/             # build / test / run
  .mcp.json  docker-compose.yml
```

## Limitações

- O conteúdo do código dos repos foi lido via README/estrutura, não linha a linha —
  citações `repo:<arquivo>` indicam o arquivo provável (ver `docs/open-questions.md`).
- Não há banco de dados: a base é JSON em memória (read-only). Isso é uma decisão
  consciente (ADR-0003), não uma pendência.
- `Polling Publisher` e `Transaction Log Tailing` são tratados como referência
  conceitual (sem capítulo dedicado no livro).

## Próximos passos

Busca full-text · export do guia em PDF · um modo “quiz” cronometrado · diagramas
adicionais por fluxo · CI rodando os testes de integridade. Ver
[`docs/final-report.md`](docs/final-report.md).

## Contribuindo

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) — setup, fluxo de git (GitHub Flow), Conventional
Commits e a **regra de ouro**: todo item de conteúdo precisa de fonte verificada (o
`KnowledgeBaseIntegrityTest` falha o build se faltar). Também:
[`SECURITY.md`](SECURITY.md) · [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) ·
[`CHANGELOG.md`](CHANGELOG.md).

## Licença

Código sob **[MIT](LICENSE)**. O conteúdo (`knowledge-base/`, `docs/`) é escrito com palavras
próprias e **cita** terceiros — *System Design Workbook* (M. S. Fidelis), os repos `msfidelis` e
microservices.io — que continuam de seus autores. **Não** redistribui o PDF nem código de terceiros.
