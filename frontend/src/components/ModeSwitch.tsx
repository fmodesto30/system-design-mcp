import { Link, useLocation } from "react-router-dom";

/**
 * Alterna entre os dois "mundos" do app: a Base de Conhecimento de System Design
 * e o Modo Entrevista. Fica no topo de cada sidebar — é o que mantém os dois
 * produtos visualmente separados dentro do mesmo app.
 */
export function ModeSwitch() {
  const inInterview = useLocation().pathname.startsWith("/entrevista");
  return (
    <div className="mode-switch" role="tablist" aria-label="Modo do app">
      <Link to="/" className={inInterview ? "" : "active"} aria-selected={!inInterview}>
        Base de Conhecimento
      </Link>
      <Link to="/entrevista" className={inInterview ? "active" : ""} aria-selected={inInterview}>
        Modo Entrevista
      </Link>
    </div>
  );
}
