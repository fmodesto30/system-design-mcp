import { Link } from "react-router-dom";
import { api, type TopicSummary } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";

function groupByCategory(topics: TopicSummary[]): [string, TopicSummary[]][] {
  const map = new Map<string, TopicSummary[]>();
  for (const t of topics) {
    const list = map.get(t.category) ?? [];
    list.push(t);
    map.set(t.category, list);
  }
  return [...map.entries()];
}

export function Home() {
  const stats = useAsync(() => api.stats(), []);
  const topics = useAsync(() => api.topics(), []);

  return (
    <div>
      <header className="page-head">
        <h1>System Design Specialist Lab</h1>
        <p className="lede">
          Base de conhecimento interativa de System Design, ancorada no <em>System Design Workbook</em>{" "}
          (Matheus Scarpato Fidelis) e em três implementações de referência. Cada explicação aponta para a
          sua fonte — nada é inventado.
        </p>
      </header>

      <Async state={stats}>
        {(s) => (
          <div className="stat-grid">
            <Stat to="/topics" n={s.topics} label="Tópicos" />
            <Stat to="/patterns" n={s.patterns} label="Padrões" />
            <Stat to="/flows" n={s.flows} label="Fluxos" />
            <Stat to="/interview" n={s.interviewQuestions} label="Perguntas" />
            <Stat to="/diagrams" n={s.diagrams} label="Diagramas" />
            <Stat to="/databases" n={s.databases} label="Bancos" />
            <Stat to="/evidence" n={s.evidence} label="Evidências" />
            <Stat to="/ai-agents" n={s.aiGlossary} label="IA & Agentes" />
          </div>
        )}
      </Async>

      <h2>Mapa de tópicos</h2>
      <Async state={topics}>
        {(list) => (
          <div className="topic-map">
            {groupByCategory(list).map(([cat, ts]) => (
              <section key={cat} className="cat-card">
                <h3>{cat}</h3>
                <ul>
                  {ts.map((t) => (
                    <li key={t.id}>
                      <Link to={`/topics/${t.id}`}>{t.title}</Link>
                      <span className="muted"> — {t.summary}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}

function Stat({ to, n, label }: { to: string; n: number; label: string }) {
  return (
    <Link to={to} className="stat">
      <span className="stat-n">{n}</span>
      <span className="stat-l">{label}</span>
    </Link>
  );
}
