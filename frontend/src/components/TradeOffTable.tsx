import type { TradeOff } from "../api";

/** Renders trade-offs as a "dimension / ganho / custo" table. */
export function TradeOffTable({ tradeOffs }: { tradeOffs: TradeOff[] }) {
  if (!tradeOffs?.length) return null;
  return (
    <table className="tradeoffs">
      <thead>
        <tr>
          <th>Dimensão</th>
          <th>Ganho</th>
          <th>Custo</th>
        </tr>
      </thead>
      <tbody>
        {tradeOffs.map((t, i) => (
          <tr key={i}>
            <td className="dim">{t.dimension}</td>
            <td className="pro">{t.pro}</td>
            <td className="con">{t.con}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
