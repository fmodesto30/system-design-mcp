// Loads the knowledge base from the SINGLE source of truth (../../knowledge-base/*.json) and
// builds an in-memory keyword index. No copy of the data, no network, no LLM.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// dist/kb.js -> up to mcp/ -> up to app root -> knowledge-base/
const HERE = dirname(fileURLToPath(import.meta.url));
const KB_DIR = join(HERE, "..", "..", "knowledge-base");

export const KINDS = [
  "topics", "patterns", "flows", "interview-questions", "diagrams", "evidence", "ai-glossary", "databases",
] as const;
export type Kind = (typeof KINDS)[number];

const FILES: Record<Kind, string> = {
  "topics": "topics.json",
  "patterns": "patterns.json",
  "flows": "flows.json",
  "interview-questions": "interview-questions.json",
  "diagrams": "diagrams.json",
  "evidence": "evidence.json",
  "ai-glossary": "ai-agents-glossary.json",
  "databases": "databases.json",
};

const DESC: Record<Kind, string> = {
  "topics": "Topicos de System Design (capitulos do workbook)",
  "patterns": "Padroes arquiteturais (microservices.io + extras do livro)",
  "flows": "Fluxos arquiteturais passo a passo dos repositorios de referencia",
  "interview-questions": "Perguntas de entrevista de System Design (nivel staff)",
  "diagrams": "Diagramas Mermaid de arquiteturas e fluxos",
  "evidence": "Matriz afirmacao -> evidencia -> fonte",
  "ai-glossary": "Glossario IA & Agentes (pra dev backend)",
  "databases": "Bancos de dados AWS (Aurora, RDS, DynamoDB, DocumentDB) com preco, CAP/PACELC e trade-offs",
};

export type Item = Record<string, any>;

const store: Record<Kind, Item[]> = Object.create(null);
for (const k of KINDS) {
  store[k] = JSON.parse(readFileSync(join(KB_DIR, FILES[k]), "utf8")) as Item[];
}

// strip combining diacritical marks (U+0300..U+036F) so "idempotencia" matches "idempotência"
const DIACRITICS = /[̀-ͯ]/g;
function norm(s: string): string {
  return (s || "").normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

export function titleOf(it: Item): string {
  return it.title ?? it.name ?? it.term ?? it.question ?? it.claim ?? it.id ?? "";
}
export function summaryOf(it: Item): string {
  return it.summary ?? it.problem ?? it.definition ?? it.shortAnswer ?? it.description ?? it.evidence ?? "";
}

export function overview() {
  return KINDS.map((k) => ({ kind: k, count: store[k].length, description: DESC[k] }));
}
export function list(kind: Kind) {
  return store[kind].map((it) => ({ id: it.id, title: titleOf(it) }));
}
export function get(kind: Kind, id: string): Item | undefined {
  return store[kind].find((it) => it.id === id);
}

interface IndexEntry {
  kind: Kind;
  id: string;
  title: string;
  titleN: string;
  hayN: string;
}
const index: IndexEntry[] = [];
for (const k of KINDS) {
  for (const it of store[k]) {
    index.push({
      kind: k,
      id: it.id,
      title: titleOf(it),
      titleN: norm(titleOf(it)),
      hayN: norm(JSON.stringify(it)),
    });
  }
}

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function count(haystack: string, term: string): number {
  if (!term) return 0;
  const m = haystack.match(new RegExp(esc(term), "g"));
  return m ? m.length : 0;
}

export interface SearchHit {
  kind: Kind;
  id: string;
  title: string;
  summary: string;
  score: number;
  sourceRefs: unknown[];
}

/** Keyword search across the base. Title matches weigh 3x. Deterministic; no embeddings. */
export function search(query: string, kinds?: Kind[], limit = 8): SearchHit[] {
  const terms = norm(query).split(/\s+/).filter((t) => t.length > 1);
  const allow = kinds && kinds.length ? new Set(kinds) : null;
  const hits: SearchHit[] = [];
  for (const e of index) {
    if (allow && !allow.has(e.kind)) continue;
    let score = 0;
    for (const t of terms) score += count(e.titleN, t) * 3 + count(e.hayN, t);
    if (score > 0) {
      const it = get(e.kind, e.id)!;
      hits.push({
        kind: e.kind,
        id: e.id,
        title: e.title,
        summary: summaryOf(it),
        score,
        sourceRefs: (it.sourceRefs as unknown[]) ?? [],
      });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}
