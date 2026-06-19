import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { SourceRefList } from "../components/SourceRefList";
import { LinkChips, TagChips } from "../components/Chips";
import { DiagramEmbeds } from "../components/DiagramEmbeds";

export function FlowDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => api.flow(id), [id]);
  return (
    <Async state={state}>
      {(f) => (
        <article className="detail">
          <h1>{f.title}</h1>
          <p className="lede">{f.summary}</p>

          <TagChips label="Componentes" items={f.components} />

          <section>
            <h2>Passo a passo</h2>
            <ol className="steps">
              {f.steps.map((s) => (
                <li key={s.order}>
                  <span className="actor">{s.actor}</span>
                  <span className="action">{s.action}</span>
                  {s.note ? <span className="note"> — {s.note}</span> : null}
                </li>
              ))}
            </ol>
          </section>

          {f.diagram ? <DiagramEmbeds ids={[f.diagram]} /> : null}
          <LinkChips label="Padrões relacionados" base="/patterns" ids={f.relatedPatterns} />
          <SourceRefList refs={f.sourceRefs} />
        </article>
      )}
    </Async>
  );
}
