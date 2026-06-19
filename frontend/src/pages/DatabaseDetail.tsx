import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { SourceRefList } from "../components/SourceRefList";
import { TradeOffTable } from "../components/TradeOffTable";
import { LinkChips } from "../components/Chips";
import { dbColor } from "../db";

function Bullets({ title, items, kind }: { title: string; items: string[]; kind: string }) {
  if (!items?.length) return null;
  return (
    <section className={`bullets ${kind}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </section>
  );
}

function Spec({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div className="db-spec">
      <span className="db-spec-k">{k}</span>
      <span className="db-spec-v">{v}</span>
    </div>
  );
}

export function DatabaseDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => api.database(id), [id]);
  return (
    <Async state={state}>
      {(d) => (
        <article className="detail">
          <span className="badge" style={{ borderColor: dbColor(d.id), color: dbColor(d.id) }}>
            {d.category}
          </span>
          <h1>{d.name}</h1>
          <p className="lede">{d.summary}</p>

          <div className="db-specs">
            <Spec k="Preço/mês" v={d.priceMonthly} />
            <Spec k="Anual" v={d.priceAnnual} />
            <Spec k="CAP" v={d.capTheorem} />
            <Spec k="PACELC" v={d.pacelc} />
            <Spec k="Failover" v={d.failover} />
            <Spec k="AZs" v={d.azs} />
            <Spec k="Engine" v={d.engine} />
          </div>

          <div className="two-col">
            <Bullets title="Quando usar" items={d.whenToUse} kind="use" />
            <Bullets title="Quando evitar" items={d.whenToAvoid} kind="avoid" />
          </div>

          {d.tradeOffs.length > 0 && (
            <section>
              <h2>Trade-offs</h2>
              <TradeOffTable tradeOffs={d.tradeOffs} />
            </section>
          )}

          <p style={{ margin: "16px 0" }}>
            <Link className="chip link" to={`/databases/builder?seed=${d.id}`}>
              abrir no decisor de bancos →
            </Link>
          </p>

          <LinkChips label="Padrões relacionados" base="/patterns" ids={d.relatedPatterns} />
          <LinkChips label="Tópicos relacionados" base="/topics" ids={d.relatedTopics} />
          <SourceRefList refs={d.sourceRefs} />
        </article>
      )}
    </Async>
  );
}
