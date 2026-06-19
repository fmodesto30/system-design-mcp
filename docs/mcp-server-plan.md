# Build spec — `system-design-mcp` (MCP server)

> Spec-driven (SDD): isto é o **contrato** que dirige a construção do MCP server. Quem for
> implementar (eu na próxima passada, outra sessão, ou outro agente) constrói **contra isto** e
> valida pela Definition of Done. Estado atual: **planejado, não construído.**

## 1. Objetivo

Expor a base de conhecimento do lab como um **MCP server stdio**, pra qualquer harness (Claude
Code, outro Claude, o Docker MCP Gateway do Felipe) consultar System Design + IA&Agentes como
**tools nativas**, com as **fontes junto** (pra o agente consumidor citar e não alucinar). Faz o
nome do repo `system-design-mcp` virar verdade.

**Sem LLM em runtime. Sem rede.** Lê os mesmos `knowledge-base/*.json` (fonte de verdade única) —
não depende do BFF estar de pé.

## 2. Stack e local

- **Node + TypeScript**, `@modelcontextprotocol/sdk`, transporte **stdio**.
- Pasta nova `mcp/` (própria `package.json`/`tsconfig`), irmã de `bff/` e `frontend/`.
- Motivo da escolha: reaproveita o toolchain Node que o repo já tem; não mete 3ª linguagem.
- Lê `../knowledge-base/*.json` em memória no startup. **Zero duplicação de dado.**

## 3. Superfície de tools (mínima e poderosa)

`kind` é um enum: `topics | patterns | flows | interview-questions | diagrams | evidence | ai-glossary`.

| Tool | Input | Retorno |
|------|-------|---------|
| `overview` | `{}` | contagens por coleção + 1 linha do que cada uma é (orienta o agente) |
| `search` | `{ query: string, kinds?: kind[], limit?: number=8 }` | matches `{kind, id, title, summary, score, sourceRefs[]}` ordenados por score |
| `list` | `{ kind }` | `[{ id, title }]` da coleção |
| `get` | `{ kind, id }` | item completo da coleção (com `sourceRefs[]` e `url`) |

- **Toda saída carrega `sourceRefs` (com `url` verificada)** — esse é o valor: o agente consumidor cita.
- 4 tools só. Nada de uma tool por coleção (polui o tool-list do harness).
- `get` com `kind`/`id` inexistente → erro MCP tipado (não exception solta).

## 4. Busca (sem IA)

- No startup: achatar tudo num índice `{kind, id, title, haystack}` onde `haystack` = title +
  summary + campos longos (definition/detailedExplanation/problem/question…).
- Score = soma de ocorrências dos termos da query (case/acento-insensitive), peso maior em title.
- Top `limit`. **Substring/keyword puro — nada de embeddings/RAG.** Determinístico.

## 5. Como rodar e plugar

```bash
cd mcp && npm install && npm run build      # gera dist/server.js
node dist/server.js                         # fala MCP por stdio
```
Registrar (uma das duas):
- **Docker MCP Gateway (Felipe):** `mcp-add` apontando pro comando `node <abs>/mcp/dist/server.js`.
- **.claude.json / .mcp.json:** `{ "system-design": { "command": "node", "args": ["<abs>/mcp/dist/server.js"] } }`.

## 6. Definition of Done (obrigatório)

O trabalho só está pronto se:
- [ ] `cd mcp && npm run build` compila (tsc strict).
- [ ] o server sobe em stdio e responde a `tools/list` com as 4 tools.
- [ ] `overview`, `search`, `list`, `get` funcionam contra os JSON reais (smoke test).
- [ ] lê `../knowledge-base/*.json` (não copia dado).
- [ ] toda resposta de `get`/`search` inclui `sourceRefs` com `url`.
- [ ] um **smoke test** (`mcp/test/` com o client do SDK, ou `docker mcp tools call`) provando
      `search("idempotência kafka")` devolve `q02`/`idempotent-consumer`.
- [ ] `docs/FOR-AGENTS.md` escrito (como o outro Claude pluga + exemplos de chamada).
- [ ] README e HANDOFF atualizados (nova pasta `mcp/`, como registrar).

## 7. Testes
- Unit: o índice de busca (`search` retorna o id esperado pra queries-âncora).
- Contrato MCP: `tools/list` tem as 4 tools com input schema; `get` de id inválido → erro tipado.
- Smoke: subir o server e chamar cada tool uma vez.

## 8. O que NÃO fazer
- **Não duplicar o conteúdo** — ler os JSON do `knowledge-base/`, nunca copiar pra dentro de `mcp/`.
- **Não meter LLM/embeddings/rede** em runtime — busca é local e determinística.
- **Não derrubar a regra de fonte** — toda saída leva `sourceRefs`; se um item não tiver, é bug do dado, conserta no JSON.
- **Não acoplar ao BFF** — o MCP é self-contained (lê arquivo), não chama `:18080`.
- **Não expor tool por coleção** — manter as 4 tools.

## 9. Esforço estimado
Pequeno: ~1 módulo de server + 1 de índice/busca + tool defs + smoke test + `FOR-AGENTS.md`.
A parte cara (conteúdo limpo, sourced, validado, schema congelado) **já está feita**.
