# HANDOFF — System Design Specialist Lab

> Fio da meada entre sessões. Seção vazia = pergunta aberta, não "N/A" mudo.

- **Data / sessão:** 2026-06-19 · build inicial + 2 follow-ups (módulo IA, fix de links)
- **Repo / app:** `apps/system-design-specialist-lab` (remote: `github.com/fmodesto30/system-design-mcp`)
- **Status geral:** 🟢 GREEN — tudo compila, 17 testes verdes, roda live no Docker, 0 links quebrados.

## 1. Objetivo atual
Produto de **estudo/consulta de System Design** (não chatbot, **sem LLM em runtime**): BFF Java
serve uma base de conhecimento JSON; frontend React navega. Tudo **ancorado em fonte** (workbook
de M. S. Fidelis + 3 repos do mesmo autor + microservices.io) — toda afirmação tem `sourceRefs`,
garantido por teste de integridade. Evoluiu pra ter 2 trilhas: **System Design** (entrevista) e
**IA & Agentes** (glossário pra dev backend aprendendo IA). Entregue e funcional.

## 2. Branch atual
- **Branch:** `feat/system-design-specialist-lab` · **base:** `origin/main` (a7ca601 = README inicial
  do GitHub; **história NÃO-relacionada** — esta branch é o import do projeto inteiro).
- **Último commit:** `a5df61e` — docs+fix: refresh final-report (17 tests, IA module, link fix).
- **Ahead/behind:** **ahead 1 não-pushado** (`a5df61e`); os 5 commits anteriores já estão no remote.
  → primeiro movimento ao retomar: `git push origin feat/system-design-specialist-lab`.

## 3. Arquivos alterados
Projeto inteiro novo (~100 arquivos). Áreas:
- `bff/` — Java 21 + Spring Boot 3.4, hexagonal (`domain/{model,port}`, `application`,
  `infrastructure/{web,persistence,config}`); `mvnw` incluso; `Dockerfile`.
- `frontend/` — React + Vite + TS (`src/pages`, `src/components`, `api.ts`); `Dockerfile` + `nginx.conf`.
- `knowledge-base/*.json` — fonte de verdade (topics/patterns/flows/interview-questions/diagrams/
  evidence + **ai-agents-glossary**) + `schema/`. Cada `sourceRef` agora tem `url` verificada.
- `docs/` — source-inventory, system-design-knowledge-map, architecture, ADRs, runbook,
  interview-guide, tradeoffs, glossary, **ai-agents-glossary**, open-questions, final-report.
- `scripts/` — `merge_validate_kb.py`, `resolve_source_urls.py`, `build.sh`, `test.sh`, `run.sh`.
- `docker-compose.yml`, `CLAUDE.md`. **Sensível:** `.tools/` (JDK21+Maven baixados) e
  `docs/_sources/` (PDF extraído) são **gitignored** — não comitar.

## 4. Decisões tomadas
- **BFF hexagonal em Java/Spring** (ADR-0002): domínio = records puros sem anotação; porta
  `KnowledgeBasePort`; adapter JSON. Serve de exemplo vivo do padrão BFF que o lab ensina.
- **Base JSON sem banco** (ADR-0003): read-only, versionável, validada por schema + teste de
  integridade. Trocar pra DB depois = só um novo adapter.
- **Frontend Vite+React** (ADR-0004), não Next — é navegador de KB, SSR é desnecessário.
- **Trilha IA & Agentes SEPARADA** do System Design: fontes são refs de IA (Anthropic, MCP spec),
  não o workbook → não fura a regra de sourcing. Felipe pediu (dev backend aprendendo IA).
- **`url` verificada por curl em cada sourceRef** (`resolve_source_urls.py`): bug era o front
  hardcodar microservices.io pra todo `reference` + linkar arquivo de repo via `tree/main` (404).
  Agora: deep-link se resolve, fallback pro índice, raiz do repo pra repo, sem link pro PDF.
- **Docker: BFF no host 18080** (8080 ocupado por outra stack Docker do Felipe — rag-llm-mcp etc.);
  no container Linux o BFF sobe **sem** o workaround AF_UNIX.

## 5. Testes rodados + evidências
- **BFF:** `./mvnw test` → **`Tests run: 17, Failures: 0, Errors: 0` — BUILD SUCCESS** (unit +
  contrato MockMvc + integridade da base).
- **Frontend:** `npm run build` → **built** (tsc strict + vite).
- **Gate da base:** `merge_validate_kb.py` → 29/20/7/30/12/24, 0 erro de schema, 0 id duplicado;
  cross-ref check → **0 quebrados**; `resolve_source_urls.py` sweep → **28 URLs únicas, 0 broken**.
- **Evidência (browser):** Docker live em :5173 → home, mapa de tópicos, **12/12 diagramas Mermaid
  renderizados (0 erro)**, Modo Entrevista expandindo Q&A com fontes, **0 erro de console**
  (screenshots na sessão). `stats` = `{topics:29,...,evidence:24,aiGlossary:13}`.
- **Veredito visual GPT-via-Chrome:** N/A (não é artefato SKP; gate aqui = testes + sweep de links).

## 6. Pendências
- **Merge `feat/...` → `main`** no GitHub: PR **não aberto** (PAT só tem `Contents:write`, `gh pr
  create` falha). Esperando **decisão do Felipe**: abrir PR pela URL, ou eu faço merge via `git`.
  ⚠️ históricos não-relacionados (`--allow-unrelated-histories` se for merge de verdade).
- **MCP server** (`system-design-mcp`): proposto e Felipe topou ("vc decide"), **não construído
  ainda**. Faria o nome do repo virar verdade — expõe a KB como tools pra outro Claude consumir.
- **`a5df61e` não-pushado** (push no primeiro movimento).

## 7. Riscos
- **`merge_validate_kb.py` é footgun agora:** ele reescreve os `knowledge-base/*.json` a partir de
  `_parts/` (gitignored, **sem o campo `url`**). Se rodar de novo, **perde os url**. → sempre rodar
  `resolve_source_urls.py` **depois** de qualquer `merge_validate`.
- **Boot LOCAL do BFF** (fora do Docker) precisa do workaround AF_UNIX desta máquina:
  `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=Z:\nope`. Os **testes** não (web MOCK, sem socket).
- **Links genéricos de "Anthropic docs"** (token, prompt…) apontam pra `docs.claude.com` (home),
  não anchor exato — subpágina de doc muda muito; deep-link só onde verifiquei estável.
- **`.tools/` é local** (JDK21+Maven baixados, gitignored): num checkout limpo, `./mvnw` baixa o
  Maven sozinho, mas precisa de um **JDK 21** no PATH/JAVA_HOME. A máquina tem JDK 25 global.

## 8. Próximos 5 passos
1. `git push origin feat/system-design-specialist-lab` (manda o `a5df61e`).
2. Decidir merge `feat/...`→`main` (PR por URL OU `git merge --allow-unrelated-histories`).
3. **Construir o MCP server** (`system-design-mcp`) — **spec pronto em
   [`docs/mcp-server-plan.md`](docs/mcp-server-plan.md)** (Node stdio, pasta `mcp/`, 4 tools
   `overview`/`search`/`list`/`get`, lê os mesmos JSON, DoD definido). Construir CONTRA o spec.
4. `docs/FOR-AGENTS.md` — como outro Claude consome o lab (ler repo / API / MCP).
5. CI mínimo (GitHub Actions) rodando `./mvnw test` + `resolve_source_urls.py` sweep; depois
   code-split do bundle Mermaid (~1 MB) e busca full-text.

## 9. Comandos úteis
```bash
REPO="E:/Claude/apps/system-design-specialist-lab"

# --- Docker (caminho à prova de bala) ---
cd "$REPO" && docker compose up --build -d     # UI http://localhost:5173 ; API :18080
docker compose ps                              # checar healthy
docker compose down                            # parar

# --- Local (precisa JDK 21) ---
export JAVA_HOME="$REPO/.tools/jdk/jdk-21.0.11+10"; export PATH="$JAVA_HOME/bin:$PATH"
export JAVA_TOOL_OPTIONS="-Djdk.net.unixdomain.tmpdir=Z:\\nope"   # só pro boot live
cd "$REPO/bff" && ./mvnw test                  # 17 testes
cd "$REPO/bff" && ./mvnw spring-boot:run       # :8080
cd "$REPO/frontend" && npm install && npm run dev   # :5173

# --- Manutenção da base ---
PY="E:/Claude/apps/sketchup-mcp/.venv/Scripts/python.exe"
"$PY" "$REPO/scripts/resolve_source_urls.py"   # re-verifica e re-baka os url (curl)
```

## 10. O que NÃO fazer
- **Não push direto em `main`** do remote; `main` recebe `feat/...` via PR/merge explícito.
- **Não re-rodar `merge_validate_kb.py` sem rodar `resolve_source_urls.py` depois** — perde os `url`.
- **Não misturar conteúdo de IA na trilha System Design** (topics/patterns/evidence): fura a regra
  "tudo ancorado no workbook". IA vai só em `ai-agents-glossary.json`.
- **Não subir o BFF no host 8080** via Docker (ocupado pela stack MCP/RAG do Felipe) — usar 18080.
- **Não comitar `.tools/` nem `docs/_sources/`** (gitignored; toolchain baixado + PDF extraído).
- **Não declarar link bom sem curl** — já quebrou uma vez; o sweep é a prova.

## 11. Checkpoint p/ próxima sessão
Parei após consertar os links quebrados (campo `url` verificado em toda fonte) + atualizar o
final-report + remover âncora morta, com Docker rebuildado e servindo. **Primeiro movimento:**
`git push` do `a5df61e`. **Sinal de que está tudo de pé:** `docker compose ps` mostra os 2
containers (bff `healthy`), `curl localhost:5173 → 200` e `curl localhost:18080/actuator/health → 200`.
Working tree limpa em `a5df61e`.
