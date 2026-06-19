# Guia de Entrevista de System Design (nível Arquiteto / Staff)

> Guia de estudo do **System Design Specialist Lab**. Toda afirmação aqui é
> ancorada no *System Design Workbook* (Matheus Scarpato Fidelis) e nas três
> implementações de referência do mesmo autor: **msc-shard-router**,
> **msc-transactions-api** e **event-source-distributed-ledger**. As páginas
> citadas (`p.N`) referem-se ao workbook.
>
> A tese central deste guia: numa entrevista de arquitetura, **o que separa um
> senior de um staff não é citar mais padrões, é expor o trade-off de cada
> decisão e quantificar a escala**. Decisão sem trade-off é opinião; escala sem
> número é chute.

---

## 1. Framework de resposta (a espinha dorsal de qualquer entrevista)

Conduza toda questão de "projete o sistema X" nesta ordem. Anuncie em voz alta
que você vai seguir um método — isso já comunica senioridade.

1. **Requisitos** — separe **funcionais** (o que o sistema faz: debitar, creditar,
   consultar saldo/extrato) de **não-funcionais** (consistência, latência-alvo,
   disponibilidade, auditabilidade, RTO/RPO). Pergunte explicitamente: *"isto
   tolera consistência eventual ou exige consistência imediata?"* — essa única
   pergunta muda toda a arquitetura.
2. **Estimativas de capacidade** — transforme o sistema em números **antes** de
   desenhar caixas. TPS médio e de pico, payload médio, concorrência interna,
   banda. Sem isto você não sabe se precisa de 1 réplica ou de sharding (ver §2).
3. **APIs / contratos** — defina os comandos e queries. Num sistema event-driven,
   os **comandos** entram (ex.: `conta_criada`, `conta_movimentacao`) e as
   **confirmações** saem como eventos de domínio.
4. **Data model** — modele o **estado de escrita** separado do **estado de
   leitura** se for usar CQRS. Para um ledger, o modelo de escrita é o
   *append-only* de eventos; os de leitura são projeções (saldo, extrato).
5. **Arquitetura** — só agora desenhe os componentes: gateway, balanceador,
   serviços, broker, stores. Cada caixa precisa de uma justificativa de
   existência.
6. **Escala** — aplique o **Scale Cube** (§2.2): replique (X), decomponha (Y),
   particione dados (Z). Diga **em que ordem** você aplica cada eixo e por quê.
7. **Trade-offs** — para cada decisão grande, nomeie o que você ganhou e o que
   pagou (latência ↔ consistência, simplicidade ↔ acoplamento, custo ↔
   resiliência).
8. **Riscos** — onde está o **SPOF**? Onde está o **dual-write**? Qual o **blast
   radius** de uma falha? Como você reprocessa? Antecipar o risco antes do
   entrevistador apontar é o sinal mais forte de staff.

> **Regra de ouro do método:** não pule da etapa 1 (requisitos) para a 5
> (arquitetura). A maioria das respostas fracas desenha caixas sem ter
> dimensionado a carga nem decidido o nível de consistência. *(workbook, p.609 —
> "entender os limites estruturais do sistema antes que eles se tornem
> incidentes".)*

---

## 2. Dimensionamento: as duas ferramentas que você precisa dominar

### 2.1 Lei de Little — `L = λ × W` *(workbook, p.612–616)*

A Lei de Little (John D. C. Little, anos 1960) é a forma mais barata de estimar a
**concorrência interna** de um sistema estável a partir de duas médias:

- **λ** = taxa média de chegada (req/s, msg/s).
- **W** = tempo médio de permanência/processamento de cada item no sistema.
- **L** = número médio de itens *simultaneamente em processamento ou espera*.

```
L = λ × W
```

O poder da fórmula está em independer de estatística complexa — basta médias bem
definidas para qualquer sistema estável *(p.612)*. Ela serve para dimensionar
**consumidores, threads, partições de fila e limites de paralelismo** *(p.614)*.

**Exemplo do workbook (p.613).** Um sistema assíncrono recebe `λ = 1500 msg/s`,
com `W = 50ms = 0,05s`:

```
L = 1500 × 0,05 = 75 mensagens em voo
```

Esse `L = 75` é a base para dimensionar quantos consumidores/threads você
precisa. **Lição crítica (p.614):** um aumento *pequeno* em W explode L. Subindo
W para 85ms:

```
L = 1500 × 0,085 = 127  (+52 mensagens só por +35ms)
```

Por isso um serviço saudável em p95 degrada violentamente em p99 sob *bursts*
sem que a CPU pareça saturada — o problema é a **variabilidade temporal**, não a
falta de recurso bruto *(p.611–612)*.

**O "Ponto Saudável" e o W-alvo (p.615–616).** Defina um `L(Alvo)` como um SLO de
engenharia — o máximo de concorrência interna que a solução suporta com margem.
Exemplo: uma API REST com `L(Alvo) = 150`, recebendo `λ = 500 req/s` a `W =
300ms` → `L = 500 × 0,3 = 150`. Está no contrato. Se a carga dobra para `λ =
1000 req/s`, `L = 300` — o dobro do alvo, zona de saturação. Para voltar ao
ponto saudável **sem** adicionar réplica, você calcula o **W-alvo**:

```
W(alvo) = L(Alvo) / λ × 1000   →   W = 150 / 1000 × 1000 = 150 ms
```

Ou seja: derrubando W de 300ms para 150ms o sistema absorve o **dobro** de carga
mantendo a mesma concorrência interna *(p.616)*. **Na entrevista**, quando
pedirem "como você dimensiona consumidores/threads" (q25), desenhe `L = λ × W`,
calcule o L atual, compare com o L(Alvo) e mostre que você tem **duas
alavancas**: aumentar μ (mais réplicas/partições) ou reduzir W (otimizar o
processamento). Cite que CPU e memória saturam de forma **não linear** — perto de
80–85% incrementos marginais já inflam filas *(p.619–620)*.

> **TPS Sistêmico (p.624):** `TPS_sistêmico = min(TPS_app, TPS_db, TPS_cache,
> TPS_broker…)`. O throughput externo é sempre limitado pelo **menor gargalo do
> caminho**. Não adianta escalar a aplicação se o banco é o teto. Diga isso —
> entrevistadores adoram.

### 2.2 Scale Cube — os três eixos da escalabilidade *(workbook, p.366–371)*

Modelo de Abbott & Fisher (*The Art of Scalability*). Três eixos; aplique **na
ordem de complexidade crescente**:

| Eixo | Nome | O que faz | Custo |
|------|------|-----------|-------|
| **X** | Escalabilidade horizontal | Adicionar/remover **réplicas idênticas** atrás de um load balancer. Exige *statelessness*. | Baixo — intrínseco à nuvem/orquestradores *(p.368)* |
| **Y** | Decomposição de funcionalidades | Quebrar o monolito em **microsserviços especializados** que escalam e se otimizam isoladamente (um CPU-bound, outro I/O-bound) *(p.368–369)* | Médio — acoplamento, contratos, operação |
| **Z** | Sharding / particionamento de dados | Particionar os **dados** por *sharding key* e rotear cada request ao shard correto. Escala a camada mais delicada: a persistência *(p.369–370)* | Alto — roteamento, rebalanceamento, hot partitions |

**Como usar na entrevista (p.370–371).** O Scale Cube é um **mapa mental, não um
modelo de governança** *(p.371)* — use-o para estruturar a resposta de "escale de
100 → 1.000 → 10.000 TPS" (q24):

- **Primeiro X:** suba réplicas stateless atrás do balanceador. Resolve a maioria
  dos casos e é o mais barato.
- **Depois Y:** quando funcionalidades têm perfis de recurso diferentes (o
  serviço de saldo é leitura pesada; o de movimentação é escrita transacional),
  separe-os para escalar e falhar de forma independente.
- **Por último Z:** quando a **camada de dados** vira o gargalo, particione por
  sharding key. É onde mora a complexidade — e onde o `msc-shard-router`
  (consistent hashing, eixo Z) entra como referência real.

O eixo Z também **reduz o blast radius** (uma falha fica contida em um shard) e
habilita estratégias de release mais finas (Blue/Green, Canary) *(p.370–371)*.

> **Frase de impacto:** *"X é grátis, Y custa acoplamento, Z custa engenharia de
> dados. Eu só pago Z quando a Lei de Little me mostra que o banco é o gargalo."*
> — conecta as duas ferramentas em uma sentença.

---

## 3. Checklist de sistemas financeiros distribuídos

Use como lista de verificação mental ao desenhar qualquer sistema de
pagamentos/ledger. Cada item tem a fonte que o sustenta.

- [ ] **Consistência por operação, não global.** Saldo exige atomicidade e
  exclusão mútua; extrato tolera consistência eventual. Decida **por agregado**
  *(p.487, p.470)*.
- [ ] **Atomicidade de escrita.** Evento + projeções transacionais comitam
  **juntos** numa única transação (Postgres no ledger de referência).
- [ ] **Sem dual-write.** Nunca "salva no banco E publica no Kafka" em duas
  operações independentes. Publique **pós-commit** ou use **Transactional Outbox**
  *(p.485; q07/q08)*.
- [ ] **Idempotência no consumidor.** Toda mensagem pode chegar mais de uma vez
  (entrega *at-least-once*). Use uma chave de negócio única (`movimentacao_id`) e
  ignore duplicatas *(p.481, p.494; q02/q23)*.
- [ ] **Ordenação por agregado.** O broker não garante ordem global; garanta
  ordem por *stream*/aggregate (versão por agregado + `UNIQUE(aggregate_id,
  version)`) *(p.478–479, p.481, p.492; q03)*.
- [ ] **Append-only e auditabilidade.** O Event Store é um **ledger imutável**:
  nunca atualiza, só anexa. Isso dá auditoria e reconstituição nativas
  *(p.478–479; q19)*.
- [ ] **Read models separados por padrão de acesso.** Saldo (chave, baixa
  latência) ≠ extrato (histórico, consulta rica) → stores diferentes *(p.484;
  q12/q13)*.
- [ ] **Limite e regra de negócio validados dentro da transação.** Saldo e limite
  conferidos antes do commit, com bloqueio otimista (`UPDATE … IF version < ?`).
- [ ] **Compensação, não 2PC.** Transação distribuída longa que falha no meio →
  **Saga** com ações compensatórias, sem two-phase commit *(p.452–455; q20)*.
- [ ] **Retry + DLQ + reprocessamento** desenhados explicitamente, com
  *backpressure* para não derrubar a jusante *(p.522; q15)*.
- [ ] **Isolamento de falha (Bulkhead / sharding por cliente).** Falha de um shard
  não derruba os outros; blast radius contido *(p.527–528, p.558–565; q11)*.
- [ ] **Observabilidade financeira.** Instrumente os três pilares (logs, métricas,
  traces) e um framework (RED para APIs, USE para recursos, Four Golden Signals)
  *(p.538, p.551–555; q14)*.
- [ ] **DR com RTO/RPO definidos.** Para um ledger, RPO tende a zero (não se pode
  perder transação confirmada) *(p.673–676; q28)*.
- [ ] **Versionamento de eventos.** Eventos são imutáveis e históricos; consumidor
  novo e antigo coexistem (upcasting/versão no evento) *(p.492; q21/q22)*.

---

## 4. Desenho ponta a ponta de um ledger event-sourced

Este é o sistema âncora do Lab (`event-source-distributed-ledger`). Saiba
desenhá-lo de cor — é a resposta da q01 e o esqueleto de metade das outras.

### 4.1 Os componentes *(workbook, p.478–488)*

- **Agregado** — unidade lógica e transacional; decide *quais* eventos podem
  ocorrer, *em que ordem* e *sob quais condições*. O estado é sempre derivado de
  uma sequência determinística de fatos *(p.478)*.
- **Event Store (Postgres)** — o **golden source**, um ledger imutável
  *append-only*. Tabela `events`: `aggregate_id` (UUID), `version` (INT),
  `event_type`, `event_data` (JSONB), com **`UNIQUE(aggregate_id, version)`**
  garantindo ordenação e atomicidade *(p.478–479)*.
- **Event Bus / Publishers (Kafka)** — projeta as *consequências* dos eventos
  para outros domínios. Publicação **atômica e pós-commit**: o evento só vai ao
  bus depois que a gravação foi bem-sucedida *(p.480–481)*.
- **Projections + Read Models** — processos que "ouvem" o Event Store e
  materializam visões otimizadas para leitura. Aqui: **saldo → ScyllaDB**
  (baixa latência, chave) e **extrato → MongoDB** (histórico, documento). São
  efêmeros e **reconstituíveis por replay** *(p.482–484)*.

### 4.2 O fluxo de escrita *(repo: ledger/main.go; flows event-sourced-write,
financial-movement)*

1. **Cliente → comando no Kafka** (`conta_criada` ou `conta_movimentacao`). O
   comando é *intenção*; ainda não é fato.
2. **Ledger consome** o comando e abre **uma transação SQL** no Event Store.
3. **Persiste o evento** com a próxima `version` do agregado (bloqueio otimista
   via `UNIQUE(aggregate_id, version)`). Se outra escrita concorrente já tomou
   essa versão, a transação falha e o consumidor reprocessa — ordenação preservada.
4. **Lê o saldo atual, calcula o novo saldo, valida regras** (saldo/limite) —
   tudo dentro da mesma transação.
5. **Atualiza os read models transacionais** (accounts/transactions) **no mesmo
   commit** → atomicidade total.
6. **Commit.** Só **depois do commit** o ledger publica as confirmações
   (`ledger_nova_conta_registrada`, `ledger_nova_transacao_confirmada`,
   `ledger_saldo_atualizado`). **Esse pós-commit é o que elimina o dual-write**
   *(p.485)*.
7. **Serviços de ingestão consomem as confirmações** e atualizam os read models
   distribuídos: **Balance → ScyllaDB**, **Statement → MongoDB**, de forma
   **assíncrona e eventualmente consistente**.
8. **APIs de leitura** (balance-api, statement-api) respondem rápido a partir dos
   read models, nunca tocando o Event Store no caminho quente.

### 4.3 As garantias e como defendê-las

- **Atomicidade** — evento + read models transacionais num único commit; Kafka é
  pós-commit *(p.485; repo: ledger/main.go)*.
- **Idempotência** — `movimentacao_id` único entre read models; o Mongo ignora o
  erro de chave duplicada (11000); reprocessar é seguro *(p.494; repo:
  statement/consumer.go)*.
- **Ordenação** — `version` por agregado no Event Store + **LWW/LWT no Scylla**
  (`UPDATE … IF version < ?`): só versões maiores são aplicadas *(p.492; repo:
  balance/consumer.go)*.
- **Consistência eventual** — Postgres é a verdade; read models convergem
  assíncronos. Para saldo (que não tolera divergência) use o modelo
  **semissíncrono**: saldo calculado atômico no Event Store e projetado para o
  read model *(p.486–487)*.

### 4.4 Como conduzir o desenho falando (roteiro de 4 minutos)

1. *"Separo comando de evento: o que o cliente pede vs. o que de fato aconteceu."*
2. *"O Event Store é append-only e imutável — isso me dá auditoria e
   reconstituição de graça, que é exatamente o requisito de um ledger."* (p.479)
3. *"Comito o evento e as projeções transacionais juntos; publico no Kafka só
   pós-commit — assim não tenho dual-write."* (p.485)
4. *"Saldo e extrato têm padrões de acesso diferentes, então uso stores
   diferentes (Scylla e Mongo) atualizados por projeções via CQRS."* (p.482–484)
5. *"A consistência é eventual entre stores, mas a verdade é forte no Event
   Store; para saldo eu aperto para semissíncrono."* (p.486–487)
6. **Trade-off final:** *"Pago complexidade operacional e latência leitura-escrita
   em troca de auditabilidade total, reconstituição e escala de leitura
   independente."*

---

## 5. Índice das 30 perguntas (q01–q30)

> Os textos completos, respostas curtas, respostas detalhadas, trade-offs e
> riscos de cada questão vivem na base de conhecimento (`interview.part1.json` /
> `interview.part2.json`). Abaixo, o mapa de uma linha por questão.

**Fundamentos do ledger e eventos**
- **q01** *(staff)* — Projetar um ledger financeiro distribuído auditável,
  reconstituível e tolerante a falhas, com saldo/extrato consultáveis em escala.
- **q02** *(senior)* — Garantir idempotência em consumidores Kafka quando a
  mensagem chega mais de uma vez.
- **q03** *(senior)* — Garantir ordem de processamento por agregado sem ordem
  global do broker.
- **q04** *(senior)* — Quando decidir **usar** Event Sourcing; quais sinais do
  domínio justificam o custo.
- **q05** *(senior)* — Quando Event Sourcing é overengineering e como reconhecer.
- **q06** *(senior)* — Quando usar **CQRS**; que problemas resolve e o custo.

**Consistência de escrita e mensageria**
- **q07** *(staff)* — Evitar inconsistência entre banco e Kafka (**problema do
  dual-write**).
- **q08** *(pleno)* — O que é o **Transactional Outbox**; componentes e quando vale.
- **q15** *(senior)* — Retry, **Dead Letter Queue** e reprocessamento num sistema
  financeiro.
- **q21** *(senior)* — Versionar eventos para consumidores antigos e novos
  coexistirem.
- **q22** *(staff)* — Evoluir schema de eventos e read models em produção com
  histórico imutável.
- **q23** *(senior)* — Garantir que um **débito não seja processado em
  duplicidade** (entrega múltipla).

**Escalabilidade e particionamento**
- **q09** *(senior)* — Sharding de base de clientes; escolher a sharding key e
  evitar hot partitions.
- **q10** *(senior)* — **Consistent hashing** e por que é melhor que `hash % N`
  quando o nº de shards muda.
- **q11** *(senior)* — Isolar a falha de um shard (**Bulkhead**).
- **q24** *(staff)* — Escalar a plataforma para 100 → 1.000 → 10.000 TPS; o que
  muda em cada degrau (**Scale Cube**).
- **q25** *(senior)* — Estimar saturação e dimensionar consumidores/threads pela
  **Lei de Little**.
- **q26** *(senior)* — Decidir o nº de partições de um tópico Kafka e o que limita
  o paralelismo de consumo.
- **q27** *(senior)* — Escolher a chave de partição; quando vira hot partition e
  como mitigar.

**Dados, leitura e modelagem**
- **q12** *(senior)* — Projetar os read models de saldo e extrato; por que stores
  diferentes.
- **q13** *(staff)* — Comparar PostgreSQL, ScyllaDB e MongoDB num sistema
  financeiro.
- **q16** *(pleno)* — Explicar **consistência eventual** para produto/negócio sem
  assustar.
- **q17** *(pleno)* — Desenhar um **BFF** para a tela de extrato/ledger; por que
  não bater direto nos serviços.

**Resiliência, segurança e transações distribuídas**
- **q18** *(senior)* — Proteger as APIs financeiras (débito/crédito) de uma
  plataforma de pagamentos.
- **q19** *(senior)* — Auditoria de transações confiável e à prova de adulteração.
- **q20** *(senior)* — Rollback de transação distribuída de várias etapas **sem
  2PC** (**Saga**).
- **q28** *(staff)* — Estratégia de **disaster recovery**; como definir RTO e RPO.

**Operação, teste e comunicação**
- **q14** *(senior)* — Monitorar o sistema; quais sinais e frameworks instrumentar.
- **q29** *(senior)* — Testar uma arquitetura distribuída orientada a eventos
  antes de produção.
- **q30** *(staff)* — Apresentar os **trade-offs** da arquitetura para a diretoria
  (executivos não-técnicos).

---

## 6. Fechamento — o que o entrevistador staff está realmente medindo

1. **Você dimensiona antes de desenhar?** `L = λ × W` e TPS sistêmico na ponta da
   língua *(p.612, p.624)*.
2. **Você aplica o Scale Cube na ordem certa?** X barato → Y por funcionalidade →
   Z só quando os dados são o gargalo *(p.366–371)*.
3. **Você nomeia o trade-off de cada decisão?** Consistência ↔ latência,
   simplicidade ↔ acoplamento, custo ↔ resiliência. Sem isso, é só preferência.
4. **Você antecipa o risco?** Dual-write, SPOF, hot partition, blast radius — diga
   onde dói **antes** de perguntarem.
5. **Você sabe quando *não* usar** o padrão sofisticado? Reconhecer
   overengineering (q05) é tão staff quanto saber projetar o ledger (q01).
