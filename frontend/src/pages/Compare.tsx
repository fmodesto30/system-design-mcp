import { Link } from "react-router-dom";
import { DiagramEmbed } from "../components/DiagramEmbeds";

interface Side {
  title: string;
  points: string[];
}
interface Comparison {
  id: string;
  title: string;
  left: Side;
  right: Side;
  diagrams: string[];
  patterns: string[];
  topics: string[];
}

// Resumos de comparação. O conteúdo aprofundado e com fonte vive nas páginas de padrão/tópico linkadas
// e em docs/tradeoffs.md. Aqui é o "mapa de decisão" lado a lado.
const COMPARISONS: Comparison[] = [
  {
    id: "transacional-vs-event-sourcing",
    title: "API Transacional vs Event Sourcing",
    left: {
      title: "API Transacional (msc-transactions-api)",
      points: [
        "Consistência forte: saldo e limite validados dentro da transação SQL.",
        "Rollback imediato em caso de violação de regra.",
        "Leitura = estado atual (mais simples de raciocinar).",
        "Menor complexidade operacional.",
      ],
    },
    right: {
      title: "Event Sourcing (event-source-distributed-ledger)",
      points: [
        "Eventos append-only no Event Store = trilha de auditoria natural.",
        "Estado reconstruído por replay; snapshots para acelerar.",
        "Read models especializados (ScyllaDB p/ saldo, MongoDB p/ extrato).",
        "Consistência eventual entre stores; exige idempotência e ordenação.",
      ],
    },
    diagrams: ["transactional-api-flow", "event-sourced-ledger-flow"],
    patterns: ["event-sourcing", "cqrs", "idempotent-consumer"],
    topics: ["event-sourcing", "cqrs", "cap-acid-base"],
  },
  {
    id: "api-gateway-vs-bff",
    title: "API Gateway vs Backend for Frontend",
    left: {
      title: "API Gateway",
      points: [
        "Porta de entrada única para muitos clientes.",
        "Preocupações transversais: auth, rate limit, roteamento, observabilidade.",
        "Genérico — não conhece a tela específica.",
      ],
    },
    right: {
      title: "BFF",
      points: [
        "Um backend por experiência/canal (web, mobile).",
        "API Composition: agrega vários serviços numa resposta sob medida.",
        "Molda o payload para o front; isola blast radius por canal.",
      ],
    },
    diagrams: ["api-gateway-vs-bff"],
    patterns: ["api-gateway", "backend-for-frontend", "api-composition"],
    topics: ["api-gateway", "bff"],
  },
  {
    id: "forte-vs-eventual",
    title: "Consistência Forte vs Eventual",
    left: {
      title: "Forte (ACID)",
      points: [
        "Toda leitura enxerga a última escrita.",
        "Coordenação/lock; mais fácil de provar correção.",
        "Escala e latência cobram o preço da coordenação.",
      ],
    },
    right: {
      title: "Eventual (BASE)",
      points: [
        "Alta disponibilidade; réplicas convergem com o tempo.",
        "Exige idempotência e garantias de ordem por agregado.",
        "Melhor throughput e escala horizontal.",
      ],
    },
    diagrams: ["read-model-update"],
    patterns: ["idempotent-consumer", "cqrs"],
    topics: ["cap-acid-base", "pacelc", "data-replication"],
  },
];

export function Compare() {
  return (
    <div>
      <h1>Comparar arquiteturas</h1>
      <p className="lede">Mapas de decisão lado a lado. Clique nos links para a explicação com fonte.</p>
      {COMPARISONS.map((c) => (
        <section key={c.id} className="comparison">
          <h2>{c.title}</h2>
          <div className="vs">
            <div className="vs-side left">
              <h3>{c.left.title}</h3>
              <ul>
                {c.left.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="vs-mid">vs</div>
            <div className="vs-side right">
              <h3>{c.right.title}</h3>
              <ul>
                {c.right.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
          {c.diagrams.map((d) => (
            <DiagramEmbed key={d} id={d} />
          ))}
          <div className="comparison-links">
            {c.patterns.map((p) => (
              <Link key={p} className="chip link" to={`/patterns/${p}`}>
                padrão: {p}
              </Link>
            ))}
            {c.topics.map((t) => (
              <Link key={t} className="chip link" to={`/topics/${t}`}>
                tópico: {t}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
