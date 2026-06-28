import { NavLink, Outlet, Link } from "react-router-dom";
import { ModeSwitch } from "./ModeSwitch";

const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: "/entrevista", label: "Visão geral", end: true },
  { to: "/entrevista/system-design", label: "System Design" },
  { to: "/entrevista/dsa", label: "DSA" },
  { to: "/entrevista/fundamentos", label: "Estruturas & Big-O" },
  { to: "/entrevista/comportamental", label: "Comportamental & Estratégia" },
  { to: "/entrevista/relatos", label: "Relatos de Entrevista" },
];

/** Layout próprio do Modo Entrevista — sidebar e identidade separadas da Base de Conhecimento. */
export function InterviewLayout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <ModeSwitch />
        <Link to="/entrevista" className="brand">
          <span className="brand-mark interview">🎯</span>
          <span className="brand-text">
            Modo
            <br />
            Entrevista
          </span>
        </Link>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          Preparação para entrevista de SWE. As perguntas de System Design vêm da base de conhecimento (com fontes).
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
