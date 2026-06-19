import type { SourceRef } from "../api";

const REPO_URLS: Record<string, string> = {
  "msc-shard-router": "https://github.com/msfidelis/msc-shard-router",
  "msc-transactions-api": "https://github.com/msfidelis/msc-transactions-api",
  "event-source-distributed-ledger": "https://github.com/msfidelis/event-source-distributed-ledger",
};

function hrefFor(ref: SourceRef): string | null {
  if (ref.kind === "repo") {
    const base = REPO_URLS[ref.source];
    if (!base) return null;
    // locator like "pkg/hashring/" or "ledger/main.go" -> link into the repo tree
    return ref.locator ? `${base}/tree/main/${ref.locator.replace(/\/+$/, "")}` : base;
  }
  if (ref.kind === "reference") {
    return "https://microservices.io/patterns/index.html";
  }
  return null; // pdf: no public URL
}

function label(ref: SourceRef): string {
  if (ref.kind === "pdf") return `📖 Workbook ${ref.locator}`;
  if (ref.kind === "repo") return `</> ${ref.source}:${ref.locator}`;
  return `🔗 microservices.io ${ref.locator}`;
}

/** Renders the evidence pointers for any item. This is the "no claim without a source" UI. */
export function SourceRefList({ refs }: { refs: SourceRef[] }) {
  if (!refs?.length) return null;
  return (
    <div className="sourcerefs">
      <span className="sourcerefs-label">Fontes:</span>
      {refs.map((ref, i) => {
        const href = hrefFor(ref);
        const text = label(ref);
        const title = ref.note ?? undefined;
        return href ? (
          <a key={i} className={`chip src-${ref.kind}`} href={href} target="_blank" rel="noreferrer" title={title}>
            {text}
          </a>
        ) : (
          <span key={i} className={`chip src-${ref.kind}`} title={title}>
            {text}
          </span>
        );
      })}
    </div>
  );
}
