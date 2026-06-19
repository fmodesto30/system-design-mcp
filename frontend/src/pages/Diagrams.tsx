import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { DiagramEmbed } from "../components/DiagramEmbeds";

export function Diagrams() {
  const state = useAsync(() => api.diagrams(), []);
  return (
    <div>
      <h1>Diagramas</h1>
      <p className="lede">Diagramas Mermaid das arquiteturas e fluxos do Lab.</p>
      <Async state={state}>
        {(list) => (
          <div className="diagram-gallery">
            {list.map((d) => (
              <div key={d.id} className="gallery-item" id={d.id}>
                <h2>{d.title}</h2>
                <p className="muted">{d.description}</p>
                <DiagramEmbed id={d.id} />
              </div>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
