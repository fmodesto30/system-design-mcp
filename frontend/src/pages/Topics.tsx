import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";

export function Topics() {
  const state = useAsync(() => api.topics(), []);
  return (
    <div>
      <h1>Tópicos</h1>
      <p className="lede">Os capítulos do workbook como tópicos navegáveis.</p>
      <Async state={state}>
        {(list) => (
          <div className="card-list">
            {list.map((t) => (
              <Link key={t.id} to={`/topics/${t.id}`} className="list-card">
                <div className="list-card-head">
                  <span className="badge">{t.category}</span>
                  <h3>{t.title}</h3>
                </div>
                <p>{t.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
