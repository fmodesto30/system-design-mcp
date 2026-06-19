# Contributing

Obrigado por contribuir com o **System Design Specialist Lab**. Este guia cobre setup, fluxo de
git, padrão de commit e — o mais importante aqui — a **regra de fontes**.

## Pré-requisitos

- **JDK 21** (validado com Temurin 21) · **Node 20+** · Docker (opcional, pro stack completo).
- Maven não é necessário: o BFF traz `./mvnw`.

## Setup & comandos

| Componente | Setup | Testar / Buildar | Rodar |
|------------|-------|------------------|-------|
| **BFF** (`bff/`) | — | `./mvnw test` | `./mvnw spring-boot:run` (:8080) |
| **Frontend** (`frontend/`) | `npm install` | `npm run build` (tsc strict + vite) | `npm run dev` (:5173) |
| **MCP** (`mcp/`) | `npm install && npm run build` | `npm run smoke` | spawnado pelo harness |
| **Tudo** | — | `scripts/test.sh` | `docker compose up --build` |

> Em Windows com antivírus restritivo, o boot live do BFF precisa de
> `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=Z:\nope` (ver `docs/runbook.md`). Os testes não.

## A regra de ouro: nada sem fonte

O lab vale porque **toda afirmação aponta pra uma fonte**. Ao mexer em conteúdo
(`knowledge-base/*.json`):

1. todo item precisa de `sourceRefs` com `kind`/`source`/`locator` reais;
2. depois de editar, rode **`python scripts/resolve_source_urls.py`** pra (re)verificar os `url`
   com `curl` — links quebrados não entram;
3. `./mvnw test` roda o **`KnowledgeBaseIntegrityTest`**, que falha o build se algum item não tiver
   fonte ou se um cross-ref (`relatedPatterns`/`diagrams`/…) não resolver.

Conteúdo de **IA & Agentes** vai só em `ai-agents-glossary.json` (trilha separada, sourced a refs
de IA) — não misture com o System Design (que é sourced ao workbook).

## Fluxo de git (GitHub Flow)

- `main` é sempre publicável. **Nunca commite direto em `main`.**
- Crie branch a partir de `main`: `feat/<x>`, `fix/<x>`, `docs/<x>`, `chore/<x>`,
  `refactor/<x>`, `test/<x>`.
- Abra **PR** contra `main`. CI verde (testes + build) é obrigatório pra merge.
- Um commit = uma intenção; prefira commit novo a `--amend` em commit já pushado.

## Commits (Conventional Commits)

`tipo(escopo): assunto no imperativo` — ex.: `feat(mcp): add search tool`,
`fix: resolve broken source links`, `docs: update runbook`.
Tipos: `feat` · `fix` · `docs` · `refactor` · `test` · `chore` · `perf`.

## Estilo de código

- Siga a convenção do arquivo ao redor; respeite o `.editorconfig`.
- **BFF:** hexagonal — domínio sem anotação de framework; DTO de web separado do domínio.
- **Frontend:** TypeScript strict; componentes reutilizáveis em `src/components`.
- **Sem segredo/credencial** no código, teste ou commit (ver `SECURITY.md`).

## Checklist de PR

- [ ] `./mvnw test` verde · `npm run build` (frontend) OK · `npm run smoke` (se mexeu no MCP).
- [ ] `scripts/resolve_source_urls.py` rodado, se tocou conteúdo.
- [ ] Conventional commit; descrição do PR explica o **porquê**.
- [ ] Sem segredo; docs atualizados se o comportamento mudou.
