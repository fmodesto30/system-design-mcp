// Typed client for the BFF. URLs are relative; in dev Vite proxies /api to the BFF (see vite.config.ts).

export interface SourceRef {
  kind: "pdf" | "repo" | "reference";
  source: string;
  locator: string;
  note?: string | null;
  url?: string | null;
}

export interface TradeOff {
  dimension: string;
  pro: string;
  con: string;
}

export interface DatabaseRecommendation {
  suggestedDbId: string;
  level?: string;
  rationale: string;
}

export interface DatabaseSummary {
  id: string;
  name: string;
  category: string;
  engine: string;
  summary: string;
  priceMonthly: string;
  capTheorem: string;
}

export interface Database extends DatabaseSummary {
  priceAnnual: string;
  pacelc: string;
  failover: string;
  azs: string;
  whenToUse: string[];
  whenToAvoid: string[];
  tradeOffs: TradeOff[];
  relatedPatterns: string[];
  relatedTopics: string[];
  diagrams: string[];
  sourceRefs: SourceRef[];
}

export interface TopicSummary {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface Topic extends TopicSummary {
  detailedExplanation: string;
  relatedTopics: string[];
  relatedPatterns: string[];
  tradeOffs: TradeOff[];
  interviewAngle: string;
  example: string;
  diagrams: string[];
  databaseRecommendation?: DatabaseRecommendation;
  sourceRefs: SourceRef[];
}

export interface PatternSummary {
  id: string;
  name: string;
  category: string;
  problem: string;
}

export interface Pattern extends PatternSummary {
  solution: string;
  whenToUse: string[];
  whenToAvoid: string[];
  exampleFromRepo: string;
  financialExample: string;
  tradeOffs: TradeOff[];
  relatedPatterns: string[];
  interviewAngle: string;
  diagrams: string[];
  databaseRecommendation?: DatabaseRecommendation;
  sourceRefs: SourceRef[];
}

export interface FlowStep {
  order: number;
  actor: string;
  action: string;
  note?: string | null;
}

export interface FlowSummary {
  id: string;
  title: string;
  summary: string;
}

export interface Flow extends FlowSummary {
  components: string[];
  steps: FlowStep[];
  relatedPatterns: string[];
  diagram?: string | null;
  databaseRecommendation?: DatabaseRecommendation;
  sourceRefs: SourceRef[];
}

export interface QuestionSummary {
  id: string;
  question: string;
  difficulty: string;
}

export interface InterviewQuestion extends QuestionSummary {
  shortAnswer: string;
  detailedAnswer: string;
  mentalModel: string;
  patterns: string[];
  risks: string[];
  tradeOffs: TradeOff[];
  repoExample: string;
  howToAnswerInInterview: string;
  relatedTopics: string[];
  diagrams: string[];
  sourceRefs: SourceRef[];
}

export interface DiagramSummary {
  id: string;
  title: string;
  description: string;
}

export interface Diagram extends DiagramSummary {
  mermaid: string;
  relatedTopics: string[];
  relatedPatterns: string[];
  sourceRefs: SourceRef[];
}

export interface Evidence {
  id: string;
  claim: string;
  evidence: string;
  relatedTopics: string[];
  relatedPatterns: string[];
  sourceRefs: SourceRef[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  framing?: string | null;
  kind: "term" | "comparison";
  definition: string;
  backendAnalogy: string;
  pitfall: string;
  sourceRefs: SourceRef[];
}

export interface Stats {
  topics: number;
  patterns: number;
  flows: number;
  interviewQuestions: number;
  diagrams: number;
  evidence: number;
  aiGlossary: number;
  databases: number;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} em ${path}`);
  }
  return (await res.json()) as T;
}

export const api = {
  stats: () => get<Stats>("/api/meta/stats"),
  topics: () => get<TopicSummary[]>("/api/topics"),
  topic: (id: string) => get<Topic>(`/api/topics/${id}`),
  patterns: () => get<PatternSummary[]>("/api/patterns"),
  pattern: (id: string) => get<Pattern>(`/api/patterns/${id}`),
  flows: () => get<FlowSummary[]>("/api/flows"),
  flow: (id: string) => get<Flow>(`/api/flows/${id}`),
  questions: () => get<QuestionSummary[]>("/api/interview/questions"),
  question: (id: string) => get<InterviewQuestion>(`/api/interview/questions/${id}`),
  diagrams: () => get<DiagramSummary[]>("/api/diagrams"),
  diagram: (id: string) => get<Diagram>(`/api/diagrams/${id}`),
  evidence: () => get<Evidence[]>("/api/evidence"),
  aiGlossary: () => get<GlossaryEntry[]>("/api/ai-glossary"),
  databases: () => get<DatabaseSummary[]>("/api/databases"),
  database: (id: string) => get<Database>(`/api/databases/${id}`),
};
