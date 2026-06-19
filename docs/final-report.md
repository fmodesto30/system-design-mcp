# Final Report — System Design Specialist Lab

Relatório de entrega (FASE 6). Tudo abaixo foi **executado e verificado**, não apenas escrito.

## 1. O que foi criado

Um produto de estudo/consulta de System Design com **backend (BFF), frontend, base de
conhecimento, evidências, diagramas e perguntas de entrevista** — tudo ancorado em fontes
reais (workbook + 3 repositórios + microservices.io) e sem LLM em runtime.

| Camada | Stack | Estado |
|--------|-------|--------|
| BFF | Java 21 + Spring Boot 3.4 (hexagonal) | compila, **17 testes verdes**, sobe live em :8080 |
| Frontend | React + Vite + TypeScript (strict) | **build OK**, 11 telas, roda live em :5173 |
| Knowledge base | JSON versionado + JSON Schema | validado por schema + teste de integridade |
| Docs | Markdown (inventário, mapa, ADRs, runbook, guia, trade-offs, glossário) | completos |
| Infra | docker-compose + Dockerfiles + scripts | presentes |

### Conteúdo da base (servido pela API)
- **29 tópicos** (capítulos do workbook)
- **20 padrões** (os 18 do microservices.io exigidos + consistent-hashing, bulkhead, cell-based)
- **7 fluxos** arquiteturais (dos 3 repos + o próprio BFF)
- **30 perguntas** de entrevista (resposta curta/detalhada/desenho mental/riscos/trade-offs/como responder)
- **12 diagramas** Mermaid
- **24 evidências** (matriz afirmação → evidência → fonte)
- **13 termos** no módulo **IA & Agentes** (trilha separada, sourced a refs de IA)

## 2. Estrutura de diretórios

```
system-design-specialist-lab/
├── README.md
├── docker-compose.yml
├── bff/                      Java 21 + Spring Boot (mvnw incluso)
│   ├── pom.xml  Dockerfile
│   └── src/main/java/io/systemdesign/lab/{domain,application,infrastructure}
│   └── src/test/java/...     (unit + contract + integrity)
├── frontend/                 React + Vite + TS
│   ├── package.json  vite.config.ts  Dockerfile  nginx.conf
│   └── src/{pages,components,api.ts}
├── knowledge-base/
│   ├── topics.json patterns.json flows.json interview-questions.json diagrams.json evidence.json
│   └── schema/knowledge-base.schema.json
├── docs/
│   ├── source-inventory.md  system-design-knowledge-map.md  architecture.md
│   ├── interview-guide.md  tradeoffs.md  glossary.md  runbook.md
│   ├── open-questions.md  final-report.md  adr/
└── scripts/  (build.sh test.sh run.sh merge_validate_kb.py)
```

## 3. Comandos para rodar

```bash
# BFF
cd bff && ./mvnw spring-boot:run            # :8080
# Frontend
cd frontend && npm install && npm run dev   # :5173
# Tudo via Docker
docker compose up --build
# Testes
cd bff && ./mvnw test
cd frontend && npm run build
```

## 4. Endpoints disponíveis

`/api/topics[/{id}]` · `/api/patterns[/{id}]` · `/api/flows[/{id}]` ·
`/api/interview/questions[/{id}]` · `/api/diagrams[/{id}]` · `/api/evidence` ·
`/api/ai-glossary` · `/api/meta/stats` · `/actuator/health` · `/actuator/prometheus`.

## 5. Telas disponíveis

Início (mapa de tópicos + stats) · Tópicos · Tópico (detalhe) · Padrões · Padrão ·
Fluxos · Fluxo · Diagramas (galeria Mermaid) · **Modo Entrevista** (Q&A expansível) ·
**Comparar arquiteturas** · **Evidências e fontes** · **IA & Agentes** (glossário + quiz).

## 6. Padrões documentados

Database per Service · Saga · API Composition · CQRS · Domain Event · Event Sourcing ·
Transactional Outbox · Polling Publisher · Transaction Log Tailing · Idempotent Consumer ·
API Gateway · Backend for Frontend · Circuit Breaker · Health Check API ·
Application Metrics · Distributed Tracing · Audit Logging · Consistent Hashing ·
Bulkhead · Cell-Based Architecture.

## 7. Decisões arquiteturais (ADRs)

- ADR-0001 registrar ADRs · ADR-0002 BFF Java hexagonal · ADR-0003 base JSON sem banco ·
  ADR-0004 frontend React+Vite. Ver `docs/adr/`.

## 8. Checklist de qualidade

| Critério | Status |
|----------|:------:|
| Compila (BFF) | ✅ `./mvnw test` BUILD SUCCESS |
| Testes mínimos (unit + contrato + integridade) | ✅ 17 testes |
| Build do frontend | ✅ `npm run build` OK |
| README funcional | ✅ |
| docker-compose | ✅ |
| Dados mockados / base local | ✅ JSON versionado |
| Sem serviço pago / sem segredo | ✅ |
| Sem credencial commitada | ✅ |
| `.gitignore` | ✅ |
| Scripts run/build/test | ✅ `scripts/` |
| Toda afirmação com fonte (`sourceRefs`) | ✅ garantido pelo teste de integridade |
| Cross-references resolvem | ✅ 0 quebrados |
| Diagramas Mermaid renderizam | ✅ 12/12 (verificado no browser) |

## 9. Resultados de verificação (executados)

- `python scripts/merge_validate_kb.py` → 29/20/7/30/12/24 itens, **0 erros de schema**, 0 ids duplicados.
- cross-ref check → **0 referências quebradas**.
- `./mvnw test` → `Tests run: 17, Failures: 0, Errors: 0` — **BUILD SUCCESS** (Java 21).
- `npm run build` → **built** (tsc strict + vite).
- BFF live (`spring-boot:run`) → `/actuator/health` UP, `/api/meta/stats` correto.
- Frontend live (`:5173`) → home, mapa de tópicos, **12 diagramas Mermaid renderizados (0 erros)**,
  Modo Entrevista expandindo Q&A com fontes — **0 erros de console**.

## 10. Limitações (honestas)

- Código dos repos lido via README/estrutura, não linha a linha (citações `repo:<arquivo>` =
  arquivo provável). Ver `docs/open-questions.md`.
- Base JSON em memória, read-only (decisão ADR-0003, não pendência).
- `Polling Publisher` / `Transaction Log Tailing` = referência conceitual (sem capítulo no livro).
- Bundle do Mermaid é grande (~1 MB) — aceitável para estudo; code-split é trabalho futuro.
- Em Windows com antivírus restritivo, o boot live do BFF exige
  `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=Z:\nope` (documentado no runbook); os testes não.

## 11. Próximos passos

Busca full-text · modo quiz cronometrado · CI rodando os testes de integridade ·
mais diagramas por fluxo · export do guia em PDF · code-split do Mermaid.

## 12. Falhas durante a execução (e como foram corrigidas)

| Passo | Erro | Causa | Correção |
|-------|------|-------|----------|
| Ler PDF | Read recusou (>100 MB) | limite da ferramenta | extração de texto com `pymupdf` para `docs/_sources/` |
| `pip` no venv | `No module named pip` | venv sem pip | `ensurepip` |
| Download do Maven (mirror) | zip 0 byte | mirror dlcdn falhou | re-download do `archive.apache.org` |
| `tsc -b` | TS6306/TS6310 (composite) | project reference exigia `composite` | trocar para `tsc --noEmit` + remover a referência |

## 13. Atualizações pós-entrega (mesma sessão)

- **Módulo "IA & Agentes"** (pedido do Felipe, dev backend aprendendo IA): glossário de 13 termos
  (token..eval) com analogias de backend e enquadramento motor/casca/loop. Trilha SEPARADA do
  System Design — fontes são refs de IA (Anthropic, MCP spec), não o workbook. Arquivos:
  `knowledge-base/ai-agents-glossary.json`, `docs/ai-agents-glossary.md`, página `/ai-agents`,
  `GET /api/ai-glossary`. Total agora: **17 testes** verdes.
- **Fix de links quebrados:** o front linkava toda fonte `reference` pra microservices.io e arquivos
  de repo via `tree/main` (404). Agora cada `sourceRef` carrega um `url` **verificado com curl em
  build-time** (`scripts/resolve_source_urls.py`): deep-link quando existe, fallback pro índice de
  padrões quando não, raiz do repo pra repos, sem link pro PDF. Varredura final: **28 URLs únicas,
  0 quebradas**.
- **Docker:** `docker compose up --build` validado live; UI :5173, BFF host **18080** (8080 ocupado
  por outra stack na máquina). No container Linux o BFF sobe sem o workaround AF_UNIX.
- **MCP server** (`mcp/`, Node stdio): expõe a base como 4 tools (`overview`/`search`/`list`/`get`),
  lendo os mesmos `knowledge-base/*.json`. `npm run smoke` verde (search "idempotência kafka" → q02).
  Registro em `.mcp.json` + `docs/FOR-AGENTS.md`. Spec em `docs/mcp-server-plan.md`. Faz o nome do
  repo `system-design-mcp` virar verdade.
