import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DB_COLORS, DB_NAMES } from "../db";

// Os 5 bancos pontuados pelo decisor (espelha o estudo de decisão). RDS MySQL fica no catálogo
// mas o decisor pontua a linha relacional via RDS PostgreSQL.
const SCORER = ["aurora-postgresql", "aurora-serverless-v2", "rds-postgresql", "dynamodb", "documentdb"] as const;
type DbId = (typeof SCORER)[number];

type Acid = "sim" | "nao";
type Joins = "sim" | "nao";
type Workload = "estavel" | "variavel" | "alta";
type Latency = "sim" | "nao";
type Cost = "minimo" | "moderado" | "enterprise";

interface Sel {
  acid: Acid;
  joins: Joins;
  workload: Workload;
  latency: Latency;
  cost: Cost;
}

const DEFAULTS: Sel = { acid: "sim", joins: "sim", workload: "estavel", latency: "nao", cost: "moderado" };

const PRICE: Record<DbId, string> = {
  "aurora-postgresql": "$539/mês",
  "aurora-serverless-v2": "$180–600/mês",
  "rds-postgresql": "$872/mês",
  "dynamodb": "$21/mês",
  "documentdb": "$350–500/mês",
};

// Pré-seed por banco sugerido (vindo da pré-sugestão de uma arquitetura via ?seed=).
const SEED: Record<string, Sel> = {
  "aurora-postgresql": { acid: "sim", joins: "sim", workload: "estavel", latency: "nao", cost: "enterprise" },
  "aurora-serverless-v2": { acid: "sim", joins: "sim", workload: "variavel", latency: "nao", cost: "moderado" },
  "rds-postgresql": { acid: "sim", joins: "sim", workload: "estavel", latency: "nao", cost: "moderado" },
  "rds-mysql": { acid: "sim", joins: "sim", workload: "estavel", latency: "nao", cost: "moderado" },
  "dynamodb": { acid: "nao", joins: "nao", workload: "alta", latency: "sim", cost: "minimo" },
  "documentdb": { acid: "nao", joins: "nao", workload: "variavel", latency: "nao", cost: "moderado" },
};

function score(s: Sel): Record<DbId, number> {
  const r: Record<DbId, number> = {
    "aurora-postgresql": 0,
    "aurora-serverless-v2": 0,
    "rds-postgresql": 0,
    "dynamodb": 0,
    "documentdb": 0,
  };
  if (s.acid === "sim") {
    r["aurora-postgresql"] += 3; r["aurora-serverless-v2"] += 3; r["rds-postgresql"] += 3; r["documentdb"] += 1;
  } else {
    r["dynamodb"] += 3; r["documentdb"] += 2;
  }
  if (s.joins === "sim") {
    r["aurora-postgresql"] += 3; r["aurora-serverless-v2"] += 3; r["rds-postgresql"] += 3; r["dynamodb"] -= 2;
  } else {
    r["dynamodb"] += 2; r["documentdb"] += 2;
  }
  if (s.workload === "estavel") {
    r["aurora-postgresql"] += 2; r["rds-postgresql"] += 2;
  } else if (s.workload === "variavel") {
    r["aurora-serverless-v2"] += 3; r["dynamodb"] += 2;
  } else {
    r["dynamodb"] += 3; r["aurora-serverless-v2"] += 1;
  }
  if (s.latency === "sim") {
    r["dynamodb"] += 3; r["aurora-postgresql"] += 1;
  } else {
    r["aurora-postgresql"] += 1; r["rds-postgresql"] += 1; r["aurora-serverless-v2"] += 1;
  }
  if (s.cost === "minimo") {
    r["dynamodb"] += 3;
  } else if (s.cost === "moderado") {
    r["aurora-postgresql"] += 2; r["aurora-serverless-v2"] += 2;
  } else {
    r["aurora-postgresql"] += 1; r["rds-postgresql"] += 1;
  }
  return r;
}

const RATIONALE: Record<DbId, string> = {
  "aurora-postgresql": "ACID + JOINs, 3 AZs inclusas e o melhor custo/AZ entre os relacionais.",
  "aurora-serverless-v2": "ACID + JOINs pagando pelo uso — ideal para carga variável.",
  "rds-postgresql": "PostgreSQL puro (WAL, índices ricos) para event store / outbox / CDC.",
  "dynamodb": "Latência <10ms, escala horizontal e custo mínimo — sem JOINs.",
  "documentdb": "Documentos de schema flexível, mais consistente que key-value puro.",
};

function Q<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { v: T; t: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="builder-group">
      <h3>{label}</h3>
      <div className="button-group">
        {options.map((o) => (
          <button key={o.v} className={value === o.v ? "active" : ""} onClick={() => onChange(o.v)}>
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DatabaseBuilder() {
  const [params] = useSearchParams();
  const seed = params.get("seed");
  const [sel, setSel] = useState<Sel>(seed && SEED[seed] ? SEED[seed] : DEFAULTS);

  const scores = score(sel);
  const ranked = [...SCORER].sort((a, b) => scores[b] - scores[a]);
  const winner = ranked[0];
  const max = Math.max(1, scores[winner]);

  const set = <K extends keyof Sel>(k: K, v: Sel[K]) => setSel((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <h1>Decisor de Banco de Dados</h1>
      <p className="lede">
        Responda às perguntas do seu caso e veja o banco que melhor encaixa — o placar recalcula ao
        vivo. É um mapa de decisão, não uma regra: brinque com os trade-offs.
        {seed && SEED[seed] ? (
          <>
            {" "}Pré-carregado a partir da sugestão de <strong>{DB_NAMES[seed] ?? seed}</strong>.
          </>
        ) : null}
      </p>

      <div className="builder">
        <div className="builder-questions">
          <Q
            label="Precisa de ACID (consistência forte)?"
            value={sel.acid}
            onChange={(v) => set("acid", v)}
            options={[{ v: "sim", t: "Sim (PC/EC)" }, { v: "nao", t: "Não (PA/EL)" }]}
          />
          <Q
            label="Precisa de JOINs / SQL relacional?"
            value={sel.joins}
            onChange={(v) => set("joins", v)}
            options={[{ v: "sim", t: "Sim" }, { v: "nao", t: "Não" }]}
          />
          <Q
            label="Workload"
            value={sel.workload}
            onChange={(v) => set("workload", v)}
            options={[
              { v: "estavel", t: "Estável" },
              { v: "variavel", t: "Variável" },
              { v: "alta", t: "Alta / picos" },
            ]}
          />
          <Q
            label="Latência < 10ms?"
            value={sel.latency}
            onChange={(v) => set("latency", v)}
            options={[{ v: "sim", t: "Sim" }, { v: "nao", t: "Não" }]}
          />
          <Q
            label="Prioridade de custo"
            value={sel.cost}
            onChange={(v) => set("cost", v)}
            options={[
              { v: "minimo", t: "Mínimo" },
              { v: "moderado", t: "Moderado" },
              { v: "enterprise", t: "Enterprise" },
            ]}
          />
        </div>

        <aside className="builder-result">
          <div className="builder-winner" style={{ borderColor: DB_COLORS[winner] }}>
            <span className="badge">★ Recomendado</span>
            <h2 style={{ borderColor: DB_COLORS[winner] }}>
              <Link to={`/databases/${winner}`}>{DB_NAMES[winner]}</Link>
            </h2>
            <p className="db-price">{PRICE[winner]}</p>
            <p className="muted">{RATIONALE[winner]}</p>
          </div>
          <div className="builder-bars">
            {ranked.map((id) => (
              <div key={id} className="bar-row">
                <Link className="bar-label" to={`/databases/${id}`}>
                  {DB_NAMES[id]}
                </Link>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.max(0, (scores[id] / max) * 100)}%`,
                      background: DB_COLORS[id],
                    }}
                  />
                </div>
                <span className="bar-score">{scores[id]}</span>
              </div>
            ))}
          </div>
          <p className="muted builder-foot">
            Catálogo completo e fonteado em <Link to="/databases">Bancos de Dados</Link>.
          </p>
        </aside>
      </div>
    </div>
  );
}
