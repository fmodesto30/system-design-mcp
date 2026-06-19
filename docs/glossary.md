# Glossário — System Design Specialist Lab

> Glossário PT-BR dos termos centrais do *System Design Workbook* (Matheus Fidelis) e
> das três implementações de referência (`msc-shard-router`, `msc-transactions-api`,
> `event-source-distributed-ledger`). Cada verbete traz uma referência curta à fonte:
> `p.N` aponta para a página do workbook; `repo:<nome>` aponta para o repositório.
> Ordenado alfabeticamente. Use como apoio rápido de estudo/entrevista — os
> detalhes profundos vivem nos tópicos, padrões e fluxos da base de conhecimento.

---

## A

**ACID** — Conjunto de garantias transacionais clássicas (Atomicity, Consistency,
Isolation, Durability) típicas de bancos relacionais: a transação é atômica, leva o
banco de um estado consistente a outro, isola concorrência e persiste de forma durável.
É o polo de forte consistência no trade-off contra BASE. *(p.74)*

**ACID vs BASE** — Eixo de decisão entre consistência forte (SQL/ACID) e
disponibilidade com consistência eventual (NoSQL/BASE); a escolha define o
comportamento do sistema sob carga e partição. *(p.73)*

**API Gateway** — Ponto de entrada único que fica à frente dos microsserviços e
centraliza roteamento, autenticação, rate limiting, agregação e versionamento de APIs,
desacoplando o cliente da topologia interna. No ledger de referência o Kong faz esse
papel. *(p.185; repo:event-source-distributed-ledger — kong/)*

## B

**Backend for Frontend (BFF)** — Camada de backend dedicada a um canal/cliente
específico (web, mobile, parceiro), que compõe e adapta respostas sob medida em vez de
expor uma API genérica para todos. Segrega canais e reduz o blast radius entre
experiências. *(p.202)*

**Backpressure** — Mecanismo de "repressão" em que um componente sobrecarregado
sinaliza ao produtor para reduzir o ritmo (ou rejeita/enfileira), protegendo o sistema
contra colapso quando a demanda excede a capacidade. É resiliência por contenção de
fluxo. *(p.522)*

**BASE** — Modelo de garantias relaxadas (Basically Available, Soft State, Eventual
Consistency) comum em NoSQL distribuído: prioriza disponibilidade e tolerância a
partição, aceitando que réplicas convergem "em algum momento". Polo oposto ao ACID.
*(p.78)*

**Blast Radius** — "Raio de explosão": o alcance do impacto de uma falha — quantos
clientes/serviços são afetados quando algo quebra. Reduzir o blast radius (via
bulkheads, sharding, células) é o objetivo central de várias estratégias de
resiliência. *(p.500)*

**Blue-Green Deployment** — Estratégia que mantém dois ambientes idênticos (azul =
atual, verde = nova versão); o tráfego é chaveado de uma vez para o verde após
validação, permitindo rollback instantâneo voltando o switch para o azul. *(p.597)*

**Broken Windows (Janelas Quebradas)** — Analogia da criminologia aplicada a software:
pequenos defeitos tolerados (gambiarras, code smells, TODOs) sinalizam descuido e
convidam a mais degradação, corroendo a qualidade do sistema ao longo do tempo.
*(p.19)*

**Bulkhead Pattern** — Isolamento de recursos em "compartimentos estanques" (como no
casco de um navio) — pools de conexão, threads ou instâncias separados por
cliente/função — para que a falha ou exaustão de um compartimento não afunde o sistema
inteiro. *(p.528, p.558)*

## C

**Canary Release** — Liberação gradual em que a nova versão recebe uma porcentagem
pequena e crescente do tráfego real; métricas são observadas a cada incremento e o
rollback é rápido se algo degradar. *(p.599)*

**CAP (Teorema)** — Em um sistema distribuído sujeito a partição de rede (P), não é
possível ter simultaneamente Consistência (C) e Disponibilidade (A) plenas — durante a
partição é preciso "escolher 2", sacrificando C ou A. *(p.72, p.82)*

**Cell-Based Architecture (Arquitetura Celular)** — Particiona o sistema em células
autossuficientes e isoladas (cada uma com sua stack e estado), roteando cada cliente
para uma célula fixa; a falha de uma célula atinge só sua fatia, minimizando o blast
radius. *(p.576)*

**Circuit Breaker** — Disjuntor de software com três estados (fechado, aberto,
meio-aberto): após acumular falhas de uma dependência, "abre" e passa a falhar rápido
em vez de esperar timeouts, dando tempo para a dependência se recuperar. O shard-router
usa limiares configuráveis. *(p.501ss; repo:msc-shard-router — CB_FAILURE_THRESHOLD)*

**Command Side (lado de comando)** — No CQRS, o caminho de escrita: recebe comandos que
mutam o estado, aplica invariantes/regras de negócio e persiste (em event sourcing,
grava eventos no Event Store). Separado fisicamente do lado de leitura. *(p.420)*

**Compensação (Compensating Transaction)** — No Saga, ação que desfaz semanticamente um
passo já confirmado quando um passo posterior falha (ex.: estornar um débito), já que
não há rollback global em transações distribuídas. *(p.465)*

**Consistência Eventual (Eventual Consistency)** — Garantia de que, na ausência de
novas escritas, todas as réplicas convergem para o mesmo valor "em algum momento"; aceita
janelas de divergência em troca de disponibilidade e latência. É o regime dos read
models do ledger. *(p.78; repo:event-source-distributed-ledger)*

**Consistent Hashing (Hash Consistente)** — Técnica de distribuição em que chaves e
nós são mapeados num anel; adicionar/remover um shard remapeia apenas uma fração das
chaves, mantendo estabilidade. O shard-router usa SHA-512 com réplicas virtuais e busca
binária O(log n). *(repo:msc-shard-router — pkg/hashring/)*

**Compensation Log / Saga Log** — Registro durável dos passos executados e pendentes de
uma saga, usado para rastreabilidade e para reiniciar/compensar a transação após uma
falha. *(p.463)*

**CQRS (Command Query Responsibility Segregation)** — Separação dos modelos de escrita
(command) e de leitura (query) em caminhos/armazenamentos distintos, otimizando cada um
isoladamente; muito usado junto de Event Sourcing. *(p.420)*

## D

**Disaster Recovery (DR)** — Conjunto de estratégias e processos para restaurar o
sistema após um desastre (perda de região, datacenter), guiado por metas de RPO/RTO e
KPIs de recuperação como MTTR. *(p.673)*

**Dual Write** — Antipadrão em que a aplicação escreve em dois sistemas (ex.: banco +
fila) em chamadas separadas, sem atomicidade; se uma falha após a outra, os sistemas
ficam inconsistentes. Resolvido por Transactional Outbox ou commit pós-evento.
*(p.467; repo:event-source-distributed-ledger)*

## E

**Event Sourcing** — Persistir o estado como uma sequência imutável e append-only de
eventos (fatos ocorridos), em vez de sobrescrever o estado atual; o estado é derivado
reproduzindo os eventos. *(p.475)*

**Event Store** — Armazenamento append-only que é a fonte da verdade dos eventos; no
ledger é uma tabela `events` em Postgres com `aggregate_id`, `version`, `event_type` e
`event_data` (JSONB) e `UNIQUE(aggregate_id, version)` garantindo ordem. *(p.478;
repo:event-source-distributed-ledger — events table)*

## F

**Feature Flag** — Chave de configuração que liga/desliga um caminho de código em
runtime sem novo deploy, permitindo releases progressivos, testes A/B e rollback lógico
de funcionalidades. *(p.604)*

**Four Golden Signals** — Os quatro sinais de ouro do Google SRE — latência, tráfego,
erros e saturação — como conjunto mínimo a monitorar em qualquer serviço voltado a
usuário. *(p.555)*

## G

**Graceful Degradation** — Degradação graciosa: sob falha ou sobrecarga o sistema
preserva o núcleo funcional e abre mão de recursos secundários (ex.: serve cache stale,
desliga features), em vez de cair por completo. *(p.520)*

## H

**Health Check (API)** — Endpoint que reporta a saúde da instância (vivo/pronto), usado
por load balancers e orquestradores para tirar instâncias doentes de rotação. O
shard-router expõe `/healthz`. *(repo:msc-shard-router — /healthz; ref:health-check-api)*

**Hot Partition** — Partição/shard que recebe carga desproporcional por má escolha da
sharding key (chave de baixa cardinalidade ou enviesada), virando gargalo enquanto
outras ficam ociosas. *(p.377)*

## I

**Idempotência** — Propriedade de uma operação produzir o mesmo efeito se aplicada uma
ou várias vezes; essencial em mensageria "pelo menos uma vez" para tolerar
reprocessamento. No ledger, `movimentacao_id` único e o erro 11000 ignorado no Mongo
garantem isso. *(p.494; repo:event-source-distributed-ledger)*

## L

**Last-Write-Wins (LWW)** — Estratégia de resolução de conflito em que, entre escritas
concorrentes, prevalece a de maior versão/timestamp; usada para garantir ordem em
consistência eventual. No read model Scylla é aplicado com LWT (`UPDATE ... IF version
< ?`). *(p.492; repo:event-source-distributed-ledger)*

**Lease Pattern** — Concessão temporária e renovável de um recurso/lock por um prazo
(lease); se o detentor não renovar, o lease expira e outro pode assumir, evitando locks
órfãos em sistemas distribuídos. *(p.530)*

**Lei de Little (Little's Law)** — Relação `L = λ × W`: o número médio de itens num
sistema (L) é igual à taxa de chegada (λ) vezes o tempo médio de permanência (W). Base
para dimensionar concorrência, filas e o "ponto saudável" de capacidade. *(p.612)*

**Load Balancer (Balanceador de Carga)** — Componente que distribui requisições entre
várias instâncias (por algoritmos como round-robin, least connections), atuando na
camada 4 ou 7, eliminando ponto único e melhorando vazão e disponibilidade. *(p.162)*

**LWT (Lightweight Transaction)** — Transação leve com condicional do Cassandra/Scylla
(ex.: `INSERT IF NOT EXISTS`, `UPDATE ... IF version < ?`) que usa Paxos para aplicar a
escrita só se a condição for verdadeira, garantindo idempotência e ordem. *(p.492;
repo:event-source-distributed-ledger — balance/)*

## M

**MTTR (Mean Time to Repair)** — Tempo médio para detectar e resolver um incidente;
métrica-chave de DR — quanto menor, mais rápido o sistema volta. *(p.678; p.676)*

## O

**Observabilidade** — Capacidade de inferir o estado interno do sistema a partir de
suas saídas (métricas, logs e traces — os três pilares), indo além do monitoramento de
sintomas conhecidos para investigar o desconhecido. *(p.534, p.538)*

**Optimistic Locking (Bloqueio Otimista)** — Controle de concorrência sem locks
pessimistas: cada agregado carrega uma `version` e a escrita só é aceita se a versão
esperada bater, detectando conflito no commit. É o que a coluna `version` do Event Store
do ledger implementa. *(repo:event-source-distributed-ledger — version per aggregate)*

## P

**PACELC** — Extensão do CAP (Daniel Abadi, 2010): se houver Partição (P), escolha
entre Availability e Consistency; **Else** (E), em operação normal, escolha entre
Latency (L) e Consistency (C). Expõe o trade-off latência×consistência que o CAP ignora.
*(p.88)*

## Q

**Query Side (lado de consulta)** — No CQRS, o caminho de leitura: serve consultas a
partir de read models otimizados e desnormalizados, sem tocar nas regras de escrita.
No ledger, as APIs de saldo (Scylla) e extrato (Mongo). *(p.420;
repo:event-source-distributed-ledger — balance-api/, statement-api/)*

## R

**Read Model (Modelo de Leitura)** — Projeção desnormalizada e otimizada para consulta,
construída de forma assíncrona a partir dos eventos/escritas; pode haver vários por
caso de uso. No ledger: saldo em ScyllaDB e extrato em MongoDB. *(p.433;
repo:event-source-distributed-ledger)*

**Rehydration (Reconstituição de Estado)** — Reconstruir o estado atual de um agregado
reproduzindo (replay) sua sequência de eventos desde o início (ou desde um snapshot);
é como Event Sourcing materializa o estado em memória. *(p.489)*

**RED Method** — Framework de métricas focado em serviços de request: Rate (taxa de
requisições), Errors (taxa de erros) e Duration (latência). Complementa o USE Method
(que olha recursos). *(p.553)*

**RPO (Recovery Point Objective)** — Quantidade máxima aceitável de dados perdidos em um
desastre, medida em tempo (ex.: "no máximo 2h"); define a frequência mínima de
backup/replicação. *(p.676)*

**RTO (Recovery Time Objective)** — Tempo máximo aceitável para restaurar o serviço após
um desastre (ex.: "até 1h"); junto do RPO define a meta de DR. *(p.676)*

## S

**Saga** — Padrão para transações distribuídas/longas como uma sequência de transações
locais, cada uma com sua compensação; em vez de um commit global (2PC), garante
consistência por orquestração ou coreografia + compensações. *(p.449)*

**Scale Cube (Cubo da Escalabilidade)** — Modelo de três eixos para escalar: X =
clonagem/replicação horizontal, Y = decomposição por função/serviço, Z =
particionamento/sharding por dados. Ajuda a escolher a dimensão certa de escala.
*(p.366)*

**Service Mesh** — Camada de infraestrutura (geralmente sidecars como Envoy) que
gerencia a comunicação serviço-a-serviço — mTLS, retries, circuit breaking,
observabilidade — fora do código da aplicação, separando data plane e control plane.
*(p.210)*

**Sharding (Particionamento)** — Dividir dados/carga horizontalmente em partições
(shards) independentes para escalar além dos limites de um único nó; cada shard
guarda um subconjunto determinado por uma sharding key. *(p.372)*

**SLA (Service Level Agreement)** — Acordo contratual de nível de serviço com cliente,
com penalidades; é a promessa externa (ex.: 99,9% de disponibilidade) sustentada
internamente por SLOs. *(p.548)*

**SLI (Service Level Indicator)** — Métrica concreta que mede um aspecto do serviço
(ex.: % de requisições < 300ms); é o número medido que alimenta o SLO. *(p.548)*

**SLO (Service Level Objective)** — Meta interna sobre um SLI (ex.: "99,5% das leituras
< 200ms no mês"); mais rígida que o SLA e usada para acionar alertas/error budget.
*(p.548)*

**Snapshot (Snapshotting)** — Em Event Sourcing, ponto de restauração com o estado
materializado numa versão, para evitar reproduzir todos os eventos desde o início na
rehydration; acelera a reconstituição de agregados com histórico longo. *(p.490)*

**SPOF (Single Point of Failure)** — Componente único cuja falha derruba o sistema
inteiro por não ter redundância; identificá-los e eliminá-los (réplicas, failover) é
pré-requisito de alta disponibilidade. *(p.667)*

## T

**Transactional Outbox** — Em vez de dual write, grava o evento numa tabela `outbox` na
**mesma transação** do dado de negócio; um publisher separado lê a outbox e publica na
mensageria, garantindo atomicidade entre estado e evento. *(p.475/p.467 — Outbox vs
Dual Write)*

## U

**USE Method** — Framework de Brendan Gregg para diagnosticar recursos: para cada
recurso, medir Utilization (utilização), Saturation (saturação) e Errors (erros).
Complementa o RED (que olha requests). *(p.551)*
