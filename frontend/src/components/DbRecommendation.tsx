import { Link } from "react-router-dom";
import type { DatabaseRecommendation } from "../api";
import { DB_NAMES, dbColor } from "../db";

/**
 * Callout de pré-sugestão de banco numa página de arquitetura. A referência sugere; o usuário
 * decide — daí o link "simular / trocar" leva ao decisor de bancos pré-semeado com esta sugestão.
 */
export function DbRecommendation({ rec }: { rec?: DatabaseRecommendation | null }) {
  if (!rec?.suggestedDbId) return null;
  const name = DB_NAMES[rec.suggestedDbId] ?? rec.suggestedDbId;
  return (
    <section className="db-rec" style={{ borderLeftColor: dbColor(rec.suggestedDbId) }}>
      <h2>Banco sugerido</h2>
      <p>
        <Link to={`/databases/${rec.suggestedDbId}`}>
          <strong>{name}</strong>
        </Link>{" "}
        — {rec.rationale}
      </p>
      <div className="chips-row">
        <Link className="chip link" to={`/databases/${rec.suggestedDbId}`}>
          ver banco
        </Link>
        <Link className="chip link" to={`/databases/builder?seed=${rec.suggestedDbId}`}>
          simular / trocar →
        </Link>
      </div>
    </section>
  );
}
