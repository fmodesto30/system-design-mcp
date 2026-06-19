// Smoke test: spawns the built server over stdio with the MCP SDK client and exercises the tools.
// Run after `npm run build`.  `npm run smoke`
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const HERE = dirname(fileURLToPath(import.meta.url));
const serverPath = join(HERE, "..", "dist", "server.js");

const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });
const client = new Client({ name: "smoke", version: "0.0.0" });
await client.connect(transport);

// 1. tools/list has exactly the 4 tools
const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
console.log("tools:", names.join(", "));
assert.deepEqual(names, ["get", "list", "overview", "search"], "unexpected tool set");

const parse = (res) => JSON.parse(res.content[0].text);

// 2. overview returns 8 collections (incl. databases)
const ov = parse(await client.callTool({ name: "overview", arguments: {} }));
assert.equal(ov.length, 8, "overview should list 8 collections");
assert.ok(ov.some((c) => c.kind === "databases" && c.count === 6), "databases collection (6) must be exposed");

// 3. search finds the idempotency content
const hits = parse(await client.callTool({ name: "search", arguments: { query: "idempotência kafka consumidor" } }));
const ids = hits.map((h) => h.id);
console.log("search hits:", ids.join(", ") || "(none)");
assert.ok(
  ids.includes("q02") || ids.includes("idempotent-consumer"),
  "expected q02 or idempotent-consumer in search hits",
);
assert.ok(hits[0].sourceRefs, "hits must carry sourceRefs");

// 4. get returns a full item with a verified url
const pat = parse(await client.callTool({ name: "get", arguments: { kind: "patterns", id: "event-sourcing" } }));
assert.equal(pat.id, "event-sourcing");
assert.ok(pat.sourceRefs?.some((r) => r.url), "event-sourcing must have a sourceRef with a url");

// 5. get with bad id is a typed error, not a crash
const bad = await client.callTool({ name: "get", arguments: { kind: "patterns", id: "nope-xyz" } });
assert.equal(bad.isError, true, "missing id should return isError");

await client.close();
console.log("SMOKE OK");
