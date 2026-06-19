# FOR-AGENTS — consumir o System Design Specialist Lab por MCP

Guia pra outro Claude (ou qualquer harness MCP) usar a base de conhecimento como **tools nativas**,
com as fontes junto — pra aprender e construir **citando**, sem alucinar.

## O que é

`system-design-mcp` é um **MCP server stdio** (Node) que lê os mesmos `knowledge-base/*.json`
(fonte de verdade única) e expõe 4 tools. **Sem LLM, sem rede, sem banco** em runtime.

## Setup (uma vez)

```bash
cd mcp && npm install && npm run build   # cria node_modules + dist/server.js
npm run smoke                            # opcional: prova que sobe e responde
```

## Registrar (como "fica rodando")

Um MCP stdio **não é daemon** — o harness spawna `node mcp/dist/server.js` por stdin/stdout no
início da sessão e mata no fim. "Manter rodando" = registrar. O repo já traz um `.mcp.json`:

```json
{ "mcpServers": { "system-design": { "command": "node", "args": ["./mcp/dist/server.js"] } } }
```

- **Claude Code aberto NESTE repo:** o `.mcp.json` acima carrega sozinho.
- **Aberto em outra pasta (ex.: workspace pai):** adicione a entrada `system-design` no `.mcp.json`
  de lá (ou no `~/.claude.json` do projeto), com **caminho absoluto** pro `mcp/dist/server.js`.
- **Via Docker MCP Gateway:** path opcional/avançado — containerizar + `docker mcp catalog create` +
  `mcp-add`. Ver `docs/mcp-server-plan.md`.

Ao (re)abrir a sessão, as tools aparecem como `mcp__system-design__{overview,search,list,get}`.

## As 4 tools

| Tool | Input | Pra quê |
|------|-------|---------|
| `overview` | `{}` | orientar: contagem + descrição de cada coleção |
| `search` | `{ query, kinds?, limit? }` | achar por palavra-chave; volta matches com `sourceRefs` |
| `list` | `{ kind }` | ids+títulos de uma coleção |
| `get` | `{ kind, id }` | item completo (com `sourceRefs` + `url`) |

`kind` ∈ `topics · patterns · flows · interview-questions · diagrams · evidence · ai-glossary`.

## Fluxo típico

1. `overview {}` → ver o que existe.
2. `search { query: "idempotência kafka", limit: 5 }` → top matches `{kind,id,title,summary,score,sourceRefs}`.
3. `get { kind: "patterns", id: "idempotent-consumer" }` → conteúdo completo.
4. **Cite a fonte:** todo item traz `sourceRefs: [{ kind, source, locator, url }]` — use o `url`
   (curl-verificado) ao afirmar algo. Essa é a regra-mãe do lab: nada sem fonte.

## Exemplo de retorno (`search`)

```json
[
  { "kind": "interview-questions", "id": "q02",
    "title": "Como você garante idempotência em consumidores Kafka...",
    "summary": "Kafka entrega at-least-once, então duplicata é o caso normal...",
    "score": 14,
    "sourceRefs": [{ "kind": "pdf", "source": "System Design Workbook", "locator": "p.494" }] }
]
```

## Não faça

- Não trate como serviço standing (é spawnado pelo harness).
- Não ignore `sourceRefs` — o valor do lab é responder **com fonte**.
- Não edite os JSON por aqui; a fonte de verdade é `knowledge-base/` (e tem teste de integridade no BFF).
