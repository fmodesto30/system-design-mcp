import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Mermaid } from "../components/Mermaid";
import { LinkChips } from "../components/Chips";
import { SourceRefList } from "../components/SourceRefList";

export function DiagramDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => api.diagram(id), [id]);
  return (
    <Async state={state}>
      {(d) => (
        <article className="detail">
          <span className="badge">diagrama</span>
          <h1>{d.title}</h1>
          {d.description && <p className="lede">{d.description}</p>}
          <figure className="diagram-embed">
            <Mermaid code={d.mermaid} />
          </figure>
          <LinkChips label="Tópicos relacionados" base="/topics" ids={d.relatedTopics} />
          <LinkChips label="Padrões relacionados" base="/patterns" ids={d.relatedPatterns} />
          <SourceRefList refs={d.sourceRefs} />
        </article>
      )}
    </Async>
  );
}
