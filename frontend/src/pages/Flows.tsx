import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";

export function Flows() {
  const state = useAsync(() => api.flows(), []);
  return (
    <div>
      <h1>Fluxos arquiteturais</h1>
      <p className="lede">Fluxos ponta a ponta extraídos dos repositórios de referência.</p>
      <Async state={state}>
        {(list) => (
          <div className="card-list">
            {list.map((f) => (
              <Link key={f.id} to={`/flows/${f.id}`} className="list-card">
                <h3>{f.title}</h3>
                <p>{f.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
