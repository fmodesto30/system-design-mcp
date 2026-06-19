import { NavLink, Outlet, Link } from "react-router-dom";

const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/topics", label: "Tópicos" },
  { to: "/patterns", label: "Padrões" },
  { to: "/flows", label: "Fluxos" },
  { to: "/diagrams", label: "Diagramas" },
  { to: "/interview", label: "Modo Entrevista" },
  { to: "/compare", label: "Comparar" },
  { to: "/evidence", label: "Evidências" },
];

export function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">SD</span>
          <span className="brand-text">System Design<br />Specialist Lab</span>
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
