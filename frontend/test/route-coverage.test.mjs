// Guarda de cobertura de rotas (estático, sem render, sem dependência nova — node --test).
// Impede a classe de bug em que um <Link to> / <NavLink to> aponta para uma rota que não existe
// no router (main.tsx) — o que no SPA-fallback do nginx cai numa <Outlet /> vazia (tela branca).
// Caso real: DiagramEmbed linkava /diagrams/:id antes de a rota existir.
//
// Roda: npm test  (node --test). Lê main.tsx + as páginas/componentes como TEXTO e cruza
// todo destino de link com o registro de rotas. Não importa componentes (sem mermaid/jsdom).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function listSourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      out.push(...listSourceFiles(full));
    } else if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.[tj]sx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/** Padrões de rota registrados no router de main.tsx. "/" representa a raiz/index. */
function registeredPaths() {
  const text = readFileSync(join(SRC, "main.tsx"), "utf8");
  const set = new Set();
  for (const m of text.matchAll(/\bpath:\s*"([^"]*)"/g)) set.add(m[1]);
  if (/\bindex:\s*true\b/.test(text)) set.add("/");
  return set;
}

/** Existe rota cujo 1º segmento é `seg` e o 2º é um :param? (ex.: "topics" -> "topics/:id") */
function hasParamRoute(registered, seg) {
  for (const p of registered) {
    const parts = p.split("/");
    if (parts.length >= 2 && parts[0] === seg && parts[1].startsWith(":")) return true;
  }
  return false;
}

function collectLinks(files) {
  const dynamicBases = [];
  const staticTargets = [];
  const chipBases = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const rel = file.slice(SRC.length + 1).replace(/\\/g, "/");
    // to={`...`}
    for (const m of text.matchAll(/\bto=\{\s*`([^`]*)`\s*\}/g)) {
      const path = m[1].split(/[?#]/)[0];
      const idx = path.indexOf("${");
      if (idx >= 0) {
        const base = path.slice(0, idx).replace(/\/+$/, "");
        if (base.startsWith("/")) dynamicBases.push({ base, use: { file: rel, raw: m[0] } });
      } else if (path.startsWith("/")) {
        staticTargets.push({ target: path, use: { file: rel, raw: m[0] } });
      }
    }
    // to="..." e to: "..." (array NAV)
    for (const m of text.matchAll(/\bto[=:]\s*"([^"]+)"/g)) {
      const t = m[1].split(/[?#]/)[0];
      if (t.startsWith("/")) staticTargets.push({ target: t, use: { file: rel, raw: m[0] } });
    }
    // base="/x" (LinkChips)
    for (const m of text.matchAll(/\bbase="(\/[^"]+)"/g)) {
      chipBases.push({ base: m[1], use: { file: rel, raw: m[0] } });
    }
  }
  return { dynamicBases, staticTargets, chipBases };
}

const registered = registeredPaths();
const { dynamicBases, staticTargets, chipBases } = collectLinks(listSourceFiles(SRC));

test("o registro de rotas é não-trivial (sanidade)", () => {
  assert.ok(registered.has("topics/:id"), "esperava rota topics/:id");
  assert.ok(registered.has("diagrams/:id"), "esperava rota diagrams/:id");
  assert.ok(dynamicBases.length > 0, "esperava ao menos um link dinâmico");
});

test("toda base dinâmica de <Link to> tem rota :param correspondente", () => {
  const v = dynamicBases
    .filter(({ base }) => !hasParamRoute(registered, base.replace(/^\//, "")))
    .map(({ base, use }) => `${use.file}: ${use.raw} -> falta rota "${base.replace(/^\//, "")}/:id"`);
  assert.deepEqual(v, [], "\n" + v.join("\n"));
});

test("toda base de LinkChips tem rota :param correspondente", () => {
  const v = chipBases
    .filter(({ base }) => !hasParamRoute(registered, base.replace(/^\//, "")))
    .map(({ base, use }) => `${use.file}: base="${base}" -> falta rota "${base.replace(/^\//, "")}/:id"`);
  assert.deepEqual(v, [], "\n" + v.join("\n"));
});

test("todo destino estático de <Link to>/NAV resolve para uma rota registrada", () => {
  const v = [];
  for (const { target, use } of staticTargets) {
    if (target === "/") {
      if (!registered.has("/")) v.push(`${use.file}: ${use.raw} -> sem rota index`);
      continue;
    }
    const seg = target.replace(/^\//, "");
    if (!registered.has(seg)) v.push(`${use.file}: ${use.raw} -> falta rota "${seg}"`);
  }
  assert.deepEqual(v, [], "\n" + v.join("\n"));
});
