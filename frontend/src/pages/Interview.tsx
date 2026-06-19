import { useState } from "react";
import { api, type QuestionSummary } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Markdown } from "../components/Markdown";
import { SourceRefList } from "../components/SourceRefList";
import { TradeOffTable } from "../components/TradeOffTable";
import { LinkChips, TagChips } from "../components/Chips";

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

export function Interview() {
  const state = useAsync(() => api.questions(), []);
  return (
    <div>
      <h1>Modo Entrevista</h1>
      <p className="lede">
        Perguntas de System Design no estilo arquiteto/staff. Clique para ver resposta curta, detalhada, desenho
        mental e como responder. Veja também o <a href="#" onClick={(e) => e.preventDefault()}>guia</a> em{" "}
        <code>docs/interview-guide.md</code>.
      </p>
      <Async state={state}>
        {(list) => (
          <div className="qa-list">
            {list.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
