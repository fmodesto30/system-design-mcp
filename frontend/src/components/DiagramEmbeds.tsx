import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Mermaid } from "./Mermaid";

export function DiagramEmbed({ id }: { id: string }) {
  const state = useAsync(() => api.diagram(id), [id]);
  if (state.loading || state.error || !state.data) return null;
  const d = state.data;
  return (
    <figure className="diagram-embed">
      <Mermaid code={d.mermaid} />
      <figcaption>
        <Link to={`/diagrams/${d.id}`}>{d.title}</Link>
        {d.description ? ` — ${d.description}` : null}
      </figcaption>
    </figure>
  );
}

/** Renders each referenced diagram id inline. Each embed fetches its own full diagram. */
export function DiagramEmbeds({ ids }: { ids: string[] }) {
  if (!ids?.length) return null;
  return (
    <section>
      <h2>Diagramas</h2>
      {ids.map((id) => (
        <DiagramEmbed key={id} id={id} />
      ))}
    </section>
  );
}
