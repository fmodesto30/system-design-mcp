import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";

export function Patterns() {
  const state = useAsync(() => api.patterns(), []);
  return (
    <div>
      <h1>Padrões</h1>
      <p className="lede">
        Catálogo de padrões (microservices.io + extras do livro), mapeados para onde aparecem nos repositórios
        de referência.
      </p>
      <Async state={state}>
        {(list) => (
          <div className="card-list">
            {list.map((p) => (
              <Link key={p.id} to={`/patterns/${p.id}`} className="list-card">
                <div className="list-card-head">
                  <span className="badge">{p.category}</span>
                  <h3>{p.name}</h3>
                </div>
                <p>{p.problem}</p>
              </Link>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
