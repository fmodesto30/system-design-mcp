import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { dbRows, dbDr, dbScenarios, COMPARE_DIMS, DR_DIMS, type DbRow, type DbScenario } from "../data/dbStudy";

const BY_ID = Object.fromEntries(dbRows.map((d) => [d.id, d]));
const cvar = (c: string) => ({ "--c": c } as CSSProperties);

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} de 5`}>
      {"★".repeat(n)}
      <span className="stars-off">{"★".repeat(Math.max(0, 5 - n))}</span>
    </span>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <span className="tip" title={text} aria-label={text}>
      ?
    </span>
  );
}

function DbCard({ d }: { d: DbRow }) {
  return (
    <Link to={`/databases/${d.id}`} className="db-study-card" style={cvar(d.color)}>
      <div className="dsc-head">
        <span className="dsc-cat">{d.category}</span>
        <Stars n={d.rating} />
      </div>
      <h3>{d.name}</h3>
      <div className="dsc-price">
        {d.price}
        <span>/mês</span>
      </div>
      <div className="dsc-engine">{d.engine}</div>
      <div className="dsc-specs">
        <div>
          <span>Instância</span>
          <b>{d.instancia}</b>
        </div>
        <div>
          <span>CAP · PACELC</span>
          <b>
            {d.cap} · {d.pacelc}
          </b>
        </div>
        <div>
          <span>Failover</span>
          <b>{d.failover}</b>
        </div>
        <div>
          <span>Storage</span>
          <b>{d.storage}</b>
        </div>
      </div>
      <span className="dsc-go">Ver detalhes →</span>
    </Link>
  );
}

function ScenarioCard({ s }: { s: DbScenario }) {
  const rec = BY_ID[s.recommendedDb];
  const ru = s.runnerUp ? BY_ID[s.runnerUp.db] : null;
  return (
    <div className="scenario-card" style={cvar(rec?.color ?? "var(--brand)")}>
      <div className="sc-head">
        <h3>{s.title}</h3>
        <Stars n={s.stars} />
      </div>
      <div className="sc-rec">
        <span className="badge">★ Recomendado</span>
        <Link to={`/databases/${s.recommendedDb}`} className="sc-rec-name">
          {rec?.name ?? s.recommendedDb}
        </Link>
        {rec ? <span className="db-price">{rec.price}/mês</span> : null}
      </div>
      <p className="muted">{s.summary}</p>
      <ul className="sc-points">
        {s.points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      {ru && s.runnerUp ? (
        <div className="sc-runner">
          <span className="muted">Alternativa:</span> <Link to={`/databases/${s.runnerUp.db}`}>{ru.name}</Link> —{" "}
          {s.runnerUp.note}
        </div>
      ) : null}
    </div>
  );
}

function CompareTable<T extends { id: string; name: string; color: string }>({
  rows,
  dims,
}: {
  rows: T[];
  dims: { key: keyof T; label: string; tip: string }[];
}) {
  return (
    <div className="table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Característica</th>
            {rows.map((d) => (
              <th key={d.id} style={{ color: d.color }}>
                {d.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dims.map((dim) => (
            <tr key={String(dim.key)}>
              <td className="dim">
                {dim.label} <Tip text={dim.tip} />
              </td>
              {rows.map((d) => (
                <td key={d.id}>{String(d[dim.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Databases() {
  const cp = dbRows.filter((d) => d.cap === "CP");
  const ap = dbRows.filter((d) => d.cap === "AP");
  return (
    <div className="db-study">
      <h1>Bancos de Dados AWS</h1>
      <p className="lede">
        Seleção e comparação de banco para sistemas distribuídos — cards, comparativo técnico, backup/DR, CAP/PACELC e
        um decisor interativo. Cada banco tem detalhe fonteado.
      </p>

      <nav className="db-section-nav">
        <a href="#visao">Visão geral</a>
        <a href="#cenarios">Cenários</a>
        <a href="#comparativo">Comparativo</a>
        <a href="#dr">Backup / DR</a>
        <a href="#cap">CAP / PACELC</a>
        <Link to="/databases/builder">Monte seu banco →</Link>
      </nav>

      <section id="visao">
        <h2>Visão Geral</h2>
        <div className="db-study-grid">
          {dbRows.map((d) => (
            <DbCard key={d.id} d={d} />
          ))}
        </div>
      </section>

      <section id="cenarios">
        <h2>Recomendação por Cenário</h2>
        <div className="scenario-grid">
          {dbScenarios.map((s) => (
            <ScenarioCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <section id="comparativo">
        <h2>Comparativo Técnico (6 opções)</h2>
        <p className="muted">Passe o mouse no “?” de cada característica para o que ela significa.</p>
        <CompareTable rows={dbRows} dims={COMPARE_DIMS} />
      </section>

      <section id="dr">
        <h2>Backup, DR e Resiliência</h2>
        <CompareTable rows={dbDr} dims={DR_DIMS} />
      </section>

      <section id="cap">
        <h2>CAP / PACELC</h2>
        <p className="muted">
          Sob partição de rede (CAP) é impossível ter Consistência <em>e</em> Disponibilidade — escolhe 2. O PACELC
          estende: mesmo sem partição (Else), há trade-off Latência×Consistência. Aprofunde em{" "}
          <Link to="/topics/cap-acid-base">CAP, ACID e BASE</Link> e <Link to="/topics/pacelc-theorem">PACELC</Link>.
        </p>
        <div className="cap-grid">
          <div className="cap-col cp">
            <h3>CP — Consistência sob partição</h3>
            <p className="muted">Recusa a escrita em vez de divergir. Ledger, saldo, transações.</p>
            <div className="cap-chips">
              {cp.map((d) => (
                <Link key={d.id} to={`/databases/${d.id}`} className="chip" style={{ borderColor: d.color, color: d.color }}>
                  {d.name} · {d.pacelc}
                </Link>
              ))}
            </div>
          </div>
          <div className="cap-col ap">
            <h3>AP — Disponibilidade sob partição</h3>
            <p className="muted">Sempre responde, converge depois. Read models, carrinho, cache.</p>
            <div className="cap-chips">
              {ap.map((d) => (
                <Link key={d.id} to={`/databases/${d.id}`} className="chip" style={{ borderColor: d.color, color: d.color }}>
                  {d.name} · {d.pacelc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="decisor">
        <Link to="/databases/builder" className="hero-card db-builder-cta">
          <h2>Monte seu banco — decisor interativo</h2>
          <p className="muted">
            Responda 5 perguntas do seu caso (ACID, JOINs, workload, latência, custo) e veja o banco recomendado, com o
            placar recalculando ao vivo.
          </p>
          <span className="btn btn-primary">Abrir o decisor →</span>
        </Link>
      </section>
    </div>
  );
}
