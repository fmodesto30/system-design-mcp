// Identidade visual dos bancos (espelha as cores do estudo de decisão) + nomes para os callouts.
// O dado canônico/fonteado vive na KB (databases.json); aqui é só apresentação.
export const DB_COLORS: Record<string, string> = {
  "aurora-postgresql": "#4ade80",
  "aurora-serverless-v2": "#22d3ee",
  "rds-postgresql": "#fbbf24",
  "rds-mysql": "#00bcd4",
  "dynamodb": "#ff6b6b",
  "documentdb": "#a78bfa",
};

export const DB_NAMES: Record<string, string> = {
  "aurora-postgresql": "Aurora PostgreSQL",
  "aurora-serverless-v2": "Aurora Serverless v2",
  "rds-postgresql": "RDS PostgreSQL",
  "rds-mysql": "RDS MySQL",
  "dynamodb": "DynamoDB",
  "documentdb": "DocumentDB",
};

export function dbColor(id: string): string {
  return DB_COLORS[id] ?? "var(--accent)";
}
