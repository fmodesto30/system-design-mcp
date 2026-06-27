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
