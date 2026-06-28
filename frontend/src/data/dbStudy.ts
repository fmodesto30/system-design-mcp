// Dado da página de estudo de Bancos de Dados AWS (espelha a página interativa do Felipe).
// Núcleo (preço, CAP, PACELC, failover, cor) vem da KB (databases.json + db.ts); as dimensões
// extras (matriz comparativa, backup/DR, cenários) foram geradas (workflow db-study-data) e
// curadas. GERADO por scratchpad/gen_dbstudy.cjs — editar aqui é OK.

export interface DbRow {
  id: string; name: string; category: string; engine: string; color: string;
  price: string; cap: string; pacelc: string; failover: string; storage: string;
  rating: number; instancia: string; modeloDados: string; consistencia: string; joins: string;
  transacoes: string; isolation: string; escala: string; multiAzCusto: string; indice: string;
  concorrencia: string; patterns: string;
}
export interface DbDrRow {
  id: string; name: string; color: string;
  rpo: string; rto: string; backtrackPitr: string; snapshots: string; crossRegion: string; destaque: string;
}
export interface DbScenario {
  id: string; title: string; stars: number; recommendedDb: string; summary: string;
  points: string[]; runnerUp?: { db: string; note: string };
}
export interface CompareDim { key: keyof DbRow; label: string; tip: string; }
export interface DrDim { key: keyof DbDrRow; label: string; tip: string; }

// Dimensões da tabela comparativa (linhas) + tooltip de cada (o "?" da print).
export const COMPARE_DIMS: CompareDim[] = [
  { key: 'modeloDados', label: 'Modelo de Dados', tip: 'Como os dados são estruturados: relacional (tabelas com schema) vs NoSQL (chave-valor / documento).' },
  { key: 'consistencia', label: 'Consistência', tip: 'ACID forte (transações garantidas) vs BASE/eventual (consistência relaxada em troca de disponibilidade).' },
  { key: 'joins', label: 'JOINs', tip: 'Suporte nativo a junção entre tabelas/coleções dentro do próprio banco.' },
  { key: 'transacoes', label: 'Transações', tip: 'Atomicidade multi-registro e o modelo de controle de concorrência.' },
  { key: 'isolation', label: 'Isolation Level', tip: 'Grau de isolamento entre transações concorrentes (Read Committed, Repeatable Read…).' },
  { key: 'escala', label: 'Escala', tip: 'Vertical (instância maior), horizontal (mais nós) ou auto-scaling.' },
  { key: 'multiAzCusto', label: 'Multi-AZ Custo', tip: 'Custo de redundância entre zonas de disponibilidade (incluso vs +100% standby).' },
  { key: 'failover', label: 'Failover', tip: 'Tempo de recuperação automática quando a instância primária cai.' },
  { key: 'indice', label: 'Índice', tip: 'Estrutura de índice padrão — B-Tree (leitura ordenada) vs LSM-Tree (escrita intensa).' },
  { key: 'storage', label: 'Storage / Arquitetura', tip: 'Como o armazenamento é replicado entre zonas.' },
  { key: 'concorrencia', label: 'Concorrência', tip: 'MVCC (versionamento sem lock de leitura) vs optimistic locking.' },
  { key: 'cap', label: 'Teorema CAP', tip: 'Sob partição de rede: CP prioriza consistência, AP prioriza disponibilidade.' },
  { key: 'pacelc', label: 'PACELC', tip: 'Extensão do CAP: mesmo SEM partição (Else), há trade-off entre Latência e Consistência.' },
  { key: 'patterns', label: 'Patterns Recomendados', tip: 'Padrões de design (DDD/microsserviços) que combinam com este banco.' },
];

export const DR_DIMS: DrDim[] = [
  { key: 'rpo', label: 'RPO', tip: 'Recovery Point Objective — quanto de dado você pode perder (janela desde o último ponto recuperável).' },
  { key: 'rto', label: 'RTO', tip: 'Recovery Time Objective — quanto tempo até voltar a operar após uma falha.' },
  { key: 'backtrackPitr', label: 'Backtrack / PITR', tip: 'Backtrack (rebobinar o cluster) e Point-in-Time Recovery (restaurar a um instante).' },
  { key: 'snapshots', label: 'Snapshots', tip: 'Backups pontuais automáticos e/ou manuais.' },
  { key: 'crossRegion', label: 'Cross-Region', tip: 'Replicação/DR entre regiões AWS.' },
  { key: 'destaque', label: 'Destaque', tip: 'O diferencial de resiliência deste banco.' },
];

export const dbRows: DbRow[] = [
  {
    "id": "aurora-postgresql",
    "name": "Aurora PostgreSQL",
    "category": "Relacional",
    "engine": "PostgreSQL (provisioned)",
    "color": "#4ade80",
    "price": "$539",
    "cap": "CP",
    "pacelc": "PC/EC",
    "failover": "<30s",
    "storage": "6 cópias, 3 AZs",
    "rating": 5,
    "instancia": "db.r7g.xlarge",
    "modeloDados": "Relacional (SQL)",
    "consistencia": "ACID Forte",
    "joins": "Sim (SQL completo)",
    "transacoes": "Multi-tabela, MVCC",
    "isolation": "Read Committed",
    "escala": "Vertical (scale-up)",
    "multiAzCusto": "Incluso no storage",
    "indice": "B-Tree",
    "concorrencia": "MVCC",
    "patterns": "Repository, Unit of Work, Outbox"
  },
  {
    "id": "aurora-serverless-v2",
    "name": "Aurora Serverless v2",
    "category": "Relacional",
    "engine": "PostgreSQL/MySQL (auto)",
    "color": "#22d3ee",
    "price": "$180–600",
    "cap": "CP",
    "pacelc": "PC/EC",
    "failover": "<30s",
    "storage": "6 cópias, 3 AZs",
    "rating": 5,
    "instancia": "Serverless 0.5–128 ACU",
    "modeloDados": "Relacional (SQL)",
    "consistencia": "ACID Forte",
    "joins": "Sim (SQL completo)",
    "transacoes": "Multi-tabela, MVCC",
    "isolation": "Read Committed",
    "escala": "Auto (0.5–128 ACU)",
    "multiAzCusto": "Incluso no storage",
    "indice": "B-Tree",
    "concorrencia": "MVCC",
    "patterns": "Repository, CQRS, Saga"
  },
  {
    "id": "rds-postgresql",
    "name": "RDS PostgreSQL",
    "category": "Relacional",
    "engine": "PostgreSQL (Multi-AZ)",
    "color": "#fbbf24",
    "price": "$872",
    "cap": "CP",
    "pacelc": "PC/EC",
    "failover": "60-120s",
    "storage": "2 AZs (Multi-AZ)",
    "rating": 4,
    "instancia": "db.r6g.xlarge",
    "modeloDados": "Relacional (SQL)",
    "consistencia": "ACID Forte",
    "joins": "Sim (SQL completo)",
    "transacoes": "Multi-tabela, MVCC",
    "isolation": "Read Committed",
    "escala": "Vertical (scale-up)",
    "multiAzCusto": "+100% (standby)",
    "indice": "B-Tree",
    "concorrencia": "MVCC",
    "patterns": "Event Store, Outbox, CDC"
  },
  {
    "id": "rds-mysql",
    "name": "RDS MySQL",
    "category": "Relacional",
    "engine": "MySQL (Multi-AZ)",
    "color": "#00bcd4",
    "price": "$872",
    "cap": "CP",
    "pacelc": "PC/EC",
    "failover": "60-120s",
    "storage": "2 AZs (Multi-AZ)",
    "rating": 4,
    "instancia": "db.r6g.xlarge",
    "modeloDados": "Relacional (SQL)",
    "consistencia": "ACID Forte",
    "joins": "Sim (SQL completo)",
    "transacoes": "Multi-tabela, MVCC",
    "isolation": "Repeatable Read",
    "escala": "Vertical (scale-up)",
    "multiAzCusto": "+100% (standby)",
    "indice": "B-Tree",
    "concorrencia": "MVCC",
    "patterns": "Idempotent Consumer, Batch"
  },
  {
    "id": "dynamodb",
    "name": "DynamoDB",
    "category": "NoSQL",
    "engine": "Key-Value / Document",
    "color": "#ff6b6b",
    "price": "$21",
    "cap": "AP",
    "pacelc": "PA/EL",
    "failover": "Automático",
    "storage": "3 AZs auto",
    "rating": 4,
    "instancia": "Serverless on-demand",
    "modeloDados": "NoSQL (Key-Value)",
    "consistencia": "BASE / Eventual",
    "joins": "Não suportado",
    "transacoes": "Limitado (25 itens)",
    "isolation": "Eventual/Strong",
    "escala": "Horizontal (auto)",
    "multiAzCusto": "Incluso",
    "indice": "LSM-Tree",
    "concorrencia": "Optimistic Lock",
    "patterns": "CQRS, Single-Table, GSI"
  },
  {
    "id": "documentdb",
    "name": "DocumentDB",
    "category": "NoSQL",
    "engine": "Document (Mongo 5.0)",
    "color": "#a78bfa",
    "price": "$350–500",
    "cap": "CP",
    "pacelc": "PC/EC",
    "failover": "<30s",
    "storage": "Réplica manual",
    "rating": 3,
    "instancia": "db.r6g.large",
    "modeloDados": "NoSQL (Document)",
    "consistencia": "ACID (por doc)",
    "joins": "$lookup (limitado)",
    "transacoes": "Multi-doc (4.0+)",
    "isolation": "Read Concern",
    "escala": "Vertical (scale-up)",
    "multiAzCusto": "+100% (réplica)",
    "indice": "B-Tree",
    "concorrencia": "Optimistic Lock",
    "patterns": "Read Model, CQRS, Migration"
  }
];

export const dbDr: DbDrRow[] = [
  {
    "id": "aurora-postgresql",
    "name": "Aurora PostgreSQL",
    "color": "#4ade80",
    "rpo": "~0s (storage 6 cópias síncronas)",
    "rto": "<30s (failover automático)",
    "backtrackPitr": "PITR 35d (contínuo p/ S3)",
    "snapshots": "Automático (1d) + manuais",
    "crossRegion": "Global Database (RPO ~1s, RTO <1min)",
    "destaque": "Storage distribuído em 3 AZs/6 cópias: perde 2 cópias sem perda de escrita"
  },
  {
    "id": "aurora-serverless-v2",
    "name": "Aurora Serverless v2",
    "color": "#22d3ee",
    "rpo": "~0s (mesmo storage Aurora)",
    "rto": "<30s (failover automático)",
    "backtrackPitr": "PITR 35d (contínuo)",
    "snapshots": "Automático + manuais",
    "crossRegion": "Global Database (RPO ~1s)",
    "destaque": "DR Aurora completo escalando a zero-pico: paga só ACU usado"
  },
  {
    "id": "rds-postgresql",
    "name": "RDS PostgreSQL",
    "color": "#fbbf24",
    "rpo": "~0s (standby síncrono Multi-AZ)",
    "rto": "60-120s (failover Multi-AZ)",
    "backtrackPitr": "PITR 35d (replay do WAL)",
    "snapshots": "Automático (até 35d) + manuais",
    "crossRegion": "Read Replica cross-region (async)",
    "destaque": "WAL/PITR + Debezium: o próprio log de recuperação alimenta o CDC"
  },
  {
    "id": "rds-mysql",
    "name": "RDS MySQL",
    "color": "#00bcd4",
    "rpo": "~0s (standby síncrono Multi-AZ)",
    "rto": "60-120s (failover Multi-AZ)",
    "backtrackPitr": "PITR 35d (binlog replay)",
    "snapshots": "Automático (até 35d) + manuais",
    "crossRegion": "Read Replica cross-region (async)",
    "destaque": "Restore a qualquer segundo via binlog: re-roda lote idempotente sem duplicar"
  },
  {
    "id": "dynamodb",
    "name": "DynamoDB",
    "color": "#ff6b6b",
    "rpo": "~5min (PITR contínuo)",
    "rto": "Automático (transparente, sem failover)",
    "backtrackPitr": "PITR 35d (restore p/ nova tabela)",
    "snapshots": "On-Demand (sem limite de retenção)",
    "crossRegion": "Global Tables (ativo-ativo, multi-região)",
    "destaque": "Global Tables: DR nativo multi-master, replicação sem servidor de standby"
  },
  {
    "id": "documentdb",
    "name": "DocumentDB",
    "color": "#a78bfa",
    "rpo": "~0s (storage 6 cópias / 3 AZs)",
    "rto": "<30s (failover p/ réplica)",
    "backtrackPitr": "PITR 35d (contínuo p/ S3)",
    "snapshots": "Automático (1-35d) + manuais",
    "crossRegion": "Global Clusters (RPO ~1s, até 5 regiões)",
    "destaque": "Storage separado do compute: réplica manual promove em <30s sem copiar dados"
  }
];

export const dbScenarios: DbScenario[] = [
  {
    "id": "kafka-ms",
    "title": "Kafka + Microsserviços (espelho do legado DB2)",
    "stars": 5,
    "recommendedDb": "aurora-postgresql",
    "summary": "Sistema transacional crítico com ledger de consistência forte, carga inicial de ~75M registros e exigência de 3 AZs. Aurora PostgreSQL provisionada (db.r7g.xlarge, Graviton3) entrega ACID forte, failover <30s e as 3 AZs já inclusas no preço, com o melhor custo/AZ entre os relacionais.",
    "points": [
      "Custo fixo previsível ($539/mês na db.r7g.xlarge ARM Graviton3), ideal p/ workload transacional constante do espelho do legado",
      "3 AZs com 6 cópias do storage JÁ INCLUSAS no preço — atende o requisito de 3 AZs obrigatórias sem add-on",
      "Melhor custo/AZ entre os relacionais: $539 por 3 AZs vs RDS a $872 por 2 AZs",
      "Consistência forte CP / PACELC PC-EC: serve saldo/limite/ledger onde divergência é defeito",
      "PostgreSQL pleno suporta event-sourcing e o modelo DDD dos microsserviços (JSONB, CTEs, constraints)",
      "Failover <30s reduz janela de indisponibilidade na carga inicial massiva de ~75M registros"
    ],
    "runnerUp": {
      "db": "rds-postgresql",
      "note": "PostgreSQL puro também serve event store/outbox (WAL+Debezium), mas custa mais ($872) e cobre só 2 AZs — não atende as 3 AZs obrigatórias e tem failover mais lento (60-120s)"
    }
  },
  {
    "id": "bond-ddd",
    "title": "Bond Management (DDD, domínio novo)",
    "stars": 5,
    "recommendedDb": "aurora-serverless-v2",
    "summary": "Domínio novo de DDD sem pico de carga conhecido, que precisa de ACID e JOINs mas tem tráfego variável/intermitente. Aurora Serverless v2 escala por ACU-hora (0.5–128 ACU), cobra só o que usa e já inclui 3 AZs — encaixe natural pra carga imprevisível sem provisionar pico.",
    "points": [
      "Paga por ACU-hora consumida ($180–600/mês) em vez de instância fixa — não desperdiça em domínio novo sem baseline",
      "Mantém ACID + JOINs relacionais (PostgreSQL/MySQL), exigência do modelo de domínio rico de DDD",
      "Auto-scale 0.5–128 ACU absorve picos desconhecidos sem reprovisionar nem downtime",
      "Ideal pra carga variável/intermitente: encolhe no vale, expande no pico automaticamente",
      "3 AZs já inclusas + failover <30s sem custo extra de alta disponibilidade",
      "CP / PACELC PC-EC preserva consistência forte enquanto o padrão de acesso ainda está sendo descoberto"
    ],
    "runnerUp": {
      "db": "dynamodb",
      "note": "Se o domínio evoluir pra key-value sem JOINs exigindo latência <10ms e access patterns fixos (PK+GSI), DynamoDB ($21/mês, AP) passa a ser o encaixe — mas hoje a necessidade de ACID+JOINs o desclassifica"
    }
  }
];
