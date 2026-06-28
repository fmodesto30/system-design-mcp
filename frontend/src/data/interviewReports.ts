// Relatos reais de entrevista, destilados em estrutura navegável (loop → rodadas →
// questões mapeadas pro que estudar no lab → lições). Curado à mão a partir de
// relatos que o Felipe coleta. Itens podem usar **negrito** (renderizado inline).

export interface ReportQuestion {
  q: string;
  tag?: string; // padrão/estrutura que a questão exercita
  link?: string; // rota no lab pra estudar isso
}
export interface ReportRound {
  type: string;
  detail: string;
  questions?: ReportQuestion[];
  note?: string; // "o que pegou" — a virada da rodada
}
export type ReportResult = "passou" | "reprovado" | "parcial" | "info";
export interface InterviewReport {
  id: string;
  company: string;
  result: ReportResult;
  resultLabel: string;
  summary: string;
  loop: string[];
  rounds: ReportRound[];
  lessons: string[];
}

export const crossLessons = {
  title: "Padrões que se repetem (lê isto primeiro)",
  points: [
    "**A barra de DSA é LeetCode médio.** Microsoft: “iguais a LC mediums” e na hard nem pediram código. Google: 1 easy + 1 medium. Não persiga hard — domine os médios.",
    "**O ritual é sempre o mesmo:** ler → clarificar → pensar em voz alta → explicar a melhor abordagem → codar → **escrever a complexidade tempo/espaço**. Os dois cobram isso explicitamente.",
    "**Grafos, árvores e DP dominam.** Google diz “paramount”; Microsoft teve grafo (Dijkstra) + Union-Find logo no OA. Priorize esses na revisão.",
    "**Design (HLD/LLD): decifrar a intenção do entrevistador > resolver genérico.** Foi exatamente o que reprovou no Microsoft. Gaste tempo em requisitos e leia a reação.",
    "**Mocks + prática cronometrada** aparecem nos dois (20 min pra médio, 35 pra hard). Explicar desenhando leva jeito — treine em voz alta.",
  ],
};

export const reports: InterviewReport[] = [
  {
    id: "microsoft-loop",
    company: "Microsoft",
    result: "parcial",
    resultLabel: "Reprovado no HLD — não avançou pro AA",
    summary:
      "Loop completo (OA → DSA → LLD → HLD → AA). Positivo em OA, DSA e LLD; reprovado no HLD — e não por erro técnico, mas por não decifrar a tempo o que o entrevistador queria.",
    loop: ["OA", "DSA", "LLD", "HLD", "AA"],
    rounds: [
      {
        type: "OA — Online Assessment",
        detail: "2 médios no HackerRank, 60 min. Resolveu em ~15 e ~25 min; 15 testes visíveis passando.",
        questions: [
          { q: "Menor ciclo direcionado para cada nó em grafo ponderado", tag: "Grafo / Dijkstra", link: "/entrevista/fundamentos" },
          { q: "Tamanho do cluster de servidores conectados por fator comum (GCD > 1)", tag: "Union-Find / DSU", link: "/entrevista/fundamentos" },
        ],
      },
      {
        type: "DSA round",
        detail: "Intro + discussão de stack + um desafio que o time enfrentou. Depois 2 questões.",
        questions: [
          { q: "Maior subarray com diferença máxima = k", tag: "Sliding Window", link: "/entrevista/dsa" },
          { q: "Contar submatrizes com soma = k (hard; não pediram código, só a abordagem ótima)", tag: "Prefix sum + Hash", link: "/entrevista/dsa" },
        ],
      },
      {
        type: "LLD",
        detail:
          "Design de um In-Memory File System. APIs create/delete/ls/mkdir; codou 3. A estrutura por baixo = Trie (modela diretórios aninhados). Tocou em Composite, Factory e Singleton. Foi bem.",
        questions: [{ q: "In-Memory File System → estrutura por baixo", tag: "Trie", link: "/entrevista/fundamentos" }],
      },
      {
        type: "HLD",
        detail:
          "Design de um notification service (Email + SMS). Desenhou o sistema, APIs, filas, workers, retries — tudo correto.",
        note:
          "O entrevistador disse que o desenho genérico estava ok, mas queria foco nos TIPOS de notificação (Urgent / Promotional / Transactional). Ele não decifrou isso a tempo — e foi reprovado aqui.",
      },
    ],
    lessons: [
      "HLD não é só resolver — é entregar o que o entrevistador procura NAQUELE problema.",
      "Tempo em requirement gathering se paga: evita design desnecessário.",
      "Leia a reação do entrevistador. Se ele não engaja, você está otimizando a coisa errada.",
      "Faça mocks com pares/seniores: explicar desenhando boxes leva tempo pra pegar o jeito.",
    ],
  },
  {
    id: "google-2026-phone",
    company: "Google (2026)",
    result: "info",
    resultLabel: "Atualização do loop — rounds eliminatórios novos",
    summary:
      "O phone screen único virou 2 telas ELIMINATÓRIAS (DSA + Googleyness), e a nota delas entra no packet — passaram a valer tanto quanto os on-sites. Antes: 1 screen e você garantia 4 entrevistas; isso acabou.",
    loop: ["DSA Phone Screen", "Googleyness Phone Screen", "On-sites"],
    rounds: [
      {
        type: "DSA Phone Screen (eliminatório)",
        detail:
          "Intro 1-2 min (Google não pergunta stack/resume) → Coding 35-40 min num Google Doc → suas perguntas 2-5 min. Dificuldade: 1 easy + 1 medium, ou 1 medium + 0-2 follow-ups.",
        questions: [
          {
            q: "Fluxo esperado: ler → clarificar → pensar alto → explicar a melhor abordagem → codar só o helper → justificar edge cases → escrever complexidade tempo/espaço → follow-up ou 2ª questão",
            tag: "Ritual da rodada",
            link: "/entrevista/dsa",
          },
        ],
      },
      {
        type: "Googleyness Phone Screen (eliminatório)",
        detail: "Nova tela comportamental, também eliminatória (o autor prometeu notas detalhadas depois).",
        questions: [{ q: "Comportamental / valores", tag: "STAR", link: "/entrevista/comportamental" }],
      },
    ],
    lessons: [
      "Os phone screens agora ELIMINAM e a nota entra no packet — trate como on-site, não como aquecimento.",
      "Pratique 5+ problemas por subtópico de DSA; depois contests + prática cronometrada (20 min médio, 35 hard).",
      "Travou no tempo? LC discuss → vídeo no YouTube → mais problemas do mesmo conceito.",
      "Trees, DP e Graphs são PARAMOUNT — priorize na revisão.",
      "Escreva a complexidade tempo/espaço sempre: faz parte do fluxo esperado.",
    ],
  },
];
