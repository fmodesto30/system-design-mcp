# Trilha — Processos Seletivos (SWE)

> **⚙️ CALIBRAR (me diz que eu afino o plano):** alvo (FAANG / big tech BR / startup / remoto internacional),
> nível (júnior / pleno / sênior), stack-foco (Java-Spring? Node-Nest? Python?) e idioma da entrevista (PT/EN).
> O plano abaixo é o default pra **dev backend/cloud pleno-sênior** — pelos seus projetos (microservices,
> ecommerce, AWS). Ajusta a intensidade de DSA vs System Design conforme o alvo.

## Métrica de progresso
**Não** horas. Conta: (a) nº de problemas DSA resolvidos SEM olhar solução, (b) nº de system designs feitos
ponta-a-ponta, (c) nº de mocks. Meta inicial: 3 DSA + 1 design + 1 mock por semana.

## Os 5 pilares (ordem ≠ prioridade — rode em paralelo)

### 1. DSA — estruturas & algoritmos
- Plataforma: LeetCode (ou NeetCode 150 como roteiro curado). Padrões > quantidade.
- Ordem de padrões: arrays/hashing → two pointers → sliding window → stack → binary search →
  linked list → trees/BFS-DFS → heap → backtracking → grafos → DP (o mais pesado, por último).
- Regra: **timebox 30 min**; se travar, lê a solução, ENTENDE, e refaz do zero em 2 dias.
- Pra backend pleno-sênior: foco em médio; DP/grafos avançado só se o alvo for big tech.

### 2. System Design (sua força — você já faz microservices)
- Roteiro: *System Design Interview* (Alex Xu) vol 1+2 + o canal ByteByteGo.
- Praticar designs clássicos: URL shortener, feed, chat, rate limiter, news feed, upload de vídeo,
  notificação, e-commerce (você JÁ tem o `ecommerce-orders` — use como base real).
- Amarrar com AWS (trilha ☁️): cada componente → "como eu faria isso na AWS" (S3, SQS, DynamoDB, ELB, RDS…).
- Entregável por design: 1 diagrama + decisões de trade-off + estimativa de escala.

### 3. Backend deep — domina 1 stack
- Escolha **uma** stack-âncora (provável: Java/Spring, pelo loglife). Saiba responder: concorrência,
  transações/isolation, índices, N+1, cache, idempotência, observabilidade, testes (contract/integration).
- As outras (Node/Nest, Python) = "sei usar", não "domino" — não dilua.

### 4. Portfólio / projetos (você já tem matéria-prima)
- Polir 1–2 projetos de `E:\projects` (`bookstore-microservices`, `ecommerce-orders`) como **prova de competência**:
  README claro, testes, CI, diagrama de arquitetura, deploy/Docker, decisões documentadas.
- 1 projeto bem-acabado > 5 pela metade. Conecta com a trilha AWS (deploy real na AWS conta como ouro).

### 5. Comportamental + processo
- **STAR** pra 8–10 histórias (conflito, falha, liderança, prazo, ambiguidade) — escreve uma vez, reusa.
- Currículo + LinkedIn alinhados ao alvo; lista de empresas-alvo; pipeline de aplicação (kanban simples).
- Mock interviews (Pramp / com amigo / gravando você mesmo) — a parte que mais paga e a mais pulada.

## Roadmap sugerido (ajustável)
1. **Semanas 1–4**: padrões DSA fáceis-médio + System Design vol 1 (5 designs) + escolher a stack-âncora.
2. **Semanas 5–8**: DSA médio + System Design vol 2 + polir 1 projeto + STAR escrito.
3. **Semanas 9+**: mocks semanais + aplicar + revisar gaps (o mock revela o que falta).

## Quando voltar aqui
Atualiza a métrica (DSA/designs/mocks resolvidos) e marca o pilar mais fraco — é nele que entra a próxima semana.
