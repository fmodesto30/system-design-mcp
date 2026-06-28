import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { ModeSwitch } from "./ModeSwitch";

const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/topics", label: "Tópicos" },
  { to: "/patterns", label: "Padrões" },
  { to: "/flows", label: "Fluxos" },
  { to: "/diagrams", label: "Diagramas" },
  { to: "/databases", label: "Bancos de Dados" },
  { to: "/compare", label: "Comparar" },
  { to: "/evidence", label: "Evidências" },
  { to: "/ai-agents", label: "IA & Agentes" },
];

/** Layout da Base de Conhecimento de System Design (o produto original). */
export function Layout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="app">
      <header className="mobile-bar">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Abrir menu">
          ☰
        </button>
        <span className="mobile-title">System Design Lab</span>
      </header>
      {open ? <div className="drawer-overlay" onClick={close} /> : null}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <ModeSwitch />
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">SD</span>
          <span className="brand-text">
            System Design
            <br />
            Specialist Lab
          </span>
        </Link>
        <nav onClick={close}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          Conteúdo ancorado no <em>System Design Workbook</em> + repos de referência. Sem LLM em runtime.
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
