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
  {
    id: "amazon-sde1",
    company: "Amazon (SDE-1)",
    result: "passou",
    resultLabel: "Oferta SDE-1 🎉",
    summary:
      "Loop OA → 2 coding rounds → 1 coding + Leadership Principles. Resultado positivo → oferta SDE-1 (India University Graduate). Soluções otimizadas e prep de LP fizeram a diferença.",
    loop: ["OA", "Coding 1", "Coding 2", "Coding + LP"],
    rounds: [
      {
        type: "OA — Online Assessment",
        detail:
          "7 MCQs de debug de código + 2 DSA + um form comportamental longo. Resolveu os 7 debugs e a 1ª DSA em ~10 min; a 2ª parcial. Round “average”, mas garantiu o convite.",
        questions: [
          { q: "LC 2265 — Nodes Equal to Average of Subtree", tag: "Árvore / DFS", link: "/entrevista/fundamentos" },
          { q: "LC 68 — Text Justification", tag: "String / Simulação", link: "/entrevista/dsa" },
        ],
        note: "Ser rápido em contests + debug pesa muito aqui.",
      },
      {
        type: "Coding round 1",
        detail: "1 LC hard de BFS. Codou rápido um BFS + hashmap; entrevistador satisfeito.",
        questions: [{ q: "Tipo LC 127 — Word Ladder (BFS)", tag: "BFS / Grafo", link: "/entrevista/fundamentos" }],
      },
      {
        type: "Coding round 2",
        detail: "3 questões em sequência — gostaram da velocidade.",
        questions: [
          { q: "LC 863 — All Nodes Distance K in Binary Tree (BFS + parent pointers via hashmap)", tag: "Árvore / BFS", link: "/entrevista/fundamentos" },
          { q: "Connect ropes com custo mínimo (greedy + priority queue)", tag: "Heap", link: "/entrevista/fundamentos" },
          { q: "Max steps with reduced m — O(n) → binary search O(log n)", tag: "Binary Search", link: "/entrevista/dsa" },
        ],
      },
      {
        type: "Coding + Managerial (Leadership Principles)",
        detail:
          "LC hard: menor substring de 's' contendo 't' como subsequência (sliding window; tipo LC 76 Minimum Window Substring). Explicou bem, mas não terminou de codar a tempo. + comportamental.",
        questions: [
          { q: "Tipo LC 76 — Minimum Window Substring", tag: "Sliding Window", link: "/entrevista/dsa" },
          { q: "Leadership Principles: Customer Obsession, Bias for Action (STAR)", tag: "STAR / LP", link: "/entrevista/comportamental" },
        ],
      },
    ],
    lessons: [
      "Amazon REPETE problemas — foca nas questões LC Amazon-tagged.",
      "Pratique medium-hard; revise grafos, árvores e DP (super comum na Amazon).",
      "Prepare as Leadership Principles: respostas em STAR cobrindo várias das 16 LPs, conectadas à sua experiência.",
    ],
  },
];

export const pitfalls = {
  title: "Os 7 erros que o entrevistador vê (e como evitar)",
  source: "de quem tomou 100+ entrevistas no Google",
  items: [
    { erro: "Complicar a solução", tip: "Comece pela 1ª abordagem que vier (só explique), depois otimize. Solução simples de entender ganha pontos." },
    { erro: "Comunicar de menos", tip: "Pense em voz alta. O silêncio tira seu único ajudante — o entrevistador — que poderia te guiar." },
    { erro: "Não clarificar requisitos", tip: "Pergunte ANTES de codar. Confirme edge cases e constraints cedo." },
    { erro: "Ignorar edge cases", tip: "Depois de resolver, liste os edge cases e diga como seu código lida — mostra cuidado." },
    { erro: "Otimizar errado (ou não otimizar)", tip: "Releia a solução e discuta melhorias — ganhos em Big-O, não micro-otimização." },
    { erro: "Pular o dry run", tip: "80% pulam. Rode o código na mão com um exemplo — pega bug cedo e parece proativo." },
    { erro: "Travar e entrar em pânico", tip: "Travou? Peça 2 min pra organizar. Ainda travado? Peça uma dica — pedir ajuda é colaborar, não fraqueza." },
  ],
};

export const resourceStack = {
  intro: "Stack “sem enrolação” de quem resolveu 1600+ e passou Amazon + Google. Recurso não passa entrevista — **revisão** passa.",
  sections: [
    {
      title: "Teoria (sob demanda)",
      points: [
        "**Cracking the Coding Interview** — NÃO leia capa a capa. Use só quando a teoria de um subtópico tá nebulosa, ou seu código funciona mas você não entende por quê: lê o subtópico → resolve as questões do capítulo → segue.",
      ],
    },
    {
      title: "Vídeos (seletivo, sem maratona)",
      points: [
        "**Tushar Roy** — DP, grafos, segment tree.",
        "**Abdul Bari** — fundamentos.",
        "**take U forward (TUF)** — questões de entrevista.",
        "Assista só pro problema/subtópico que você está praticando.",
      ],
    },
    {
      title: "Prática nível-entrevista (o mais importante)",
      points: [
        "**Questões company-tagged**: LeetCode Premium, ou grátis (`leetcode.ca/tags`, github “company dsa questions”).",
        "NÃO grinde LC aleatório. Quando vier a call, pratique com **foco na empresa**.",
      ],
    },
    {
      title: "Velocidade sob pressão",
      points: [
        "**LeetCode Weekly/Biweekly contests** = prática cronometrada suficiente.",
        "Codeforces (Div 2/3/4) opcional, só se curtir. DSA forte já crackeia a maioria — CP não é obrigatório.",
      ],
    },
  ],
  flow: [
    "Pegue **um tópico por vez** e aprofunde (sem pular entre tópicos).",
    "Cobriu todos → resolva os populares **com timer** (Blind 75).",
    "Entrevista marcada → **foco total** nas questões da empresa.",
  ],
};
