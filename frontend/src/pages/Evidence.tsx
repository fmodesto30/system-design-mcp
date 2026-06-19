import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { SourceRefList } from "../components/SourceRefList";

export function EvidencePage() {
  const state = useAsync(() => api.evidence(), []);
  return (
    <div>
      <h1>Evidências e fontes</h1>
      <p className="lede">
        A matriz “afirmação → evidência → fonte”. É o que sustenta a regra do Lab: nada é afirmado sem apontar
        para o workbook, um repositório ou a referência conceitual.
      </p>
      <Async state={state}>
        {(list) => (
          <div className="evidence-list">
            {list.map((e) => (
              <div key={e.id} className="evidence-row">
                <div className="evidence-claim">
                  <span className="evidence-id">{e.id}</span>
                  <strong>{e.claim}</strong>
                </div>
                <p className="evidence-text">{e.evidence}</p>
                <SourceRefList refs={e.sourceRefs} />
              </div>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
