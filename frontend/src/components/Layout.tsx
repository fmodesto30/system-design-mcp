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
  return (
    <div className="app">
      <aside className="sidebar">
        <ModeSwitch />
        <Link to="/" className="brand">
          <span className="brand-mark">SD</span>
          <span className="brand-text">
            System Design
            <br />
            Specialist Lab
          </span>
        </Link>
        <nav>
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
