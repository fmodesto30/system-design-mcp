package io.systemdesign.lab.application;

import io.systemdesign.lab.domain.model.Diagram;
import io.systemdesign.lab.domain.model.Evidence;
import io.systemdesign.lab.domain.model.Flow;
import io.systemdesign.lab.domain.model.InterviewQuestion;
import io.systemdesign.lab.domain.model.Pattern;
import io.systemdesign.lab.domain.model.Topic;
import io.systemdesign.lab.domain.port.KnowledgeBasePort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

/**
 * Application service: the intentions of the Lab (query the knowledge base). It orchestrates the
 * outbound port and turns "missing id" into a typed domain error. Stateless and read-only.
 */
@Service
public class KnowledgeService {

    private final KnowledgeBasePort knowledgeBase;

    public KnowledgeService(KnowledgeBasePort knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
    }

    // ---- Topics ----
    public List<Topic> listTopics() {
        return knowledgeBase.topics();
    }

    public Topic getTopic(String id) {
        return findById(knowledgeBase.topics(), Topic::id, id, "Topic");
    }

    // ---- Patterns ----
    public List<Pattern> listPatterns() {
        return knowledgeBase.patterns();
    }

    public Pattern getPattern(String id) {
        return findById(knowledgeBase.patterns(), Pattern::id, id, "Pattern");
    }

    // ---- Flows ----
    public List<Flow> listFlows() {
        return knowledgeBase.flows();
    }

    public Flow getFlow(String id) {
        return findById(knowledgeBase.flows(), Flow::id, id, "Flow");
    }

    // ---- Interview questions ----
    public List<InterviewQuestion> listInterviewQuestions() {
        return knowledgeBase.interviewQuestions();
    }

    public InterviewQuestion getInterviewQuestion(String id) {
        return findById(knowledgeBase.interviewQuestions(), InterviewQuestion::id, id, "InterviewQuestion");
    }

    // ---- Diagrams ----
    public List<Diagram> listDiagrams() {
        return knowledgeBase.diagrams();
    }

    public Diagram getDiagram(String id) {
        return findById(knowledgeBase.diagrams(), Diagram::id, id, "Diagram");
    }

    // ---- Evidence ----
    public List<Evidence> listEvidence() {
        return knowledgeBase.evidence();
    }

    /** Counts used by the frontend home page. */
    public KnowledgeStats stats() {
        return new KnowledgeStats(
                knowledgeBase.topics().size(),
                knowledgeBase.patterns().size(),
                knowledgeBase.flows().size(),
                knowledgeBase.interviewQuestions().size(),
                knowledgeBase.diagrams().size(),
                knowledgeBase.evidence().size());
    }

    private static <T> T findById(List<T> items, Function<T, String> idOf, String id, String type) {
        Optional<T> match = items.stream().filter(it -> id.equals(idOf.apply(it))).findFirst();
        return match.orElseThrow(() -> new ResourceNotFoundException(type, id));
    }

    /** Aggregate counts of the knowledge base. */
    public record KnowledgeStats(int topics, int patterns, int flows, int interviewQuestions,
                                 int diagrams, int evidence) {
    }
}
