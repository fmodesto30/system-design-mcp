# Trade-offs Transversais — System Design Specialist Lab

> Decisões de arquitetura distribuída raramente têm um "lado certo". Têm um lado
> **certo para o seu requisito**. Este documento atravessa os capítulos do
> workbook e as três implementações de referência (`msc-shard-router`,
> `msc-transactions-api`, `event-source-distributed-ledger`) para listar os
> trade-offs que mais aparecem em entrevista — cada um com um veredito
> **"quando A, quando B"**. Não há neutralidade aqui: cada seção diz quando
> escolher cada lado.
>
> Como ler: a coluna **Escolha A** e **Escolha B** são gatilhos de decisão. Se o
> seu sistema bate na linha, é esse o lado. Fonte de cada seção no rodapé dela.

---

## Índice

1. [Consistência forte vs. consistência eventual](#1-consistencia-forte-vs-consistencia-eventual)
2. [API transacional vs. Event Sourcing](#2-api-transacional-vs-event-sourcing)
3. [CQRS no mesmo banco vs. stores separados](#3-cqrs-no-mesmo-banco-vs-stores-separados)
4. [API Gateway vs. BFF](#4-api-gateway-vs-bff)
5. [Saga: orquestração vs. coreografia](#5-saga-orquestracao-vs-coreografia)
6. [Sharding por cliente vs. por hash](#6-sharding-por-cliente-vs-por-hash)
7. [PostgreSQL vs. ScyllaDB vs. MongoDB](#7-postgresql-vs-scylladb-vs-mongodb)
8. [Síncrono (REST/gRPC) vs. assíncrono (Kafka)](#8-sincrono-restgrpc-vs-assincrono-kafka)
9. [Snapshotting vs. replay puro](#9-snapshotting-vs-replay-puro)
10. [Circuit breaker vs. retry vs. bulkhead](#10-circuit-breaker-vs-retry-vs-bulkhead)
11. [Tabela-resumo: o reflexo de entrevista](#tabela-resumo-o-reflexo-de-entrevista)

---

## 1. Consistência forte vs. consistência eventual

O eixo mais fundamental. O CAP diz que, **sob partição de rede**, você escolhe
entre consistência (C) e disponibilidade (A); o PACELC complementa: **mesmo sem
partição** (Else), você ainda escolhe entre Latência (L) e Consistência (C).
Consistência forte custa latência (precisa confirmar réplicas antes do ACK);
eventual responde rápido, mas um usuário no Brasil pode ver, por algum tempo,
um dado diferente de outro na Espanha.

As duas referências do Lab encarnam os dois lados: `msc-transactions-api` impõe
**controle transacional forte** de saldo/limite em PostgreSQL (um CP/EC clássico
— ACID, leitura sempre correta); o `event-source-distributed-ledger` usa o
Postgres como fonte da verdade, mas seus read models (saldo em ScyllaDB, extrato
em MongoDB) são **eventualmente consistentes** — atualizados assíncronamente
após o commit.

| | **Escolha consistência forte (CP / EC)** | **Escolha consistência eventual (AP / EL)** |
|---|---|---|
| **Quando** | O dado errado causa prejuízo: saldo, limite de crédito, estoque, débito/crédito financeiro. Atomicidade é inegociável. | Stale data por segundos é aceitável: timeline, busca, catálogo, contadores, read model de extrato. |
| **Sob partição** | Desativa nós inconsistentes; aceita ficar indisponível para não corromper. | Todos os nós seguem respondendo, mesmo desatualizados; reconcilia depois. |
| **Custo** | Latência de escrita maior; throughput limitado; menos disponível. | Janela de inconsistência; precisa de idempotência e resolução de conflito (ex. Last-Write-Wins). |
| **Tecnologia típica** | PostgreSQL, Oracle, Spanner (PC/EC). | DynamoDB, Cassandra, ScyllaDB (PA/EL). |

**Veredito:** **escreva o caminho de dinheiro com consistência forte e leia com
consistência eventual.** É exatamente o que o ledger faz — Event Store forte +
read models eventuais. Não há vergonha em misturar: a maioria dos sistemas
reais é forte numa fronteira e eventual nas outras.

> Fontes: workbook p.82–85 (combinações "escolha 2" do CAP, tabela de flavors),
> p.88–91 (PACELC, classificações PA/EL e PC/EC); repo `event-source-distributed-ledger`
> (`ledger/`, read models ScyllaDB/MongoDB); repo `msc-transactions-api`
> (`services/`, controle transacional de saldo/limite).

---

## 2. API transacional vs. Event Sourcing

Duas formas de tratar o estado financeiro, lado a lado nas referências do Lab.

A **API transacional** (`msc-transactions-api`) guarda o **estado atual**: a
linha da conta tem o saldo, e cada débito/crédito é um `UPDATE` atômico que
valida saldo e limite na hora. Simples, rápido de ler, ACID. O preço: você sabe
o saldo *agora*, mas **perde a trilha de eventos** que levou até ele.

O **Event Sourcing** (`event-source-distributed-ledger`) guarda a **sequência de
fatos**: a tabela `events` é append-only (`aggregate_id`, `version`,
`event_type`, `event_data`), com `UNIQUE(aggregate_id, version)` garantindo a
ordem. O saldo é um *derivado* — reconstruído (rehydration) aplicando os eventos.
Você ganha auditabilidade total, replay e read models múltiplos; paga em
complexidade e em consistência eventual nas leituras.

| | **Escolha API transacional (estado atual)** | **Escolha Event Sourcing (log de eventos)** |
|---|---|---|
| **Quando** | CRUD com regra transacional clara; o histórico não é requisito; time pequeno; precisa entregar rápido. | Auditabilidade, rastreabilidade e causalidade são requisito: contábil, prontuário médico, rastreio de medicamentos, ledger financeiro. |
| **Leitura** | Imediata e consistente (lê a linha). | Reconstrói o estado por replay (ou snapshot); read models assíncronos. |
| **Recuperação de falha** | Backup/restore tradicional. | Reaplica todos os eventos no Event Bus e reconstitui os domínios subsequentes. |
| **Custo** | Não dá para responder "como cheguei aqui?". | Mais peças (Event Store, bus, ingestores, read models); ordem global não garantida; precisa idempotência + versionamento. |

**Veredito:** **use Event Sourcing só quando o histórico for parte do domínio.**
Se a pergunta "preciso provar/reconstruir como o estado evoluiu?" for *não*, uma
API transacional ACID é a resposta certa — Event Sourcing aqui seria
overengineering caro. Se for *sim* (auditoria regulatória, estorno, fechamento
contábil), o log de eventos paga o próprio custo.

> Fontes: workbook p.475–478 (persistência tradicional vs. Event Sourcing),
> p.489–490 (rehydration, recuperação por reaplicação de eventos); repo
> `msc-transactions-api` (entidades/serviços de saldo+limite); repo
> `event-source-distributed-ledger` (tabela `events` append-only, `UNIQUE(aggregate_id, version)`).

---

## 3. CQRS no mesmo banco vs. stores separados

CQRS separa o **modelo de escrita** (commands, normalizado, ACID, rich domain) do
**modelo de leitura** (queries, desnormalizado, otimizado para recuperar). A
pergunta de design não é *se* separa as responsabilidades — é **onde** o modelo
de leitura mora.

| | **Mesmo banco (view materializada / read replica)** | **Stores separados (heterogêneos)** |
|---|---|---|
| **Forma** | Tabela normalizada de escrita → view materializada/desnormalizada no mesmo SQL, ou réplica de leitura. | Escrita num store (ex. Postgres) → leitura noutro engine (ex. ScyllaDB para saldo, MongoDB para extrato). |
| **Quando** | A leitura é "o mesmo dado, formato melhor"; um banco aguenta os dois perfis de carga; quer simplicidade operacional. | Os perfis de leitura divergem (point-lookup de saldo vs. listagem cronológica de extrato); precisa escalar leitura independente da escrita; precisa de engine especializado por consulta. |
| **Consistência** | Pode ser síncrona (mesma transação) ou quase-imediata (replica lag pequeno). | Eventual — atualização assíncrona via eventos; precisa idempotência (`movimentacao_id` único) e ordem (versão/LWW). |
| **Custo** | Pouca infraestrutura nova; menos resiliência/escala de leitura independente. | Mais peças, dual write disfarçado, janela de inconsistência, mais código de ingestão. |

**Veredito:** **comece com CQRS no mesmo banco** (view materializada ou read
replica) — resolve a maioria dos casos com uma fração da complexidade. **Vá para
stores separados quando os padrões de acesso forem genuinamente diferentes** ou a
leitura precisar escalar sozinha. O ledger é o caso-limite legítimo: saldo é
key-lookup (ScyllaDB), extrato é varredura cronológica (MongoDB) — um único
engine atenderia ambos mal.

> Fontes: workbook p.421–424 (separação command/query, modelos de implementação,
> CQRS em SQL + view materializada), p.433–434 (CQRS e réplicas de leitura,
> CQRS e NoSQL); repo `event-source-distributed-ledger` (read models ScyllaDB +
> MongoDB atualizados via Kafka); reference microservices.io patterns/data/cqrs.

---

## 4. API Gateway vs. BFF

Os dois ficam **na borda**, na frente dos microserviços — e por isso são
confundidos. A diferença é de **propósito**.

O **API Gateway** resolve **governança**: ponto de entrada único que encapsula a
complexidade de dezenas/centenas de serviços, roteia por path-prefix/método,
centraliza auth, rate limiting, throttling, cache. É **agnóstico de cliente** —
expõe os endpoints selecionados de forma uniforme. Troca de backend "em voo",
respeitando o contrato, fica trivial.

O **BFF (Backend for Frontend)** resolve **experiência de um canal específico**:
um backend dedicado por tipo de cliente (web/SSR, mobile enxuto, IoT/MQTT). Faz
**API Composition** (consolida N chamadas numa só), adapta contratos (renomeia
campos, filtra dados sensíveis, ordena), e isola o blast radius por canal. A
lógica que antes vivia no cliente desce para o BFF.

| | **API Gateway** | **BFF** |
|---|---|---|
| **Resolve** | Governança, roteamento, segurança e gestão de APIs num ponto único. | Necessidades de UI de um canal: composição, agregação, formato sob medida. |
| **Acoplamento ao cliente** | Genérico — um gateway serve todos os canais. | Específico — um BFF por canal (web, mobile, IoT). |
| **Quando** | Você tem muitos serviços e precisa de um ponto coeso de entrada/segurança/versionamento. | Canais com requisitos divergentes (payload, cache, protocolo, offline); quer eliminar `if cliente == mobile` do código. |
| **Risco se errar** | Vira um monolito de borda se acumular lógica de negócio. | Proliferação de BFFs duplicando regra; vira camada extra inútil se os canais forem iguais. |

**Veredito:** **não é "ou" — é camada.** Use **API Gateway** para a governança
transversal (auth, rate limit, roteamento) e coloque **BFFs atrás dele** quando
houver canais com jornadas distintas. Se só existe um cliente web e os payloads
já servem, **não crie BFF** — é cerimônia. O gateway sozinho basta.

> Fontes: workbook p.185–192 (API Gateway: encapsula serviços, roteamento por
> path/método, gateway vs. load balancer, gateway tendo LB como backend),
> p.203–205 (BFF: API Composition, segregação de canais web/mobile/IoT);
> reference microservices.io patterns/apigateway, patterns/apigateway/backend-for-front-end.

---

## 5. Saga: orquestração vs. coreografia

Transação distribuída sem 2PC. A Saga quebra a transação em operações locais por
serviço (cada um com seu banco — *database per service*) e usa **transações
compensatórias** para desfazer passos já confirmados em caso de falha. Evita o
bloqueio síncrono e caro do Two-Phase Commit. A escolha é **quem conhece o
fluxo**.

**Orquestrado:** um componente central (control plane / máquina de estado) monta
o "mapa da saga", dispara comandos (command/response) para cada serviço, espera
a resposta e decide o próximo passo — ou aciona o "botão do pânico" para compensar
tudo. A complexidade fica concentrada e **observável** num lugar.

**Coreografado:** não há centro. Cada serviço **conhece o anterior e o
próximo**: ao terminar, publica um evento e o seguinte reage, numa malha. A
compensação propaga para trás. Mais simples de começar, mas o fluxo fica
**espalhado** e difícil de rastrear/metrificar.

| | **Orquestração** | **Coreografia** |
|---|---|---|
| **Controle do fluxo** | Centralizado (orquestrador + máquina de estado). | Distribuído (cada serviço sabe o vizinho). |
| **Quando** | Saga com muitos passos, ramificações, ou que exige rastreabilidade/metrificação forte (pagamentos→estoque→entrega→notificação). | Fluxo curto, linear, poucos serviços; quer baixo acoplamento e nenhum ponto central. |
| **Observabilidade** | Alta — início/fim/estado num só ponto, histórico transacional. | Baixa — precisa de tracing distribuído para "ver" a saga inteira. |
| **Risco** | Orquestrador vira gargalo/SPOF se mal isolado. | Acoplamento implícito entre serviços; difícil mudar a ordem; dual write em cada salto. |

**Veredito:** **fluxo complexo ou regulado → orquestração** (você precisa
enxergar e auditar a transação inteira; máquina de estado paga o custo). **Fluxo
simples e estável → coreografia** (menos infra, menos acoplamento central).
Atenção: **os dois sofrem do problema de dual write** (salvar no banco *e*
publicar o evento atomicamente) — a defesa é publicar o evento *dentro* da
transação ACID via **Transactional Outbox**, não acoplar o broker ao commit.

> Fontes: workbook p.456–460 (modelos orquestrado e coreografado, command/response,
> máquina de estado, malha de serviços), p.467–470 (dual write em saga, outbox);
> reference microservices.io patterns/data/saga, patterns/data/transactional-outbox.

---

## 6. Sharding por cliente vs. por hash

Particionar para escalar horizontalmente. A escolha da **sharding key** define se
a carga distribui bem ou cria **hot partitions**.

**Sharding por cliente/range** (por inicial, por intervalo de id, por data):
intuitivo e ótimo para consultas por intervalo (ex. tier hot/warm/cold por ano).
Mas vulnerável a **desbalanceamento**: existem muito mais "Ana/Bruno" do que
"Wesley/Ziraldo", então o shard A–E ferve e o W–Z fica ocioso. Também exige
governança contra "transbordo" (shard cheio vs. vazio).

**Sharding por hash** (`hash(key) % N`, ou **hash consistente** como no
`msc-shard-router`): a função hash espalha de forma uniforme, evitando hot
partitions por natureza dos dados. O `msc-shard-router` usa SHA-512 +
**réplicas virtuais** (minimizam hotspot) + busca binária O(log n), e é
**estável** sob adição/remoção de shards (rebalanceia o mínimo). O custo: perde
a localidade de range — consultas "todos os clientes de 2023" viram scatter-gather.

| | **Sharding por cliente / range** | **Sharding por hash (consistente)** |
|---|---|---|
| **Distribuição** | Depende da forma do dado; risco real de hot partition. | Uniforme por construção; réplicas virtuais suavizam hotspots. |
| **Quando** | Consultas por intervalo (datas, ids sequenciais); tiering de storage por idade do dado; isolamento explícito por tenant/cliente (bulkhead). | Distribuição equilibrada de carga é o objetivo nº1; chave de alta cardinalidade (id_client, tenant). |
| **Range query** | Eficiente (dados contíguos no shard). | Cara (scatter-gather — dado espalhado). |
| **Re-shard** | Pode exigir migração grande e governança de transbordo. | Hash consistente move o mínimo de chaves ao adicionar/remover shard. |

**Veredito:** **default = hash consistente** quando o objetivo é espalhar carga
sem hot partition (é o caso do roteador celular). **Use range/por-cliente
quando** (a) suas consultas são por intervalo, (b) você quer **tiering** por
idade do dado, ou (c) precisa de **isolamento deliberado por cliente** como
bulkhead/blast-radius — aí a "hot partition" vira feature, não bug.

> Fontes: workbook p.377 (sharding keys e hot partitions), p.380–385 (range por
> iniciais/ids/datas, tiers hot/warm/cold, sharding por hashing com módulo);
> repo `msc-shard-router` (`pkg/hashring/`, `pkg/sharding/` — SHA-512, réplicas
> virtuais, busca binária O(log n), estabilidade sob add/remove de shard).

---

## 7. PostgreSQL vs. ScyllaDB vs. MongoDB

A escolha do engine segue o **modelo de dado e o padrão de acesso** — e o
`event-source-distributed-ledger` usa os três **ao mesmo tempo**, cada um onde
brilha. Isto não é indecisão; é poliglota persistence consciente.

| Engine | Modelo | Posição CAP/PACELC | Brilha em | Custa |
|---|---|---|---|---|
| **PostgreSQL** | Relacional, ACID | CA / PC-EC (centralizado/forte) | Escrita transacional, integridade, joins, fonte da verdade (Event Store). | Escala de escrita horizontal mais difícil; é o gargalo se tudo passar por ele. |
| **ScyllaDB** | Wide-column (LSM-tree), Cassandra-compatível | AP / PA-EL (eventual) | Point-lookup massivo, baixa latência, escala a milhares de nós; saldo/séries temporais. | Joins restritos, transações atômicas limitadas; consistência eventual (mitigada por LWT `IF`/`version`). |
| **MongoDB** | Documento | CP / forte (config padrão) | Documento próximo do payload de response; extrato/listagem cronológica; schema flexível. | Não é relacional; modelagem de relacionamento exige cuidado. |

No ledger: **Postgres** é o Event Store (verdade atômica, `UNIQUE(aggregate_id,
version)`); **ScyllaDB** materializa o **saldo** (read model de point-lookup, com
`INSERT IF NOT EXISTS`/`UPDATE ... IF version < ?` para ordem); **MongoDB**
materializa o **extrato** (documento cronológico, dedup por `movimentacao_id`
único, ignorando erro 11000).

**Veredito:**
- **PostgreSQL** quando precisa de **ACID e integridade** — toda escrita de
  dinheiro, fonte da verdade, dado que joina.
- **ScyllaDB** (ou Cassandra/DynamoDB) quando precisa de **leitura por chave em
  altíssima escala** com latência baixa e tolera consistência eventual — saldo,
  contadores, séries temporais.
- **MongoDB** quando o **dado é um documento** que espelha a resposta da API e o
  schema evolui — extratos, catálogos, payloads agregados.

Não force um engine a fazer o trabalho do outro: relacional para escrever certo,
wide-column para ler rápido por chave, documento para servir payload.

> Fontes: workbook p.82–85 (flavors CAP: Postgres CA, MongoDB CP, Cassandra AP),
> p.91 (DynamoDB/Cassandra PA/EL), p.113–114 (wide-column: famílias de colunas,
> escala a milhares de nós, transações atômicas limitadas/joins restritos);
> repo `event-source-distributed-ledger` (Postgres Event Store + ScyllaDB saldo
> com LWT + MongoDB extrato com dedup 11000).

---

## 8. Síncrono (REST/gRPC) vs. assíncrono (Kafka)

Como dois componentes conversam. Síncrono: o chamador **espera** a resposta na
mesma chamada (REST sobre HTTP/1.1, gRPC sobre HTTP/2 com ProtoBuf —
performático, streaming bidirecional, múltiplas RPCs paralelas numa conexão).
Assíncrono: o produtor **publica e segue** (mensageria/eventos via broker);
o consumo acontece desacoplado, em paralelo, ordenado ou não.

| | **Síncrono (REST / gRPC)** | **Assíncrono (Kafka / mensageria)** |
|---|---|---|
| **Acoplamento temporal** | Forte — chamador e chamado precisam estar vivos juntos. | Fraco — broker absorve indisponibilidade do consumidor. |
| **Quando** | Precisa da resposta para continuar (query, validação síncrona, request-response do usuário); latência ponta-a-ponta importa; contrato estrito (gRPC/ProtoBuf). | Fire-and-forget, fan-out para N consumidores, picos de carga (buffer), desacoplar produtor/consumidor, event-driven. |
| **Resiliência** | Falha do callee = falha imediata; precisa retry/circuit breaker no cliente. | Broker re-entrega sem ack; retry nativo; suaviza picos (backpressure). |
| **Custo** | Cascata de falhas e latência somada em cadeias longas. | Consistência eventual; ordem global não garantida; precisa idempotência; mais infra (broker). |

**Veredito:** **síncrono quando o resultado é pré-condição** do próximo passo e o
usuário está esperando (use **gRPC** entre serviços internos de alta performance,
**REST** na borda pública). **Assíncrono quando** o trabalho pode terminar
depois, há fan-out, ou você precisa absorver pico e desacoplar — é o que o ledger
faz: comandos chegam por **Kafka** (`conta_criada`, `conta_movimentacao`), e
confirmações saem por tópicos para os read models. Um padrão útil: **começar
síncrono e terminar assíncrono** (trocar `201 Created` por `202 Accepted` e
processar/retentar no broker).

> Fontes: workbook p.282–284 (gRPC: HTTP/2, ProtoBuf, RPCs paralelas, streaming),
> p.294–296 (mensageria e eventos, comunicação assíncrona, desacoplamento),
> p.507–509 (retry assíncrono, 201→202, re-entrega por ack do broker); repo
> `event-source-distributed-ledger` (tópicos Kafka inbound/outbound).

---

## 9. Snapshotting vs. replay puro

Dentro de Event Sourcing, reconstruir o estado (rehydration) significa aplicar a
sequência de eventos. **Replay puro** processa o histórico inteiro do início ao
fim — determinístico e correto, mas fica **caro à medida que a base cresce**
(reconstruir um saldo de 1.000.000 de eventos a cada leitura é proibitivo).

**Snapshotting** cria "pontos de restauração" intermediários: uma fotografia do
estado do agregado + o índice do último evento aplicado. Para reidratar, carrega
o snapshot mais recente e aplica **só os eventos posteriores** a ele. Reduz
drasticamente custo/tempo de leitura. O ponto crítico: **snapshot é artefato
derivado e descartável** — o Event Store continua sendo o single source of truth.

| | **Replay puro** | **Snapshotting** |
|---|---|---|
| **Custo de reconstrução** | Cresce linearmente com o nº de eventos. | Constante-ish: último snapshot + delta de eventos recentes. |
| **Quando** | Agregados com poucos eventos; reconstrução rara; quer simplicidade máxima e zero estado derivado. | Agregados de vida longa e alto volume (saldo, conta com milhões de lançamentos); reidratação frequente. |
| **Complexidade** | Nenhuma extra — só o Event Store. | Gerar/versionar/invalidar snapshots; garantir que não virem "fonte da verdade". |
| **Risco** | Latência/CPU explodem com o crescimento. | Snapshot stale ou tratado como verdade → bug de consistência. |

**Veredito:** **comece com replay puro** — é mais simples e correto por
construção. **Introduza snapshotting quando a reconstrução virar gargalo
medido** (agregado longevo, leitura quente), tirando um snapshot a cada N eventos
(ex. a cada 10.000). Nunca trate o snapshot como verdade: é cache de
performance, o log de eventos manda.

> Fontes: workbook p.490–492 (snapshotting: pontos de restauração, índice do
> último evento, snapshot a cada 10.000 eventos, snapshot é derivado/descartável
> e o Event Store é o single source of truth); repo `event-source-distributed-ledger`
> (Event Store append-only como fonte da verdade).

---

## 10. Circuit breaker vs. retry vs. bulkhead

Três patterns de resiliência frequentemente tratados como intercambiáveis — não
são. Atacam **problemas diferentes** e o melhor sistema usa os três em camadas.

- **Retry:** refaz a requisição diante de falha transitória (intermitência de
  rede, indisponibilidade momentânea). Barato e eficaz para falha *passageira*.
  Perigoso se ingênuo: retries imediatos em massa **agravam** a sobrecarga →
  use **backoff exponencial** (1s, 2s, 4s, 8s…) e **jitter** (aleatoriza para não
  sincronizar a tempestade). Exige **idempotência** no destino.
- **Circuit breaker:** quando a dependência está *consistentemente* falhando,
  "desarma" (estados fechado → aberto → semiaberto) e **para de chamar** por um
  período de resfriamento, dando tempo de recuperação e evitando **cascata**.
  É fail-fast (opcionalmente com fallback).
- **Bulkhead:** **isola recursos** (pools de thread, conexões, filas, shards) por
  domínio/cliente, para que a saturação de um fluxo **não consuma a capacidade
  global**. A essência não é retry/timeout — é a *separação explícita de domínios
  operacionais* (metáfora naval: compartimentos estanques no casco).

| Pattern | Problema que resolve | Quando aplicar | Não resolve |
|---|---|---|---|
| **Retry** | Falha **transitória** e rara. | Intermitência de rede/dependência; com backoff + jitter + idempotência. | Falha persistente (só piora); falta de isolamento. |
| **Circuit breaker** | Falha **persistente** de uma dependência → cascata. | Dependência instável; quer fail-fast e tempo de recuperação. | Não evita a falha; não isola recursos entre fluxos. |
| **Bulkhead** | Um fluxo saturado **derrubando o sistema todo**. | Multi-tenant, fluxos de criticidade diferente, isolamento de blast radius. | Não recupera a chamada; não decide quando re-tentar. |

**Veredito — eles compõem, não competem:**
1. **Retry** (com backoff/jitter) para o soluço passageiro.
2. **Circuit breaker** por cima, para parar de insistir quando a dependência
   *está mesmo* fora — senão o próprio retry vira ataque.
3. **Bulkhead** por baixo de tudo, isolando pools/conexões/shards para que,
   mesmo que retry e breaker falhem, **o estrago fique contido** num compartimento.

Erro clássico de entrevista: aplicar **só retry** ("vou re-tentar") sem breaker
(tempestade de retries) nem bulkhead (a saturação vaza para todos). Diga sempre
os três e em que ordem.

> Fontes: workbook p.504–515 (estratégias de retry: imediato em memória,
> assíncrono, backoff exponencial, jitter; circuit breaker: estados fechado/aberto/
> semiaberto, fail-fast, fallback), p.558–561 (bulkhead: contenção de falha,
> separação de domínios operacionais, pools/filas/conexões/shards, metáfora naval);
> repo `msc-shard-router` (circuit breaker: `CB_FAILURE_THRESHOLD`,
> `CB_OPEN_TIMEOUT_SEC`, `CB_HALF_OPEN_SUCCESS_THRESHOLD`; sharding como bulkhead);
> reference microservices.io patterns/reliability/circuit-breaker.

---

## Tabela-resumo: o reflexo de entrevista

Quando a pergunta cair, esta é a frase de abertura — sempre seguida de "depende
de \<requisito\>".

| Decisão | Escolha A (e quando) | Escolha B (e quando) |
|---|---|---|
| Consistência | **Forte** — dinheiro/estoque/limite, dado errado = prejuízo | **Eventual** — timeline/busca/read model, stale por segundos OK |
| Persistência financeira | **API transacional** — sem requisito de histórico, entrega rápida | **Event Sourcing** — auditoria/rastreabilidade/estorno é requisito |
| CQRS | **Mesmo banco** (view/replica) — começo, um engine basta | **Stores separados** — padrões de acesso divergem, escala de leitura |
| Borda | **API Gateway** — governança/segurança transversal | **BFF** — canais com jornadas distintas (atrás do gateway) |
| Saga | **Orquestração** — fluxo complexo, precisa auditar/metrificar | **Coreografia** — fluxo curto, baixo acoplamento |
| Sharding | **Hash consistente** — espalhar carga, evitar hot partition | **Range/por-cliente** — range query, tiering, isolamento por tenant |
| Engine | **PostgreSQL** (ACID) · escrever certo | **Scylla** (key, escala) / **Mongo** (documento) · ler rápido |
| Comunicação | **Síncrono** (gRPC interno/REST borda) — resposta é pré-condição | **Assíncrono** (Kafka) — fan-out, pico, desacoplar |
| Rehydration | **Replay puro** — poucos eventos, simplicidade | **Snapshotting** — agregado longevo, reidratação cara |
| Resiliência | **Compor os três:** retry (transitório) + circuit breaker (persistente) + bulkhead (isolamento). Nunca só retry. | |

> **Princípio que atravessa tudo (clean architecture pragmática):** introduza a
> opção mais complexa (Event Sourcing, stores separados, BFF, orquestração,
> snapshotting) **só quando um requisito real a pede** — não por dogma. O lado
> "simples" de cada trade-off é o default; o lado "completo" é justificado por
> uma força concreta no sistema (auditoria, escala de leitura, canais distintos,
> volume de eventos). Saber *quando não* aplicar o pattern caro é o que separa
> sênior de staff.
