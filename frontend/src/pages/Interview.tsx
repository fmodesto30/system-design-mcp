import { useState } from "react";
import { Link } from "react-router-dom";
import { api, type QuestionSummary } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Markdown } from "../components/Markdown";
import { SourceRefList } from "../components/SourceRefList";
import { TradeOffTable } from "../components/TradeOffTable";
import { LinkChips, TagChips } from "../components/Chips";
import { PrepSection } from "../components/PrepSection";
import { dsaPrep, systemDesignPrep, behavioralPrep } from "../data/interviewPrep";
import { complexityGuide, structures, type DataStructure } from "../data/dsaFundamentals";
import { reports, crossLessons, pitfalls, resourceStack, type InterviewReport } from "../data/interviewReports";

function QuestionCard({ q }: { q: QuestionSummary }) {
  const [open, setOpen] = useState(false);
  const detail = useAsync(() => api.question(q.id), [open ? q.id : ""]);
  return (
    <div className={`qa ${open ? "open" : ""}`}>
      <button className="qa-head" onClick={() => setOpen((v) => !v)}>
        <span className="qa-id">{q.id}</span>
        <span className="qa-q">{q.question}</span>
        {q.difficulty ? <span className="badge small">{q.difficulty}</span> : null}
        <span className="qa-toggle">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="qa-body">
          <Async state={detail}>
            {(d) => (
              <>
                <div className="callout short">
                  <strong>Resposta curta.</strong> <Markdown>{d.shortAnswer}</Markdown>
                </div>
                <h4>Resposta detalhada</h4>
                <Markdown>{d.detailedAnswer}</Markdown>
                {d.mentalModel && (
                  <>
                    <h4>Desenho mental</h4>
                    <Markdown>{d.mentalModel}</Markdown>
                  </>
                )}
                {d.howToAnswerInInterview && (
                  <div className="callout">
                    <strong>Como responder.</strong> <Markdown>{d.howToAnswerInInterview}</Markdown>
                  </div>
                )}
                {d.repoExample && (
                  <>
                    <h4>Nos repositórios</h4>
                    <Markdown>{d.repoExample}</Markdown>
                  </>
                )}
                <TagChips label="Riscos" items={d.risks} />
                {d.tradeOffs.length > 0 && <TradeOffTable tradeOffs={d.tradeOffs} />}
                <LinkChips label="Padrões" base="/patterns" ids={d.patterns} />
                <LinkChips label="Tópicos" base="/topics" ids={d.relatedTopics} />
                <SourceRefList refs={d.sourceRefs} />
              </>
            )}
          </Async>
        </div>
      )}
    </div>
  );
}

/** /entrevista — landing do Modo Entrevista. */
export function InterviewOverview() {
  const cards = [
    {
      to: "/entrevista/system-design",
      title: "System Design",
      badge: "framework + banco",
      desc: "Framework de resposta, estimativa (Lei de Little, Scale Cube) e o banco de perguntas filtrável por dificuldade.",
    },
    {
      to: "/entrevista/dsa",
      title: "DSA",
      badge: "roadmap",
      desc: "Os 12 padrões na ordem certa, o método de ataque e como treinar. Sem editor aqui — você resolve no LeetCode.",
    },
    {
      to: "/entrevista/comportamental",
      title: "Comportamental & Estratégia",
      badge: "STAR + checklist",
      desc: "STAR, histórias pra ter prontas, perguntas comuns e o checklist de véspera e dia da entrevista.",
    },
  ];
  return (
    <div>
      <h1>Modo Entrevista</h1>
      <p className="lede">
        Ecossistema de preparação: <strong>System Design</strong> (framework + banco de perguntas), <strong>DSA</strong>{" "}
        (roadmap e dicas — você pratica no LeetCode) e <strong>comportamental + como chegar preparado</strong>. Use o
        menu à esquerda ou os atalhos abaixo.
      </p>
      <div className="hero-card">
        <h2>Sessão recomendada de hoje</h2>
        <div className="hero-step">
          <span className="n">1</span>
          <span className="t">Revise o <strong>framework de System Design</strong></span>
          <span className="d">~10 min</span>
        </div>
        <div className="hero-step">
          <span className="n">2</span>
          <span className="t">Pratique <strong>1 pergunta medium</strong> no banco</span>
          <span className="d">~35 min</span>
        </div>
        <div className="hero-step">
          <span className="n">3</span>
          <span className="t">Anote <strong>1 ponto fraco</strong> pra revisar depois</span>
          <span className="d">~5 min</span>
        </div>
      </div>
      <div className="prep-pillars">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="list-card prep-pillar">
            <div className="list-card-head">
              <h3>{c.title}</h3>
              <span className="badge">{c.badge}</span>
            </div>
            <p>{c.desc}</p>
            <span className="prep-pillar-go">Abrir →</span>
          </Link>
        ))}
      </div>
      <div className="callout">
        <strong>Como usar.</strong> Escolha uma trilha por sessão de estudo (não faça as três pela metade). Cada trilha
        abre com um framework no topo, seguido de dicas acionáveis. As perguntas de System Design vêm da base de
        conhecimento (com fontes citadas); o conteúdo de DSA e comportamental é guia de estudo curado.
      </div>
    </div>
  );
}

/** /entrevista/system-design — estratégia + banco de perguntas (da KB). */
export function InterviewSystemDesign() {
  const state = useAsync(() => api.questions(), []);
  const [diff, setDiff] = useState("all");
  return (
    <div>
      <h1>System Design — entrevista</h1>
      <PrepSection pillar={systemDesignPrep} />
      <h2>Banco de perguntas</h2>
      <p className="muted">
        Clique para abrir resposta curta, detalhada, desenho mental e como responder. Filtre pela dificuldade que você
        quer treinar.
      </p>
      <Async state={state}>
        {(list) => {
          const levels = ["all", ...Array.from(new Set(list.map((q) => q.difficulty).filter(Boolean)))];
          const filtered = diff === "all" ? list : list.filter((q) => q.difficulty === diff);
          return (
            <>
              <div className="button-group prep-filter">
                {levels.map((d) => (
                  <button key={d} className={diff === d ? "active" : ""} onClick={() => setDiff(d)}>
                    {d === "all" ? `Todas (${list.length})` : `${d} (${list.filter((q) => q.difficulty === d).length})`}
                  </button>
                ))}
              </div>
              <div className="qa-list">
                {filtered.map((q) => (
                  <QuestionCard key={q.id} q={q} />
                ))}
              </div>
            </>
          );
        }}
      </Async>
    </div>
  );
}

/** /entrevista/dsa — roadmap e dicas de coding interview. */
export function InterviewDsa() {
  return (
    <div>
      <h1>DSA — estruturas &amp; algoritmos</h1>
      <PrepSection pillar={dsaPrep} />
      <section className="prep-block resource-stack">
        <h3>Stack de recursos (sem enrolação)</h3>
        <p className="muted">
          <MD text={resourceStack.intro} />
        </p>
        {resourceStack.sections.map((s, i) => (
          <div key={i} className="rs-section">
            <h4>{s.title}</h4>
            <ul className="prep-tips">
              {s.points.map((p, j) => (
                <li key={j}>
                  <MD text={p} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <h4>O fluxo</h4>
        <ol className="rs-flow">
          {resourceStack.flow.map((f, i) => (
            <li key={i}>
              <MD text={f} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** /entrevista/comportamental — STAR, histórias e como chegar preparado. */
export function InterviewBehavioral() {
  return (
    <div>
      <h1>Comportamental &amp; Estratégia</h1>
      <PrepSection pillar={behavioralPrep} />
    </div>
  );
}

/** Renderiza **negrito** e `code` inline. */
function MD({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function BigOGuide() {
  const g = complexityGuide;
  return (
    <>
      <p className="lede">
        <MD text={g.intro} />
      </p>
      <h3>A hierarquia (do mais rápido ao mais lento)</h3>
      <div className="bigo-hier">
        {g.hierarchy.map((h) => (
          <div className="bigo-class" key={h.notation}>
            <code className="bigo-notation">{h.notation}</code>
            <div className="bigo-meta">
              <span className="bigo-name">{h.name}</span>
              <span className="bigo-ex">
                <MD text={h.example} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="bigo-cols">
        <div className="prep-block">
          <h3>Como contar lendo o código</h3>
          <ul className="prep-tips">
            {g.howToCount.map((x, i) => (
              <li key={i}>
                <MD text={x} />
              </li>
            ))}
          </ul>
        </div>
        <div className="prep-block">
          <h3>Tempo × espaço</h3>
          <ul className="prep-tips">
            {g.timeVsSpace.map((x, i) => (
              <li key={i}>
                <MD text={x} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="prep-block">
        <h3>Estimar o alvo pelas constraints</h3>
        <ul className="prep-tips">
          {g.fromConstraints.map((x, i) => (
            <li key={i}>
              <MD text={x} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function StructureCard({ s }: { s: DataStructure }) {
  return (
    <div className="ds-card">
      <h3>{s.name}</h3>
      <p className="muted ds-what">
        <MD text={s.what} />
      </p>
      <table className="ds-ops">
        <thead>
          <tr>
            <th>Operação</th>
            <th>Tempo</th>
            <th>Espaço</th>
          </tr>
        </thead>
        <tbody>
          {s.operations.map((o, i) => (
            <tr key={i}>
              <td>{o.op}</td>
              <td>
                <code>{o.time}</code>
              </td>
              <td>
                <code>{o.space}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ds-cols">
        <div>
          <h4>Quando usar</h4>
          <ul>
            {s.whenToUse.map((w, i) => (
              <li key={i}>
                <MD text={w} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Padrões que habilita</h4>
          <ul>
            {s.patterns.map((p, i) => (
              <li key={i}>
                <MD text={p} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="callout ds-pitfall">
        <strong>Pegadinha.</strong> <MD text={s.pitfall} />
      </div>
      <h4>Desafios pra praticar</h4>
      <div className="ds-exercises">
        {s.exercises.map((e, i) => (
          <a
            key={i}
            href={e.url}
            target="_blank"
            rel="noreferrer"
            className={`ds-ex diff-${e.difficulty.toLowerCase()}`}
          >
            <span className="ds-ex-name">{e.name}</span>
            <span className="ds-ex-diff">{e.difficulty}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/** /entrevista/fundamentos — revisão de estruturas de dados + Big-O + desafios. */
export function InterviewFundamentos() {
  return (
    <div>
      <h1>Estruturas &amp; Big-O</h1>
      <p className="lede">
        Sala de revisão das estruturas de dados pra entrevista — o que é cada uma, o custo de cada operação, quando
        usar, a pegadinha, e os desafios do LeetCode pra ir fazendo. No topo, um guia pra reaprender a calcular Big-O
        (tempo e espaço).
      </p>
      <section id="bigo">
        <h2>Big-O em 5 minutos</h2>
        <BigOGuide />
      </section>
      <section id="estruturas">
        <h2>As estruturas</h2>
        <div className="ds-grid">
          {structures.map((s) => (
            <StructureCard key={s.id} s={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportCard({ r }: { r: InterviewReport }) {
  return (
    <div className={`report-card result-${r.result}`}>
      <div className="report-head">
        <h3>{r.company}</h3>
        <span className="report-result">{r.resultLabel}</span>
      </div>
      <p className="muted">{r.summary}</p>
      <div className="report-loop">
        {r.loop.map((l, i) => (
          <span key={i} className="chip">
            {l}
          </span>
        ))}
      </div>
      <div className="report-rounds">
        {r.rounds.map((rd, i) => (
          <div key={i} className="report-round">
            <h4>{rd.type}</h4>
            <p className="muted">{rd.detail}</p>
            {rd.questions?.map((q, j) => (
              <div key={j} className="report-q">
                <span className="report-q-text">{q.q}</span>
                {q.tag ? (
                  q.link ? (
                    <Link to={q.link} className="chip mono">
                      {q.tag} →
                    </Link>
                  ) : (
                    <span className="chip mono">{q.tag}</span>
                  )
                ) : null}
              </div>
            ))}
            {rd.note ? (
              <div className="callout report-note">
                <strong>⚠ O que pegou.</strong> {rd.note}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <h4>Lições</h4>
      <ul className="report-lessons">
        {r.lessons.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

/** /entrevista/relatos — loops reais de entrevista destilados + lições. */
export function InterviewRelatos() {
  return (
    <div>
      <h1>Relatos de Entrevista</h1>
      <p className="lede">
        Loops reais destilados — as rodadas, as questões (linkadas pro que estudar aqui no lab) e as lições. Intel de
        verdade, não teoria.
      </p>
      <div className="hero-card report-synthesis">
        <h2>{crossLessons.title}</h2>
        <ul className="report-lessons">
          {crossLessons.points.map((p, i) => (
            <li key={i}>
              <MD text={p} />
            </li>
          ))}
        </ul>
      </div>
      <section className="pitfalls-card">
        <h2>{pitfalls.title}</h2>
        <p className="muted">{pitfalls.source}</p>
        <ol className="pitfalls-list">
          {pitfalls.items.map((p, i) => (
            <li key={i}>
              <strong>{p.erro}.</strong> {p.tip}
            </li>
          ))}
        </ol>
      </section>
      <h2>Os loops</h2>
      <div className="report-grid">
        {reports.map((r) => (
          <ReportCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
