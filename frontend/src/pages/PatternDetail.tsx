import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Markdown } from "../components/Markdown";
import { SourceRefList } from "../components/SourceRefList";
import { TradeOffTable } from "../components/TradeOffTable";
import { LinkChips } from "../components/Chips";
import { DiagramEmbeds } from "../components/DiagramEmbeds";

function Bullets({ title, items, kind }: { title: string; items: string[]; kind: string }) {
  if (!items?.length) return null;
  return (
    <section className={`bullets ${kind}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </section>
  );
}

export function PatternDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => api.pattern(id), [id]);
  return (
    <Async state={state}>
      {(p) => (
        <article className="detail">
          <span className="badge">{p.category}</span>
          <h1>{p.name}</h1>

          <section>
            <h2>Problema</h2>
            <Markdown>{p.problem}</Markdown>
            <h2>Solução</h2>
            <Markdown>{p.solution}</Markdown>
          </section>

          <div className="two-col">
            <Bullets title="Quando usar" items={p.whenToUse} kind="use" />
            <Bullets title="Quando evitar" items={p.whenToAvoid} kind="avoid" />
          </div>

          {p.exampleFromRepo && (
            <section className="callout">
              <h2>Nos repositórios</h2>
              <Markdown>{p.exampleFromRepo}</Markdown>
            </section>
          )}

          {p.financialExample && (
            <section>
              <h2>Exemplo financeiro</h2>
              <Markdown>{p.financialExample}</Markdown>
            </section>
          )}

          {p.tradeOffs.length > 0 && (
            <section>
              <h2>Trade-offs</h2>
              <TradeOffTable tradeOffs={p.tradeOffs} />
            </section>
          )}

          {p.interviewAngle && (
            <section className="callout">
              <h2>Em entrevista</h2>
              <Markdown>{p.interviewAngle}</Markdown>
            </section>
          )}

          <DiagramEmbeds ids={p.diagrams} />
          <LinkChips label="Padrões relacionados" base="/patterns" ids={p.relatedPatterns} />
          <SourceRefList refs={p.sourceRefs} />
        </article>
      )}
    </Async>
  );
}
