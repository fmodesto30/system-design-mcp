import { Link } from "react-router-dom";

/** A row of links to related entities (patterns/topics/diagrams), each routing to its detail page. */
export function LinkChips({ label, base, ids }: { label: string; base: string; ids: string[] }) {
  if (!ids?.length) return null;
  return (
    <div className="chips-row">
      <span className="chips-label">{label}</span>
      {ids.map((id) => (
        <Link key={id} className="chip link" to={`${base}/${id}`}>
          {id}
        </Link>
      ))}
    </div>
  );
}

/** Plain non-link tags. */
export function TagChips({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="chips-row">
      <span className="chips-label">{label}</span>
      {items.map((it, i) => (
        <span key={i} className="chip">
          {it}
        </span>
      ))}
    </div>
  );
}
