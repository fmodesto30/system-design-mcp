import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { dbColor } from "../db";

export function Databases() {
  const state = useAsync(() => api.databases(), []);
  return (
    <div>
      <h1>Bancos de Dados</h1>
      <p className="lede">
        Seis opções de banco AWS comparadas por consistência (CAP/PACELC), custo e failover — cada uma
        com fonte. Use o <Link to="/databases/builder">decisor</Link> para achar o banco do seu caso e
        brincar com os trade-offs.
      </p>
      <Async state={state}>
        {(list) => (
          <div className="card-list">
            {list.map((d) => (
              <Link
                key={d.id}
                to={`/databases/${d.id}`}
                className="list-card db-card"
                style={{ boxShadow: `inset 3px 0 0 ${dbColor(d.id)}` }}
              >
                <div className="list-card-head">
                  <span className="badge">{d.category}</span>
                  <h3>{d.name}</h3>
                </div>
                <p>{d.summary}</p>
                <div className="db-card-meta">
                  <span className="db-price">{d.priceMonthly}/mês</span>
                  <span className="chip">{d.capTheorem}</span>
                  <span className="muted">{d.engine}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
