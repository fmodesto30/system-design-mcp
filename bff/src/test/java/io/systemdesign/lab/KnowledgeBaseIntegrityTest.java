package io.systemdesign.lab;

import io.systemdesign.lab.domain.model.Database;
import io.systemdesign.lab.domain.model.DatabaseRecommendation;
import io.systemdesign.lab.domain.model.Diagram;
import io.systemdesign.lab.domain.model.Evidence;
import io.systemdesign.lab.domain.model.Flow;
import io.systemdesign.lab.domain.model.InterviewQuestion;
import io.systemdesign.lab.domain.model.Pattern;
import io.systemdesign.lab.domain.model.SourceRef;
import io.systemdesign.lab.domain.model.Topic;
import io.systemdesign.lab.domain.port.KnowledgeBasePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The grounding guard. Loads the real knowledge base and fails the build if:
 * <ul>
 *   <li>any collection is empty;</li>
 *   <li>any factual item lacks a valid {@link SourceRef} ("no claim without a source");</li>
 *   <li>any cross-reference (relatedPatterns / relatedTopics / diagrams) points to a missing id;</li>
 *   <li>the required pattern catalog or the 30 interview questions are incomplete.</li>
 * </ul>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class KnowledgeBaseIntegrityTest {

    /** The 18 patterns the spec requires to be mapped, plus the 3 book-driven extras. */
    private static final List<String> REQUIRED_PATTERNS = List.of(
            "database-per-service", "saga", "api-composition", "cqrs", "domain-event", "event-sourcing",
            "transactional-outbox", "polling-publisher", "transaction-log-tailing", "idempotent-consumer",
            "api-gateway", "backend-for-frontend", "circuit-breaker", "health-check-api",
            "application-metrics", "distributed-tracing", "audit-logging",
            "consistent-hashing", "bulkhead", "cell-based-architecture");

    @Autowired
    KnowledgeBasePort kb;

    @Test
    void collectionsAreNonEmpty() {
        assertThat(kb.topics()).as("topics").isNotEmpty();
        assertThat(kb.patterns()).as("patterns").isNotEmpty();
        assertThat(kb.flows()).as("flows").isNotEmpty();
        assertThat(kb.interviewQuestions()).as("interview questions").isNotEmpty();
        assertThat(kb.diagrams()).as("diagrams").isNotEmpty();
        assertThat(kb.evidence()).as("evidence").isNotEmpty();
        assertThat(kb.databases()).as("databases").isNotEmpty();
    }

    @Test
    void everyItemHasAtLeastOneValidSourceRef() {
        kb.topics().forEach(t -> assertHasSource("topic:" + t.id(), t.sourceRefs()));
        kb.patterns().forEach(p -> assertHasSource("pattern:" + p.id(), p.sourceRefs()));
        kb.flows().forEach(f -> assertHasSource("flow:" + f.id(), f.sourceRefs()));
        kb.interviewQuestions().forEach(q -> assertHasSource("question:" + q.id(), q.sourceRefs()));
        kb.diagrams().forEach(d -> assertHasSource("diagram:" + d.id(), d.sourceRefs()));
        kb.evidence().forEach(e -> assertHasSource("evidence:" + e.id(), e.sourceRefs()));
        kb.databases().forEach(d -> assertHasSource("database:" + d.id(), d.sourceRefs()));
    }

    @Test
    void requiredPatternsArePresent() {
        Set<String> ids = kb.patterns().stream().map(Pattern::id).collect(Collectors.toSet());
        assertThat(ids).as("required microservices.io patterns + book extras").containsAll(REQUIRED_PATTERNS);
    }

    @Test
    void hasAtLeastThirtyInterviewQuestions() {
        assertThat(kb.interviewQuestions()).as("interview questions count").hasSizeGreaterThanOrEqualTo(30);
    }

    @Test
    void aiGlossaryIsPresentAndSourced() {
        // Separate track: not subject to the workbook-sourcing rule, but every entry still cites a source.
        assertThat(kb.aiGlossary()).as("ai glossary").isNotEmpty();
        kb.aiGlossary().forEach(g -> assertHasSource("ai:" + g.id(), g.sourceRefs()));
    }

    @Test
    void idsAreUniqueWithinEachCollection() {
        assertUniqueIds("topics", kb.topics().stream().map(Topic::id).toList());
        assertUniqueIds("patterns", kb.patterns().stream().map(Pattern::id).toList());
        assertUniqueIds("flows", kb.flows().stream().map(Flow::id).toList());
        assertUniqueIds("questions", kb.interviewQuestions().stream().map(InterviewQuestion::id).toList());
        assertUniqueIds("diagrams", kb.diagrams().stream().map(Diagram::id).toList());
        assertUniqueIds("evidence", kb.evidence().stream().map(Evidence::id).toList());
        assertUniqueIds("ai-glossary", kb.aiGlossary().stream().map(g -> g.id()).toList());
        assertUniqueIds("databases", kb.databases().stream().map(Database::id).toList());
    }

    @Test
    void crossReferencesResolve() {
        Set<String> topicIds = kb.topics().stream().map(Topic::id).collect(Collectors.toSet());
        Set<String> patternIds = kb.patterns().stream().map(Pattern::id).collect(Collectors.toSet());
        Set<String> diagramIds = kb.diagrams().stream().map(Diagram::id).collect(Collectors.toSet());
        Set<String> databaseIds = kb.databases().stream().map(Database::id).collect(Collectors.toSet());

        for (Topic t : kb.topics()) {
            assertSubset("topic:" + t.id() + ".relatedPatterns", t.relatedPatterns(), patternIds);
            assertSubset("topic:" + t.id() + ".relatedTopics", t.relatedTopics(), topicIds);
            assertSubset("topic:" + t.id() + ".diagrams", t.diagrams(), diagramIds);
        }
        for (Pattern p : kb.patterns()) {
            assertSubset("pattern:" + p.id() + ".relatedPatterns", p.relatedPatterns(), patternIds);
            assertSubset("pattern:" + p.id() + ".diagrams", p.diagrams(), diagramIds);
        }
        for (Flow f : kb.flows()) {
            assertSubset("flow:" + f.id() + ".relatedPatterns", f.relatedPatterns(), patternIds);
            if (f.diagram() != null && !f.diagram().isBlank()) {
                assertThat(diagramIds).as("flow:" + f.id() + ".diagram").contains(f.diagram());
            }
        }
        for (InterviewQuestion q : kb.interviewQuestions()) {
            assertSubset("question:" + q.id() + ".patterns", q.patterns(), patternIds);
            assertSubset("question:" + q.id() + ".relatedTopics", q.relatedTopics(), topicIds);
            assertSubset("question:" + q.id() + ".diagrams", q.diagrams(), diagramIds);
        }
        for (Diagram d : kb.diagrams()) {
            assertThat(d.mermaid()).as("diagram:" + d.id() + ".mermaid").isNotBlank();
        }
        for (Evidence e : kb.evidence()) {
            assertSubset("evidence:" + e.id() + ".relatedPatterns", e.relatedPatterns(), patternIds);
        }
        for (Database d : kb.databases()) {
            assertSubset("database:" + d.id() + ".relatedPatterns", d.relatedPatterns(), patternIds);
            assertSubset("database:" + d.id() + ".relatedTopics", d.relatedTopics(), topicIds);
            assertSubset("database:" + d.id() + ".diagrams", d.diagrams(), diagramIds);
        }
        // Pré-sugestões de banco apontam para um Database real.
        kb.topics().forEach(t -> assertDbRec("topic:" + t.id(), t.databaseRecommendation(), databaseIds));
        kb.patterns().forEach(p -> assertDbRec("pattern:" + p.id(), p.databaseRecommendation(), databaseIds));
        kb.flows().forEach(f -> assertDbRec("flow:" + f.id(), f.databaseRecommendation(), databaseIds));
    }

    private static void assertHasSource(String who, List<SourceRef> refs) {
        assertThat(refs).as(who + " sourceRefs").isNotEmpty();
        boolean anyValid = refs.stream().anyMatch(r ->
                notBlank(r.kind()) && notBlank(r.source()) && notBlank(r.locator()));
        assertThat(anyValid).as(who + " has a sourceRef with kind+source+locator").isTrue();
    }

    private static void assertSubset(String who, List<String> refs, Set<String> universe) {
        for (String ref : refs) {
            assertThat(universe).as(who + " -> '" + ref + "'").contains(ref);
        }
    }

    private static void assertUniqueIds(String coll, List<String> ids) {
        Set<String> seen = new HashSet<>();
        List<String> dups = ids.stream().filter(id -> !seen.add(id)).distinct().toList();
        assertThat(dups).as(coll + " duplicate ids").isEmpty();
    }

    private static void assertDbRec(String who, DatabaseRecommendation rec, Set<String> databaseIds) {
        if (rec != null && rec.suggestedDbId() != null && !rec.suggestedDbId().isBlank()) {
            assertThat(databaseIds).as(who + ".databaseRecommendation -> '" + rec.suggestedDbId() + "'")
                    .contains(rec.suggestedDbId());
        }
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
