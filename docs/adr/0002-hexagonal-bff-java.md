# ADR-0002 — BFF em Java 21 + Spring Boot, arquitetura hexagonal

- **Status:** aceito
- **Contexto:** precisamos servir a base de conhecimento por uma API estável, validada,
  com health/métricas, e que sirva ela mesma de **exemplo** de um padrão que o Lab
  ensina (Backend for Frontend). O domínio do problema (estudo de System Design) valoriza
  fronteiras limpas.
- **Decisão:** BFF em **Java 21 + Spring Boot** com **arquitetura hexagonal**:
  - `domain` com records puros (sem anotação de framework) + porta `KnowledgeBasePort`;
  - `application` com o caso de uso `KnowledgeService`;
  - `infrastructure` com adapters de entrada (web) e saída (JSON).
  - DTOs de resumo separados do domínio nos endpoints de lista.
- **Alternativas consideradas:**
  - *Front lendo o JSON direto (sem backend):* mais simples, mas perde a estabilidade de
    contrato, validação, health/métricas e o valor didático do BFF.
  - *Node/Express:* viável, mas Java/Spring casa com o foco em sistemas corporativos/
    financeiros do material e com a stack que o autor estuda.
- **Consequências:** uma peça a mais para rodar; em troca, fronteiras testáveis, troca de
  fonte de dados sem tocar o domínio, e o Lab pratica o que prega. Java 21 é requisito.
