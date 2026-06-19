import type { AsyncState } from "../hooks";
import type { ReactNode } from "react";

/** Uniform loading/error wrapper for async views. */
export function Async<T>({ state, children }: { state: AsyncState<T>; children: (data: T) => ReactNode }) {
  if (state.loading) return <div className="state loading">Carregando…</div>;
  if (state.error)
    return (
      <div className="state error">
        <strong>Erro:</strong> {state.error}
        <p className="hint">O BFF está rodando em :8080? (ver docs/runbook.md)</p>
      </div>
    );
  if (state.data === undefined) return <div className="state">Sem dados.</div>;
  return <>{children(state.data)}</>;
}
