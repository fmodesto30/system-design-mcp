# ADR-0003 — Base de conhecimento como JSON versionado (sem banco)

- **Status:** aceito
- **Contexto:** o conteúdo é majoritariamente de leitura, curado, e precisa ser
  **rastreável até a fonte** e revisável em diff. Não há escrita de usuário nem volume
  que justifique um banco.
- **Decisão:** a fonte de verdade é `knowledge-base/*.json`, validada por um **JSON
  Schema** (`knowledge-base/schema/`) e por um **teste de integridade** no BFF que falha
  o build se algum item não tiver `sourceRefs` ou se um cross-ref não resolver. O BFF
  carrega tudo em memória no boot via `JsonKnowledgeBaseAdapter` (porta de saída).
- **Alternativas consideradas:**
  - *Postgres/Mongo:* query rica e escrita, mas infra desnecessária, menos
    git-friendly e sem ganho para um produto read-only.
  - *Markdown solto:* fácil de escrever, difícil de validar contrato/cross-refs e de
    servir como API tipada.
- **Consequências:** simples, determinístico, versionável, diffável; o gate de schema +
  integridade impede “invenção”. Custo: sem busca/query no servidor (feita no front) e
  recarga só no restart. Trocar para um banco depois é só um novo adapter (ADR-0002).
