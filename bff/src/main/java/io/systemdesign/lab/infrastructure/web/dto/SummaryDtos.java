package io.systemdesign.lab.infrastructure.web.dto;

import io.systemdesign.lab.domain.model.Diagram;
import io.systemdesign.lab.domain.model.Flow;
import io.systemdesign.lab.domain.model.InterviewQuestion;
import io.systemdesign.lab.domain.model.Pattern;
import io.systemdesign.lab.domain.model.Topic;

/**
 * Lightweight list-view DTOs, kept separate from the domain so list endpoints don't ship the heavy
 * long-form fields (e.g. detailedExplanation). Detail endpoints return the full domain object.
 */
public final class SummaryDtos {

    private SummaryDtos() {
    }

    public record TopicSummary(String id, String title, String category, String summary) {
        public static TopicSummary from(Topic t) {
            return new TopicSummary(t.id(), t.title(), t.category(), t.summary());
        }
    }

    public record PatternSummary(String id, String name, String category, String problem) {
        public static PatternSummary from(Pattern p) {
            return new PatternSummary(p.id(), p.name(), p.category(), p.problem());
        }
    }

    public record FlowSummary(String id, String title, String summary) {
        public static FlowSummary from(Flow f) {
            return new FlowSummary(f.id(), f.title(), f.summary());
        }
    }

    public record QuestionSummary(String id, String question, String difficulty) {
        public static QuestionSummary from(InterviewQuestion q) {
            return new QuestionSummary(q.id(), q.question(), q.difficulty());
        }
    }

    public record DiagramSummary(String id, String title, String description) {
        public static DiagramSummary from(Diagram d) {
            return new DiagramSummary(d.id(), d.title(), d.description());
        }
    }
}
