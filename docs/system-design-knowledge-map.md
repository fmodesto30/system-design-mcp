# Mapa de Conhecimento — System Design Specialist Lab

> Guia de estudo e de entrevista. Foco nos quatro pilares de dados em sistemas
> distribuídos — **Sharding/Hash Consistente**, **API Transacional**,
> **Event Sourcing + Distributed Ledger** e **CQRS** — e no catálogo de
> **18 padrões** do microservices.io aplicados a cenários financeiros.
>
> Fontes citadas ao longo do texto: o *System Design Workbook* (p.X), os três
> repositórios de referência do mesmo autor (`msc-shard-router`,
> `msc-transactions-api`, `event-source-distributed-ledger`) e o catálogo
> conceitual do **microservices.io**. Nada aqui é afirmado sem evidência; cada
> seção aponta a página ou o arquivo que a sustenta.

---

## Sumário

1. [Sharding e Hash Consistente](#1-sharding-e-hash-consistente)
2. [API Transacional (`msc-transactions-api`)](#2-api-transacional-msc-transactions-api)
3. [Event Sourcing e Distributed Ledger](#3-event-sourcing-e-distributed-ledger)
4. [CQRS — Command/Query Responsibility Segregation](#4-cqrs--commandquery-responsibility-segregation)
5. [Catálogo de padrões (microservices.io) aplicados](#5-catálogo-de-padrões-microservicesio-aplicados)

---

## 1. Sharding e Hash Consistente

### 1.1. O problema

Sharding (particionamento) é a técnica de quebrar um conjunto grande de dados
em partes menores — os *shards* — para escalar **horizontalmente** o que não
cabe mais num único nó, banco ou carga de trabalho (workbook p.372). O gargalo
crítico de escala em sistemas distribuídos quase sempre é o banco de dados; o
sharding ataca exatamente esse ponto, permitindo adicionar capacidade sem
reestruturar a base inteira (p.376). De quebra, melhora a disponibilidade: se um
nó com um shard cai, os demais continuam servindo, e o sistema degrada
parcialmente em vez de falhar por completo (p.376–377).

A pergunta que abre qualquer projeto de sharding **não é "qual tecnologia"**, e
sim **"particionar baseado em quê?"** — definir a *sharding key* é o passo mais
importante e vem antes de qualquer escolha de stack (p.377).

### 1.2. Sharding key e hot partitions

Uma boa **sharding key** tem **alta cardinalidade** (gera muitos valores
únicos → distribuição uniforme) e cai sobre campos frequentemente consultados —
datas, identificadores, categorias (p.377). Exemplos do livro num sistema
financeiro: dividir clientes entre Pessoa Física e Pessoa Jurídica, por ranges de
agência, ou pelo hash do identificador do tenant num SaaS multi-tenant
(p.377–378).

A **hot partition** é o defeito que o sharding mal-feito produz: uma partição
recebe carga desproporcional enquanto as outras ficam ociosas. O livro dá o caso
canônico — 300 clientes em 10 partições deveriam render ~30 por partição (~10%
do uso cada); mas se 3 clientes concentram 50% do uso e o hash os joga na mesma
partição, ela sozinha passa de 50% da carga, virando gargalo enquanto as outras
9 ficam subutilizadas (p.378–379). Mitigações citadas: chaves de particionamento
mais aleatórias, **pré-particionamento** baseado em padrões de uso conhecidos,
**isolar sharding keys "barulhentas"** em partições dedicadas, e caching
inteligente para aliviar leitura nas partições mais quentes (p.379–380).

> **Cuidado de entrevista:** o exemplo de "sharding por inicial do nome" (A-E,
> F-J, …) é didático justamente porque **gera hot partition** — há muito mais
> "Ana/Bruno/Carlos" do que "Wesley/Yasmin/Ziraldo", então o shard A-E fica
> sobrecarregado e o W-Z ocioso (p.380–381). Cite-o como antiexemplo.

### 1.3. Estratégias de particionamento

| Estratégia | Ideia | Risco principal | Fonte |
|---|---|---|---|
| **Por range de iniciais** | A-E, F-J… | hot partition por distribuição natural enviesada | p.380–381 |
| **Por range de identificadores** | intervalos contínuos de IDs | "transbordo": shards cheios vs. vazios; exige governança | p.381–382 |
| **Por range de datas + tiers** | ano/mês como key, com storage *hot/warm/cold* | gerência de ciclo de vida; custo vs. acesso | p.383–384 |
| **Por hashing (mod)** | `hash(key) % N` decide o shard | **rebalanceamento massivo** quando N muda | p.384–388 |
| **Por hashing consistente** | hash ring; só remapeia a vizinhança do nó | redistribuição menor, mas ainda existe | p.396–402 |
| **Shuffle sharding** | subconjunto embaralhado de shards por cliente | reduz blast radius; mais complexo | p.404–405 |

### 1.4. Hashing simples vs. hashing consistente — o ponto-chave

No **hashing por módulo**, `shard = hash(key) % numShards`. É barato, simples e
distribui bem — **até o número de servidores mudar** (p.387). Se um shard cai ou
é adicionado, o resultado do `mod` muda para quase todas as chaves, perdendo as
referências de roteamento e exigindo redistribuição massiva dos dados. Em
recursos *stateless* (apps) ou cache reconstruível, o impacto é baixo; em dados
**persistentes**, é grave — perde-se o roteamento para o storage original
(p.388).

O **hashing consistente** resolve isso. Mapeia tanto os nós quanto as chaves no
mesmo **anel (hash ring)**; a chave pertence ao primeiro nó no sentido horário a
partir do seu ponto, "dando a volta" ao passar do topo (p.397–398). Ao adicionar
ou remover um nó, **apenas as chaves entre esse nó e o vizinho seguinte são
remapeadas** — o resto fica parado (p.398). A redistribuição é minimizada (não
zerada). **Réplicas virtuais** por nó (no código do livro, 3 réplicas por nó —
`NewConsistentHashRing(3)`) espalham melhor as chaves e reduzem desequilíbrio
(p.399). A busca do nó é feita por *binary search* ordenado no anel
(`sort.Search`, p.399–400).

A escolha do algoritmo de hash importa: o livro compara SHA-256, SHA-512, MD5,
FNV-1a, um hash "simples" e o **MurmurHash** (rápido, não-criptográfico, ideal
para grande volume), mostrando que a distribuição varia conforme o algoritmo e
**a amostra de keys** — daí a recomendação de testar empiricamente sobre as
chaves reais antes de decidir (p.389–395).

### 1.5. Como aparece no `msc-shard-router`

O `msc-shard-router` é a implementação de referência: um **proxy/router** que
distribui requisições HTTP entre backends shardados usando **hashing
consistente**. O fluxo é `Cliente → Shard Router → [Hash Consistente] → Shard N`;
um header de sharding key (default `id_client`) é hasheado e resolve, de forma
determinística, o shard de destino. Detalhes da impl. (`pkg/hashring/`,
`pkg/sharding/`):

- **SHA-512** como hash default (configurável para SHA256/SHA1/MURMUR3 via
  `HASHING_ALGORITHM`), **réplicas virtuais** (`SHUFFLE_REPLICAS`) para minimizar
  hotspots, e **binary search O(log n)** no anel — estável sob adição/remoção de
  shards (`repo:pkg/hashring/`).
- **Descoberta dinâmica de shards** por convenção de env (`SHARD_(\d+)_URL`),
  `SHARDING_KEY` configurável (`repo:pkg/setup/`).
- Cada shard é **isolado** → contenção de falha (bulkhead), prevenindo cascata.
- **Circuit breaker** embutido (`CB_FAILURE_THRESHOLD=5`,
  `CB_OPEN_TIMEOUT_SEC=30`, `CB_HALF_OPEN_SUCCESS_THRESHOLD=2`) e métricas
  Prometheus (`shard_router_requests_total`, `shard_router_responses_total` por
  shard/status). Endpoints `/*` (proxy), `/healthz`, `/metrics`
  (`repo:main.go`).

O repositório é parte de uma tese de mestrado sobre **arquitetura celular
(cell-based)** — o roteador é o mecanismo de direcionamento para células.

### 1.6. Relação com bulkheads e blast radius

Sharding e **bulkhead** são primos: ao isolar clientes/dados em shards distintos,
a falha de um shard fica contida nele, sem derrubar o resto — exatamente a
proposta do bulkhead naval aplicado a software (cada compartimento estanque). O
**Shuffle Sharding** leva isso adiante: cada cliente escreve num subconjunto
*embaralhado* de shards (primário + secundários), de modo que qualquer falha
afeta só os shards daquele cliente, não o cluster inteiro — reduzindo
drasticamente o **blast radius** e permitindo *fallback* para um shard de reserva
com os dados completos ou quase (p.404–405). No plano de consistência, o shuffle
sharding pode operar em **consistência forte** (confirma só após escrita em N
shards) ou **eventual** (réplicas secundárias atualizadas de forma assíncrona,
priorizando latência) — um trade-off explícito (p.404).

### 1.7. Quando usar / quando evitar

**Use** quando: o volume de dados ou de carga não cabe num nó; precisa escalar
horizontalmente sem reescrever a base; quer isolar tenants por
segurança/compliance ou conter blast radius. **Evite/cuidado** quando: o dado é
pequeno o suficiente para um nó + réplicas (sharding é complexidade pura aqui);
as queries cruzam shards com frequência (joins distribuídos são caros); a
sharding key tende a hot partitions e não há como rebalancear; o domínio exige
transações ACID cross-shard (sharding empurra para consistência eventual e
patterns como Saga).

| Trade-off | Prós | Contras |
|---|---|---|
| **Escalabilidade horizontal** (p.376) | adiciona capacidade sem reestruturar a base | complexidade de manutenção e balanceamento dos shards |
| **Hashing simples** (p.387–388) | cálculo barato, fácil de implementar | mudança de N → redistribuição massiva; perda de roteamento em dados persistentes |
| **Hashing consistente** (p.396) | minimiza realocação ao mudar nós; estável | ainda há redistribuição; mais maquinário (anel, réplicas virtuais) |
| **Shuffle sharding** (p.404–405) | blast radius mínimo; redundância | mais escrita e mais complexidade operacional |

---

## 2. API Transacional (`msc-transactions-api`)

### 2.1. O que o repositório modela

O `msc-transactions-api` é uma **API financeira de débito/crédito** com
**controle transacional forte** de **saldo (balance)** e **limite (limit)** do
cliente. Stack: Go + Fiber, **PostgreSQL 16**, **Redis 7.2.4**, Bun ORM,
Prometheus. Estrutura por camadas: `dto/`, `entities/` (modelos de domínio),
`services/` (regra de negócio), `routes/`, `listeners/` (handlers de evento),
`routines/` (processos de fundo), `migrations/` (`repo:services/`,
`repo:entities/`).

Diferente do ledger event-sourced (seção 3), este serviço prioriza
**consistência forte e imediata** sobre o estado do saldo. É o exemplo de
"command side" robusto antes de qualquer eventual consistency.

### 2.2. Saldo, limite e o porquê do Postgres

A operação central é: dada uma movimentação, validar se o cliente tem **saldo +
limite** suficientes antes de debitar, e atualizar o saldo de forma **atômica**.
Isso casa diretamente com a prescrição do workbook para o **modelo de escrita**:
usar **bancos relacionais com transações ACID** (Atomicidade, Consistência,
Isolamento, Durabilidade) para garantir integridade e executar a mudança de
estado de forma atômica (p.422). Saldo é o caso clássico que **não tolera
divergência**: "operações de saldo precisam ser executadas de forma atômica e
transacional para evitar inconsistências [...] devemos garantir exclusão mútua"
(p.487).

PostgreSQL entra como o banco de escrita normalizado, transacional; **Redis**
entra como camada de cache para acelerar leituras quentes (consulta de saldo)
sem martelar o banco a cada request — o padrão "cache para offload de leitura"
descrito em CQRS/réplicas de leitura (p.433–434).

### 2.3. Forte vs. eventual — onde fica a fronteira

A regra prática: **escrita de saldo/limite = consistência forte** (transação
ACID no Postgres, dentro de um agregado), porque um débito a mais ou a menos é
inconsistência financeira inaceitável. **Leitura derivada/cache (Redis) =
tolerável ser eventual** por milissegundos, desde que a fonte de verdade
(Postgres) permaneça correta. Essa separação é o coração do trade-off que o livro
explora: aceitar consistência eventual onde ela é barata, exigir forte onde o
invariante de negócio manda (p.431–435, p.487).

### 2.4. Concorrência

O risco é a corrida clássica: duas movimentações concorrentes leem o mesmo saldo,
ambas validam, ambas debitam → saldo fica negativo indevidamente. O livro nomeia
a defesa: **exclusão mútua** e processamento via **transações** para garantir que
todos os lançamentos sejam aplicados corretamente até chegar ao saldo atual
(p.487). Na prática, isso é feito com a transação SQL serializando o
*read-modify-write* do saldo (lock de linha / `SELECT ... FOR UPDATE` ou
isolamento adequado) — a transação ACID é o mecanismo que impede o *lost update*.

### 2.5. Idempotência e rollback

A API suporta **idempotência**: a mesma solicitação de débito reenviada (por
falha de rede, retry do cliente) **não pode cobrar duas vezes**. O padrão do
livro é a **chave de idempotência** enviada via header/parâmetro, verificada e
armazenada **antes** do processamento; se a chave já existe, retorna o resultado
da primeira execução sem reprocessar (p.502–503). "Sem idempotência, o cliente
poderia ser cobrado múltiplas vezes, gerando inconsistências e falhas financeiras
graves" (p.503).

O repositório expõe ainda um **`ENV=shadow`** para cenários de rollback — um modo
que permite exercitar o caminho de reversão/observação sem efetivar produção,
útil para validar compensações. Em termos de rollback transacional puro, como
tudo da operação acontece **numa transação ACID**, a falha de qualquer passo
desfaz a transação inteira (atomicidade) — não há estado parcial para compensar.
Quando a operação cruza serviços, aí sim entra **Saga** + compensação (seção 5).

| Trade-off | Prós | Contras |
|---|---|---|
| **Forte no saldo** (p.422, p.487) | nunca debita errado; sem janela inconsistente | menos throughput; lock/contención no caminho quente |
| **Cache Redis na leitura** (p.433–434) | resposta rápida de saldo; alivia o Postgres | dado pode ficar levemente stale; invalidação a gerir |
| **Idempotência por chave** (p.502–503) | retry seguro; sem cobrança dupla | armazenar/expirar chaves; custo de verificação |

---

## 3. Event Sourcing e Distributed Ledger

### 3.1. A inversão conceitual

A persistência tradicional faz **State Mutation**: cada `INSERT/UPDATE/DELETE`
substitui o estado e **apaga o histórico** — responde "como a entidade está
agora", mas não "como chegou aqui" (p.476). O **Event Sourcing** inverte: em vez
de guardar o estado atual, **acumula uma sequência de eventos imutáveis** e
**deriva** o estado reaplicando-os (p.477). Cada evento diz "algo aconteceu" e
fica permanentemente registrado; o estado é uma sequência ordenada e temporal de
fatos, não a última atualização (p.477).

Trade-off central, dito explicitamente: como toda operação vira inserção, **ler o
estado atual exige reprocessar eventos** — mais caro na leitura sob alto volume,
exigindo otimizações avançadas (snapshot, read models) (p.477).

### 3.2. Componentes da arquitetura

- **Agregado** — unidade lógica e transacional que agrupa a entidade e as regras
  que garantem sua consistência interna; decide **quais** eventos podem ocorrer,
  **em que ordem** e **sob quais condições** (p.478).
- **Event Store** — o banco central, tratado como **ledger imutável
  append-only**: anexa um novo evento ao fim do *stream* do agregado em vez de
  atualizar estado. Cada stream é a linha do tempo de uma entidade. O ponto
  crítico é garantir **ordenação e atomicidade** para reconstruir o estado
  reaplicando os eventos em sequência (p.478–479). Análogo ao log append-only do
  Kafka e aos livros contábeis (p.479).
- **Event Bus / Publishers** — propagam os eventos confirmados para outros
  domínios. A publicação deve ser **atômica e pós-confirmação**: o evento só vai
  ao bus **quando a gravação no Event Store já teve sucesso** (p.480). O Event
  Store é a *golden source*; o Event Bus é o meio de projeção das consequências
  (p.480).
- **Projections / Read Models** — processos que "ouvem" os eventos e materializam
  uma visão otimizada para leitura. São construídos sob CQRS e podem ser
  **efêmeros e descartáveis** — reconstruíveis a qualquer momento via replay
  (p.482–484).

### 3.3. Versionamento, optimistic locking e ordenação por agregado

O Event Store deve garantir **ordenação local por agregado**: todos os eventos da
mesma entidade aplicados na sequência temporal em que ocorreram — é isso que
torna a reconstrução **determinística** (p.492). Já o **Event Bus não garante
ordem global de consumo**: eventos publicados em ordem podem chegar fora de ordem
em réplicas/consumidores distintos. Em arquitetura event-driven, **isso não é
falha — é o comportamento esperado da consistência eventual** (p.492).

Cada evento carrega **`id` único** e **`version` incremental** (ou timestamp
Unix), que identificam a versão a comparar (p.494). O **Last-Write-Wins (LWW)**
resolve concorrência/duplicata: em eventos concorrentes para o mesmo agregado,
prevalece o de maior version/timestamp (p.493). Consumidores devem **checar a
versão do evento contra o estado persistido** antes de aplicar, evitando
sobrescrita indevida — via condicional em código ou **escrita condicional no
banco** (p.494). Essa escrita condicional é o **optimistic locking**: aplica só
se a versão for maior que a já gravada.

### 3.4. Snapshotting e Rehydration

**Rehydration** é reconstruir o estado de um agregado reaplicando seus eventos do
Event Store — central ao padrão e usado também para **recuperar um domínio
corrompido** reenviando os eventos sequencialmente ao bus (p.489–490).
**Snapshotting** otimiza: cria "fotografias" intermediárias do estado + o índice
do último evento aplicado, de modo que a reidratação parte do snapshot e só
aplica os eventos posteriores (p.491). Exemplo do livro: a entidade "Saldo" pode
ter 1.000.000 de eventos; gerar um snapshot a cada 10.000 evita reprocessar tudo
(p.491–492). **Snapshots são artefatos derivados e descartáveis** — o Event Store
continua sendo o single source of truth (p.492).

### 3.5. Como aparece no `event-source-distributed-ledger`

É a implementação de referência: um **ledger financeiro distribuído** com **Event
Sourcing + CQRS** e consistência eventual entre múltiplos stores. Stack:
**PostgreSQL** (Event Store), **ScyllaDB** (read model de **saldo**), **MongoDB**
(read model de **extrato/statement**), **Apache Kafka** (bus), Envoy (rate limit),
Kong (gateway).

**Fluxo (`repo:ledger/main.go`):**

1. Cliente envia comando ao Kafka — tópicos inbound `conta_criada`,
   `conta_movimentacao`.
2. O **ledger** consome, valida e **persiste o evento atomicamente** numa
   transação Postgres.
3. **Após o commit**, publica confirmações nos tópicos outbound.
4. Serviços de ingestão atualizam os read models: **saldo → ScyllaDB**
   (`repo:balance/consumer.go`), **extrato → MongoDB**
   (`repo:statement/consumer.go`).
5. As APIs (`balance-api/`, `statement-api/`) leem os read models para responder
   rápido.

**Event Store — tabela `events` (`repo:database/migrations/`):** append-only;
`aggregate_id` (UUID), `version` (INT), `event_type`, `event_data` (JSONB), com
**`UNIQUE(aggregate_id, version)`** garantindo a ordenação como fonte de verdade —
é o **optimistic locking** materializado no schema.

**Processamento de uma movimentação (`repo:ledger/main.go`):** consome a
movimentação → abre transação SQL → persiste o evento com `version` (optimistic
locking) → lê o saldo atual → calcula o novo saldo → valida as regras → atualiza
`accounts`/`transactions` → **commita** → **publica** as confirmações. Os read
models transacionais (`accounts` = saldo materializado, `transactions` = histórico
cronológico) são atualizados **dentro da mesma transação** do ledger — eliminando
latência onde a consistência imediata importa (p.484–485).

**Garantias (`repo:`):**

- **Atomicidade:** evento + read models transacionais commitam juntos no Postgres;
  o publish no Kafka é **pós-commit**, evitando *dual write* (p.480, p.484–485).
- **Idempotência:** `movimentacao_id` é único nos read models; o insert no Mongo
  ignora o erro de chave duplicada **11000** — duplicata é absorvida sem efeito
  (p.494, p.495).
- **Ordenação:** `version` por agregado no Event Store + **LWT** no Scylla
  (`INSERT IF NOT EXISTS`, `UPDATE ... IF version < ?`) → só versões maiores são
  aplicadas (LWW/optimistic locking, p.493–494).
- **Consistência eventual:** Postgres é a fonte de verdade; os read models são
  assíncronos (p.486–488).

**Tópicos Kafka:** inbound (comandos) `conta_criada`, `conta_movimentacao`;
outbound (confirmações) `ledger_nova_conta_registrada`,
`ledger_nova_transacao_confirmada` (→ Mongo), `ledger_saldo_atualizado`
(→ Scylla). Observe a sequência de domínio do livro: "Nova Conta Registrada"
precisa ser consumida **antes** dos eventos de saldo/extrato, pois os domínios
downstream persistem a estrutura base da conta antes de processar movimentações
(p.481).

### 3.6. Idempotência em consumidores — por que é obrigatória

Em arquitetura distribuída assíncrona, a idempotência **precisa ser explicitamente
projetada** — não vem de graça de uma transação ACID central (p.494–495). O Event
Bus garante entrega **at-least-once** com deduplicação, e os consumidores devem
ser idempotentes para permitir **reprocessamento seguro** (p.481). No ledger isso
é a combinação `UNIQUE(movimentacao_id)` + ignore do erro 11000 do Mongo + LWT do
Scylla: o mesmo evento entregue duas vezes não duplica saldo nem extrato.

| Trade-off | Prós | Contras |
|---|---|---|
| **Append-only / auditabilidade** (p.477, p.479) | história completa, auditável, reconstruível | leitura cara; estado precisa ser derivado |
| **Read models separados** (p.486–488) | leitura otimizada; escrita do ledger fica livre | consistência eventual; mais infra para sincronizar |
| **Snapshotting** (p.491–492) | rehydration rápida | snapshot é derivado/descartável; mais um artefato a manter |
| **LWW + version** (p.493–494) | resolve concorrência/duplicata de forma simples | descarta o evento "perdedor" — precisa que a semântica tolere |

---

## 4. CQRS — Command/Query Responsibility Segregation

### 4.1. Definição e motivação

CQRS separa as responsabilidades de **escrita** e **leitura** de um sistema. As
escritas são **commands** (operações imperativas que mudam estado, com todas as
validações); as leituras são **queries** (só retornam dados, sem mudar estado),
otimizadas para recuperação (p.420). O objetivo é **performance e escalabilidade**
via modelos de dados especializados para cada tarefa — cada lado escala
independentemente (p.421). Na prática, envolve **dois ou mais bancos** com dados
replicados, cada um com a estrutura ideal para a sua função (p.421).

### 4.2. Command side vs. Query side

**Command side** (modelo de escrita): mais complexo, incorpora regras de negócio,
validações e o ciclo de vida do dado. Costuma seguir **Rich Domain Model** e usar
**transações ACID** em banco **relacional normalizado** para garantir integridade
(p.422–423). Exemplo do livro: prescrição médica que valida médico, paciente,
medicamento e autorização **antes** de persistir — toda essa lógica encapsulada no
command (p.423).

**Query side** (modelo de leitura): não precisa de lógica de negócio nem
validação; só fornece dados para exibição. Otimizado com **caching, réplicas de
leitura ou desnormalização**; **NoSQL** é comum por alta performance e
escalabilidade horizontal, mas SQL desnormalizado também serve (p.422). O caso do
livro: uma view desnormalizada `vw_prescricoes_medicamentos_detalhadas` que
elimina os múltiplos `JOIN`s do modelo normalizado e entrega a prescrição "em
linha" para o subsistema de farmácia (p.426–429).

### 4.3. Por que separar — e o que se paga

Sistemas muito normalizados exigem **muitos joins** para montar uma visão de
leitura (p.426). Materializar uma tabela desnormalizada resolve a leitura, mas
**carregar a base inteira via `SELECT` é inviável** em sistemas transacionais de
volume — então a sincronização precisa ser **incremental e via eventos**, o que
introduz **consistência eventual** entre os modelos (p.430–431).

A sincronização saudável usa **mensageria/eventos** como intermediário: o command
persiste e emite um evento com os dados; um processo assíncrono atualiza o read
model. Há um **atraso** até a leitura refletir a escrita — janela de "consistência
eventual" que precisa ser **prevista e aceita** no design (p.431–432).

> **Armadilha** (p.433): réplicas de leitura ou um read model único ainda podem
> saturar, porque centralizam concorrência de escrita+leitura. CQRS "troca o
> problema de lugar" se não for combinado com offload real (réplicas read-only,
> NoSQL, cache).

### 4.4. Modelos de implementação (do mais simples ao distribuído)

1. **SQL → SQL desnormalizado / view materializada** — mesma instância ou outra;
   o passo mais simples de CQRS (p.424–430).
2. **Réplicas de leitura** — primário só faz offload de escrita; queries vão para
   instâncias read-only, aproveitando a consistência eventual já aceita; mais
   custo, mais resiliência (p.433–434).
3. **NoSQL no query side** — troca isolamento/atomicidade por performance de
   leitura; o domínio precisa conhecer os dois dialetos e traduzir entre eles
   (p.434–435).
4. **CQRS distribuído + Event Sourcing** — projections constroem read models a
   partir do log de eventos (ver seção 3).

### 4.5. Como aparece no ledger

O `event-source-distributed-ledger` é CQRS distribuído puro:

- **Command side:** o ledger (`repo:ledger/main.go`) processa comandos
  (`conta_movimentacao`), valida regras de saldo/limite e grava no Event Store
  Postgres com forte consistência transacional.
- **Query side:** dois read models especializados — **ScyllaDB** para **saldo**
  (consulta pontual de altíssimo volume, `repo:balance-api/`) e **MongoDB** para
  **extrato** (histórico/busca, `repo:statement-api/`) — alimentados de forma
  assíncrona via Kafka, exatamente o "modelo assíncrono de projections" do livro
  (p.487–488). As **projections são construídas sob CQRS** (p.483), e os read
  models são **materializações derivadas e reconstruíveis**, não meros caches
  (p.484).

| Trade-off | Prós | Contras |
|---|---|---|
| **Modelos separados** (p.421) | cada lado escala/otimiza sozinho | dois modelos para manter; mais infra |
| **Consistência eventual** (p.431–432) | desacopla leitura/escrita; throughput | janela de leitura stale; precisa caber no negócio |
| **NoSQL no read** (p.434–435) | leitura rápida, escala horizontal | perde ACID/relacionamento; tradução de dialetos |

---

## 5. Catálogo de padrões (microservices.io) aplicados

Para cada padrão: definição curta, problema, quando usar/evitar, onde aparece nos
repos, exemplo financeiro, trade-offs e o ângulo de entrevista. As definições são
escritas com nossas palavras; o catálogo conceitual do **microservices.io** é
referência, e a fonte factual é o workbook + os repos.

### 5.1. Database per Service

- **Definição.** Cada microsserviço é dono exclusivo do seu banco; ninguém acessa
  o banco alheio diretamente — só via API/eventos.
- **Problema.** Banco compartilhado acopla serviços (mudança de schema quebra
  todos) e impede escala/deploy independentes.
- **Quando usar.** Microsserviços com domínios bem separados que precisam evoluir
  e escalar de forma independente. **Quando evitar.** Monolito pequeno; quando o
  custo de consistência distribuída supera o ganho de autonomia.
- **Repos.** O ledger usa **bancos distintos por responsabilidade** — Postgres
  (ledger), ScyllaDB (saldo), MongoDB (extrato) (`repo:balance/`,
  `repo:statement/`). É a base que torna Saga necessário (workbook p.456: "One
  Database Per Service").
- **Exemplo financeiro.** Serviço de saldo e serviço de extrato com stores
  próprios, sincronizados por evento, nunca por join cross-DB.
- **Trade-offs.** Autonomia e isolamento de falha **vs.** consistência só
  eventual entre bancos e necessidade de Saga/eventos para transações que cruzam
  serviços.
- **Entrevista.** É o padrão que **explica por que** você precisa de Saga, CQRS e
  eventos. Sempre o cite ao justificar consistência eventual.
- **Fontes:** `reference:microservices.io patterns/data/database-per-service`;
  pdf p.456.

### 5.2. Saga

- **Definição.** Sequência de transações locais coordenadas; cada passo tem uma
  **transação compensatória** que desfaz seu efeito em caso de falha (p.455–456).
- **Problema.** Sem 2PC barato, como manter consistência numa transação que cruza
  vários serviços (cada um com seu banco) ou que é **longa**? (p.452–455).
- **Quando usar.** Transações distribuídas/longas, "Database per Service", onde
  execução parcial é inaceitável (pedido pago mas não entregue, p.454). **Quando
  evitar.** Operação cabe num único agregado/banco (use ACID local — caso do
  `msc-transactions-api`); quando não há como compensar o efeito (efeito
  colateral irreversível sem reversão de negócio).
- **Modelos.** **Orquestrado** — orquestrador central + **máquina de estado**
  comanda os passos e a compensação (p.456–458, p.460–463). **Coreografado** —
  cada serviço conhece o próximo/anterior e reage a eventos; mais simples, menos
  garantias (p.459–460).
- **Repos.** Não há serviço Saga dedicado, mas o ledger evita o **dual write**
  com commit-then-publish, que é a fundação de uma Saga confiável
  (`repo:ledger/main.go`, p.470).
- **Exemplo financeiro.** Transferência entre bancos: debita origem → credita
  destino → notifica; se o crédito falha, **compensa** estornando o débito.
- **Trade-offs.** Garante consistência e rastreabilidade **vs.** paga em
  performance e complexidade; "a proposta do Saga é confiabilidade, não
  performance" (p.450). Risco: lidar com **dual write** e sagas "presas"
  (p.467–469).
- **Entrevista.** Saiba desenhar a **máquina de estado** (estado atual + evento →
  transição → ação, p.462–463) e responder "e se o passo 3 falhar?" com a
  compensação. Mencione o **botão do pânico** (tópico de compensação com múltiplos
  consumer groups, p.467) e a alternativa **2PC** para fluxos síncronos
  (p.471–474).
- **Fontes:** `reference:microservices.io patterns/data/saga`; pdf p.449–474.

### 5.3. API Composition

- **Definição.** Um componente faz fan-out a vários serviços e **compõe** as
  respostas num único payload.
- **Problema.** Uma view do cliente precisa de dados de N serviços; deixar o
  cliente orquestrar é lento e acoplado.
- **Quando usar.** Telas/relatórios que agregam vários domínios; leitura simples
  de juntar. **Quando evitar.** Quando a junção é pesada/filtra muito em memória
  (aí um read model CQRS dedicado é melhor).
- **Repos.** Conceitualmente é o papel de um **BFF** sobre os serviços do ledger
  (saldo + extrato + conta) numa resposta só (workbook p.203).
- **Exemplo financeiro.** "Tela home do app": saldo (ScyllaDB) + últimas
  transações (MongoDB) + dados da conta, agregados numa chamada.
- **Trade-offs.** Simplifica o cliente e reduz round-trips **vs.** o compositor
  vira ponto de acoplamento e precisa de **resiliência** (timeout/circuit
  breaker) para cada dependência (p.207).
- **Entrevista.** Diferencie de CQRS: composição agrega **em tempo de leitura**;
  CQRS pré-materializa o read model. Cite quando a composição não escala.
- **Fontes:** `reference:microservices.io patterns/data/api-composition`; pdf
  p.203.

### 5.4. CQRS

- **Definição/problema/exemplo.** Ver [seção 4](#4-cqrs--commandquery-responsibility-segregation).
- **Quando usar.** Leitura e escrita com requisitos muito diferentes de
  modelo/escala; relatórios sobre dados normalizados. **Quando evitar.** CRUD
  simples sem assimetria de carga — CQRS é complexidade injustificada.
- **Repos.** Ledger: command side (Postgres) vs. read models ScyllaDB/MongoDB.
- **Trade-offs.** Otimização independente **vs.** consistência eventual + dois
  modelos a manter (p.431–435).
- **Entrevista.** Sempre amarre CQRS a **consistência eventual** e à **forma de
  sincronizar** (eventos/projections). É a pergunta de follow-up garantida.
- **Fontes:** `reference:microservices.io patterns/data/cqrs`; pdf p.420–439.

### 5.5. Domain Event

- **Definição.** Um serviço publica um **evento** ("algo de negócio aconteceu")
  quando muda estado, e outros reagem.
- **Problema.** Como notificar/sincronizar outros domínios sem acoplamento
  síncrono?
- **Quando usar.** Integração assíncrona, CQRS, Event Sourcing, reação a mudanças
  de estado. **Quando evitar.** Quando o consumidor precisa de resposta **síncrona
  imediata** (use RPC).
- **Repos.** Os tópicos do ledger são domain events: `ledger_saldo_atualizado`,
  `ledger_nova_transacao_confirmada` (`repo:ledger/main.go`). O livro descreve o
  caso delivery: grupos de listeners reagem a `CRIADO/ACEITO/PRONTO/...`
  (p.308).
- **Exemplo financeiro.** `SaldoAtualizado` dispara atualização do extrato e
  notificação push.
- **Trade-offs.** Desacoplamento e extensibilidade **vs.** consistência eventual e
  ordem não-garantida no bus (p.492).
- **Entrevista.** Distinga **evento** (fato passado, sem destinatário esperado) de
  **comando** (intenção, com alvo). Mencione versão do evento (p.494).
- **Fontes:** `reference:microservices.io patterns/data/domain-event`; pdf p.308,
  p.480–481.

### 5.6. Event Sourcing

- **Definição/problema/exemplo.** Ver [seção 3](#3-event-sourcing-e-distributed-ledger).
- **Quando usar.** Auditabilidade/rastreabilidade exigidas (financeiro, médico,
  contábil), reconstrução de estado, sistemas event-driven (p.490). **Quando
  evitar.** CRUD simples sem necessidade de histórico — complexidade alta e
  leitura cara (p.477–478).
- **Repos.** Event Store Postgres com `UNIQUE(aggregate_id, version)`
  (`repo:database/migrations/`).
- **Trade-offs.** História completa/auditável **vs.** leitura derivada cara +
  maturidade de engenharia alta (p.477–478).
- **Entrevista.** Saiba explicar **rehydration**, **snapshot** e **por que a
  ordem só é garantida por agregado** (p.489–493). Diferencie de CQRS (são
  ortogonais, mas casam bem).
- **Fontes:** `reference:microservices.io patterns/data/event-sourcing`; pdf
  p.475–495.

### 5.7. Transactional Outbox

- **Definição.** Grava o evento numa tabela **outbox dentro da mesma transação**
  da mudança de estado; um relay publica depois — escrita atômica sem dual write.
- **Problema.** **Dual write**: salvar no banco **e** publicar no broker não é
  atômico; se um falha, o sistema fica inconsistente (p.467–470).
- **Quando usar.** Sempre que precisar emitir evento ao confirmar uma escrita, com
  garantia. Em alto volume, o livro recomenda outbox como **mitigador** do gargalo
  de escrever evento+projeção na mesma transação (p.485). **Quando evitar.**
  Quando o broker oferece transação nativa com o store, ou quando perda eventual
  de evento é tolerável.
- **Repos.** O ledger usa a variante **commit-then-publish** (publica no Kafka só
  **após** o commit Postgres), que ataca o mesmo problema de dual write
  (`repo:ledger/main.go`, p.470, p.480). O livro descreve o outbox explícito como
  alternativa/evolução (p.485, p.470–471).
- **Exemplo financeiro.** Confirmar a transação no Postgres e, na mesma
  transação, gravar `ledger_nova_transacao_confirmada` na outbox; um relay envia
  ao Kafka.
- **Trade-offs.** Atomicidade garantida sem 2PC **vs.** latência extra do relay +
  tabela/processo a manter; consumidores ainda precisam ser idempotentes.
- **Entrevista.** É **a** resposta para "como você evita perder um evento ao
  salvar no banco?". Cite junto: Polling Publisher e Transaction Log Tailing como
  as duas formas de mover o outbox para o broker.
- **Fontes:** `reference:microservices.io patterns/data/transactional-outbox`;
  pdf p.467–471, p.485.

### 5.8. Polling Publisher

- **Definição.** Um processo **consulta periodicamente** a tabela outbox em busca
  de eventos não publicados e os envia ao broker, marcando-os como enviados.
- **Problema.** Como transportar o que está na outbox para o broker de forma
  simples?
- **Quando usar.** Outbox em qualquer banco; quando latência de alguns
  milissegundos/segundos é aceitável e simplicidade importa. **Quando evitar.**
  Latência muito baixa exigida ou volume altíssimo (polling vira carga e atraso).
- **Repos.** O ledger tem `routines/`-style background processes
  (`msc-transactions-api routines/`) — o padrão de processo de fundo que faria o
  relay. O livro descreve o **relay** que varre a "fila no banco" e remove o item
  só quando o step foi executado (p.470).
- **Exemplo financeiro.** Worker que a cada 200ms lê eventos pendentes de
  confirmação de transação e publica no Kafka.
- **Trade-offs.** Simples e portátil **vs.** latência de polling + carga periódica
  no banco.
- **Entrevista.** Apresente como a forma **simples** de drenar o outbox; contraste
  com Transaction Log Tailing (mais eficiente, mais complexo).
- **Fontes:** `reference:microservices.io patterns/data/polling-publisher`; pdf
  p.470.

### 5.9. Transaction Log Tailing

- **Definição.** Lê o **log de transações do banco** (WAL/binlog) e publica as
  mudanças como eventos — Change Data Capture (CDC), sem polling.
- **Problema.** Polling adiciona latência e carga; como capturar mudanças com
  baixa latência e sem tocar a aplicação?
- **Quando usar.** Alto volume, baixa latência, quando há ferramenta de CDC
  (Debezium etc.). **Quando evitar.** Sem infra de CDC; quando o acoplamento ao
  log físico do banco é indesejável.
- **Repos.** O workbook cita **Change Data Capture** como mecanismo de transporte
  do dado para o sistema subsequente em transações Saga (p.470). O ledger usa
  commit-then-publish em vez de CDC, mas CDC é a alternativa direta.
- **Exemplo financeiro.** Debezium no WAL do Postgres do ledger publicando cada
  novo registro de `events` no Kafka automaticamente.
- **Trade-offs.** Baixa latência, não-intrusivo na app **vs.** acoplamento ao log
  do banco + operação de CDC a manter.
- **Entrevista.** É o "tier avançado" do outbox. Mencione Debezium e o termo CDC
  para sinalizar senioridade.
- **Fontes:** `reference:microservices.io patterns/data/transaction-log-tailing`;
  pdf p.470.

### 5.10. Idempotent Consumer

- **Definição.** Consumidor que processa a **mesma mensagem múltiplas vezes sem
  efeito colateral adicional**, via chave de deduplicação.
- **Problema.** Brokers entregam **at-least-once**; sem idempotência, retry ou
  redelivery duplica o efeito (cobrança dupla, saldo errado) (p.495).
- **Quando usar.** **Sempre** em consumo de eventos/mensagens assíncronas; é
  pré-requisito de retry e de reinício de Saga (p.474, p.505). **Quando evitar.**
  Praticamente nunca — só se a entrega for garantidamente exactly-once (rara).
- **Repos.** Ledger: `UNIQUE(movimentacao_id)` nos read models + Mongo ignorando
  erro **11000** + **LWT** no Scylla (`UPDATE ... IF version < ?`)
  (`repo:balance/consumer.go`, `repo:statement/consumer.go`).
- **Exemplo financeiro.** Reprocessar `conta_movimentacao` duplicada não debita o
  cliente duas vezes.
- **Trade-offs.** Reprocessamento seguro e resiliência **vs.** armazenar/expirar
  chaves de dedup e cuidar de concorrência na verificação.
- **Entrevista.** Conecte com **at-least-once + dedup** e com **chave de
  idempotência** (p.502–503). É a peça que torna retries/Saga seguros.
- **Fontes:**
  `reference:microservices.io patterns/communication-style/idempotent-consumer`;
  pdf p.494–495, p.474, p.502–503.

### 5.11. API Gateway

- **Definição.** Ponto de entrada único entre clientes e os serviços internos;
  roteia por path/método e centraliza concerns transversais — auth, rate limit,
  cache, firewall (p.185).
- **Problema.** Expor N microsserviços direto ao cliente o obriga a conhecer
  todas as URLs/docs e força cada time a reimplementar segurança; trocar um
  serviço vaza trabalho para os clientes (p.186–188).
- **Quando usar.** Vários serviços expostos a clientes externos (SPA, mobile,
  terceiros); precisa de governança e segurança centralizadas. **Quando evitar.**
  Monolito único ou poucos serviços internos — gateway vira overhead/SPOF
  desnecessário.
- **Repos.** O ledger usa **Kong** como gateway e **Envoy** para rate limit
  (`repo:kong/`, `repo:envoy/`).
- **Exemplo financeiro.** Kong expõe `/contas`, `/saldo`, `/extrato` num host só,
  aplicando JWT e rate limit antes de rotear para os serviços do ledger.
- **Trade-offs.** Abstração e segurança unificadas, troca de backend
  transparente (p.190) **vs.** ponto central a escalar e proteger; primariamente
  para **REST/HTTP** (p.186, p.191).
- **Entrevista.** Diferencie de **Load Balancer**: o LB distribui entre réplicas
  da **mesma** app (L4/L7); o gateway unifica **endpoints distintos** sob uma
  fachada (p.190–191).
- **Fontes:** `reference:microservices.io patterns/apigateway`; pdf p.185–191.

### 5.12. Backend for Frontend (BFF)

- **Definição.** Um gateway/serviço **por canal** (web, mobile, IoT) que adapta o
  backend às necessidades específicas daquele frontend (p.202–205).
- **Problema.** Canais têm requisitos distintos (mobile quer payload enxuto, IoT
  usa MQTT, web faz SSR); um gateway genérico enche o código de condicionais
  (p.205).
- **Quando usar.** Múltiplos canais com jornadas/formatos diferentes;
  microfrontends com times end-to-end (p.205–206). **Quando evitar.** Canal único
  ou contratos homogêneos — BFF vira duplicação.
- **Repos.** Conceitual no Lab: um BFF sobre os serviços do ledger compondo a tela
  do app (API Composition no BFF, p.203).
- **Exemplo financeiro.** BFF Mobile devolve saldo + 5 últimas transações
  comprimidos; BFF Web devolve a visão completa com SSR.
- **Trade-offs.** Clareza por canal, payload sob medida, isolamento (p.203–205)
  **vs.** mais serviços para manter; **blast radius** compartilhado se todos
  dependem do mesmo serviço core — mitigar com bulkheads e deploy independente
  (p.207–208).
- **Entrevista.** É a especialização do gateway por canal; cada BFF deve embutir
  **circuit breaker, timeout, retry e fallback** com suas dependências (p.207).
- **Fontes:** `reference:microservices.io patterns/apigateway/...bff`; pdf
  p.201–208.

### 5.13. Circuit Breaker

- **Definição.** "Disjuntor" que **desarma** (abre) e corta chamadas a uma
  dependência quando detecta excesso de falhas/timeouts, evitando cascata; três
  estados **fechado → aberto → semiaberto** (p.513–514).
- **Problema.** Uma dependência instável acumula conexões presas e propaga falha
  em cascata por toda a malha (p.504, p.513).
- **Quando usar.** Toda chamada síncrona a dependência que pode degradar; BFFs e
  routers (p.207). **Quando evitar.** Operações sem dependência externa instável,
  ou quando o fallback é pior que falhar.
- **Repos.** Implementado no `msc-shard-router`: `CB_FAILURE_THRESHOLD=5`,
  `CB_OPEN_TIMEOUT_SEC=30` (resfriamento), `CB_HALF_OPEN_SUCCESS_THRESHOLD=2`
  (`repo:msc-shard-router`).
- **Exemplo financeiro.** Se o serviço antifraude começa a dar timeout, o breaker
  abre e o checkout aciona um fallback (fila de revisão) em vez de travar.
- **Trade-offs.** Estabilidade e *fail-fast* (p.514) **vs.** complexidade de
  tuning dos limites; risco de abrir cedo demais e negar tráfego saudável.
- **Entrevista.** Descreva os três estados e o **período de resfriamento**; cite
  que se combina com **timeout, retry com backoff+jitter e fallback** (p.504–513).
- **Fontes:** `reference:microservices.io patterns/reliability/circuit-breaker`;
  pdf p.513–514; repo `msc-shard-router`.

### 5.14. Health Check API

- **Definição.** Endpoint (`/healthz`) que reporta o estado da instância via
  status code, consumido por LBs/orquestradores para liberar ou cortar tráfego
  (p.501–502).
- **Problema.** Sem sinal de saúde, o LB envia tráfego para réplicas mortas ou
  degradadas (p.502).
- **Quando usar.** Toda app atrás de LB/autoscaling/orquestrador. **Quando
  evitar.** Praticamente nunca; o cuidado é o health check **não** ser superficial
  demais (deveria refletir dependências críticas) nem caro demais.
- **Repos.** `msc-shard-router` expõe **`/healthz`** (`repo:main.go`).
- **Exemplo financeiro.** O serviço de saldo reporta unhealthy se perde a conexão
  com o ScyllaDB; o LB para de roteá-lo.
- **Trade-offs.** Recuperação automática e remoção de réplicas ruins (p.502)
  **vs.** health check raso pode esconder falha; profundo pode derrubar tudo num
  blip de dependência.
- **Entrevista.** Ligue a **balanceamento + autoscaling** como primeira linha de
  resiliência (p.501). Diferencie liveness vs. readiness.
- **Fontes:** `reference:microservices.io patterns/observability/health-check-api`;
  pdf p.501–502; repo `msc-shard-router`.

### 5.15. Application Metrics

- **Definição.** A app exporta métricas quantitativas (contadores, gauges,
  histogramas) sobre seu comportamento ao longo do tempo (p.538–540).
- **Problema.** Sem métricas, não há visão de tendência, saturação nem alerta —
  opera-se no escuro (p.535–538).
- **Quando usar.** Sempre; é um dos três pilares da observabilidade (Métricas,
  Logs, Traces) (p.538). **Quando evitar.** Nunca; o cuidado é cardinalidade e
  custo de armazenamento.
- **Repos.** Ambos os repos usam **Prometheus**; o router expõe `/metrics` com
  `shard_router_requests_total` / `shard_router_responses_total`
  (`repo:main.go`).
- **Exemplo financeiro.** Métrica de negócio "pagamentos recusados por falta de
  saldo" + técnica "estado do circuit breaker" (p.538), avaliadas por
  **RED/USE/Four Golden Signals** (p.551–555).
- **Trade-offs.** Visibilidade e base para SLI/SLO **vs.** custo de coleta/storage
  e risco de alta cardinalidade.
- **Entrevista.** Saiba os três tipos (**counter** só sobe; **gauge** sobe/desce;
  **histogram** dá percentis p95/p99, p.538–540) e amarre a **SLI/SLO/SLA/error
  budget** (p.548).
- **Fontes:**
  `reference:microservices.io patterns/observability/application-metrics`; pdf
  p.538–540, p.548–555; repos `msc-shard-router`, `msc-transactions-api`.

### 5.16. Distributed Tracing

- **Definição.** Captura o caminho **ponta a ponta** de uma transação por vários
  serviços, com tempos por span (função, query, HTTP), ligados por um trace id
  (p.540).
- **Problema.** Numa transação que cruza dezenas de serviços, logs isolados não
  revelam **onde** está a latência ou o erro (p.538, p.540).
- **Quando usar.** Microsserviços com chamadas encadeadas; investigar latência/
  erro cross-service. **Quando evitar.** Monolito simples; cuidar do overhead de
  *sampling*.
- **Repos.** O fluxo do ledger (Kong → ledger → Kafka → balance/statement) é o
  cenário típico onde o trace revela o gargalo (`repo:ledger/`, `repo:balance/`).
- **Exemplo financeiro.** Trace de uma movimentação mostrando 80% do tempo no
  consumer do ScyllaDB.
- **Trade-offs.** Causa-raiz de latência distribuída (p.540) **vs.** instrumentação
  + propagação de contexto + custo de sampling.
- **Entrevista.** Contraste com **logs** (eventos isolados) e **métricas**
  (agregados): o trace conecta tudo numa "narrativa coesa" (p.540–541). Cite
  trace id propagado entre serviços.
- **Fontes:**
  `reference:microservices.io patterns/observability/distributed-tracing`; pdf
  p.538, p.540–541.

### 5.17. Audit Logging

- **Definição.** Registro imutável e ordenado de **o que** aconteceu, **quem** fez
  e **quando**, para auditoria e troubleshooting (p.541).
- **Problema.** Em domínios regulados (financeiro, médico), é preciso provar a
  trilha completa de ações e reconstruir o "porquê" de um estado.
- **Quando usar.** Compliance, rastreabilidade, forense; domínios sensíveis.
  **Quando evitar.** Dados efêmeros sem valor de auditoria — só custa storage.
- **Repos.** O **Event Store append-only** do ledger é, por construção, um log de
  auditoria: cada mudança de saldo é um evento imutável e versionado
  (`repo:database/migrations/`, pdf p.479 "ledger imutável, auditável e
  verificável").
- **Exemplo financeiro.** Reconstituir o histórico de saldo de uma conta a partir
  de depósitos/saques/estornos para uma auditoria (p.490, p.524).
- **Trade-offs.** Auditabilidade e reconstrução total **vs.** custo de
  armazenamento crescente e leitura cara (mitigada por snapshot, p.491).
- **Entrevista.** Ligue Audit Logging a **Event Sourcing** — o log de eventos
  serve simultaneamente de fonte de verdade e de trilha de auditoria. Lembre da
  **redação de PII/segredos** em logs (boa prática de segurança).
- **Fontes:** `reference:microservices.io patterns/observability/audit-logging`;
  pdf p.479, p.490, p.541.

### 5.18. Consistent Hashing, Bulkhead e Cell-Based (extras do livro)

Embora não estejam na lista nominal de 18, são padrões centrais aos repos e caem
em entrevista:

- **Consistent Hashing** — base do `msc-shard-router`; minimiza realocação ao
  mudar nós (ver [seção 1.4](#14-hashing-simples-vs-hashing-consistente--o-ponto-chave),
  pdf p.396–402).
- **Bulkhead** — isola recursos em compartimentos estanques para conter falha;
  casa com sharding e shuffle sharding para limitar blast radius (pdf p.528,
  p.404–405).
- **Cell-Based Architecture** — particiona o sistema inteiro em **células**
  autônomas com roteamento por chave; o `msc-shard-router` é o mecanismo de
  direcionamento de células (`repo:msc-shard-router`, tese de mestrado).

---

## Como usar este mapa em entrevista (resumo de altitude)

1. **Comece pelo invariante de negócio.** Saldo nunca pode ficar errado → forte
   no command side (Postgres/ACID). Extrato pode atrasar 200ms → eventual no read
   side. Essa frase única decide CQRS, Saga e Event Sourcing.
2. **"Database per Service" é o gatilho.** Toda vez que a transação cruza
   serviços, você precisa de Saga (com compensação) ou de eventos — e aí entram
   **dual write → outbox/commit-then-publish** e **idempotent consumer**.
3. **Escala de dados = sharding.** Defina a **sharding key** primeiro; antecipe a
   **hot partition**; escolha **hashing consistente** se nós mudam; isole o
   cliente barulhento (shuffle/dedicated shard) para conter blast radius.
4. **Feche com resiliência e observabilidade.** Health check + LB, circuit
   breaker + timeout + retry(backoff+jitter), e os três pilares (métricas/logs/
   traces) com SLI/SLO. Sem isso, o desenho "funciona no papel" e cai em produção.

> Toda afirmação acima tem âncora: páginas do *System Design Workbook* e arquivos
> dos repos `msc-shard-router`, `msc-transactions-api` e
> `event-source-distributed-ledger`. Quando precisar de profundidade, volte à
> página citada — o livro é a fonte de verdade deste Lab.
