import type { SourceRef } from "../api";

function label(ref: SourceRef): string {
  if (ref.kind === "pdf") return `📖 ${ref.source} ${ref.locator}`;
  if (ref.kind === "repo") return `</> ${ref.source}:${ref.locator}`;
  return `🔗 ${ref.source} ${ref.locator}`;
}

/**
 * Mostra as fontes de um item. As fontes SEM link (o workbook, repos locais) aparecem como rótulos
 * inline — esse é o conteúdo do qual o Lab NÃO depende de páginas externas. As fontes COM link
 * externo ficam recolhidas numa seção "Referências externas" (opcional): a documentação está toda
 * dentro do MCP; o link de fora é só uma referência, não uma dependência.
 */
export function SourceRefList({ refs }: { refs: SourceRef[] }) {
  if (!refs?.length) return null;
  const inline = refs.filter((r) => !r.url);
  const external = refs.filter((r) => r.url);
  return (
    <div className="sourcerefs">
      {inline.length > 0 && (
        <>
          <span className="sourcerefs-label">Fontes:</span>
          {inline.map((ref, i) => (
            <span key={i} className={`chip src-${ref.kind}`} title={ref.note ?? undefined}>
              {label(ref)}
            </span>
          ))}
        </>
      )}
      {external.length > 0 && (
        <details className="sourcerefs-ext">
          <summary>Referências externas ({external.length})</summary>
          <div className="sourcerefs-ext-links">
            {external.map((ref, i) => (
              <a
                key={i}
                className={`chip src-${ref.kind}`}
                href={ref.url!}
                target="_blank"
                rel="noreferrer"
                title={ref.note ?? undefined}
              >
                {label(ref)} ↗
              </a>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
