import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="app">
      <header className="mobile-bar">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Abrir menu">
          ☰
        </button>
        <span className="mobile-title">Modo Entrevista</span>
      </header>
      {open ? <div className="drawer-overlay" onClick={close} /> : null}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <ModeSwitch />
        <Link to="/entrevista" className="brand" onClick={close}>
          <span className="brand-mark interview">🎯</span>
          <span className="brand-text">
            Modo
            <br />
            Entrevista
          </span>
        </Link>
        <nav onClick={close}>
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
