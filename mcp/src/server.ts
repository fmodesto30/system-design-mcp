// system-design-mcp — stdio MCP server exposing the lab's knowledge base as 4 tools.
// Spawned by the harness (Claude Code / Docker MCP Gateway); talks MCP over stdin/stdout.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { KINDS, overview, list, get, search } from "./kb.js";

const server = new McpServer({ name: "system-design", version: "0.1.0" });
const kindEnum = z.enum(KINDS);

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

server.tool(
  "overview",
  "Visão geral da base: contagem e descrição de cada coleção (topics, patterns, flows, interview-questions, diagrams, evidence, ai-glossary). Comece por aqui para se orientar.",
  async () => json(overview()),
);

server.tool(
  "search",
  "Busca por palavra-chave na base de System Design + IA&Agentes. Retorna os melhores matches com {kind,id,title,summary,score,sourceRefs}. Use 'kinds' para restringir coleções.",
  {
    query: z.string().describe("termos de busca (PT-BR), ex.: 'idempotência kafka'"),
    kinds: z.array(kindEnum).optional().describe("restringe às coleções dadas; vazio = todas"),
    limit: z.number().int().positive().max(50).optional().describe("máx. de resultados (default 8)"),
  },
  async ({ query, kinds, limit }) => json(search(query, kinds, limit ?? 8)),
);

server.tool(
  "list",
  "Lista {id,title} de todos os itens de uma coleção.",
  { kind: kindEnum },
  async ({ kind }) => json(list(kind)),
);

server.tool(
  "get",
  "Item completo (com sourceRefs e url verificadas) de uma coleção, por id. Use 'list' ou 'search' para descobrir ids.",
  { kind: kindEnum, id: z.string() },
  async ({ kind, id }) => {
    const item = get(kind, id);
    if (!item) {
      return {
        content: [{ type: "text" as const, text: `Não encontrado: ${kind}/${id}. Use list/search para ids válidos.` }],
        isError: true,
      };
    }
    return json(item);
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[system-design-mcp] ready on stdio");
