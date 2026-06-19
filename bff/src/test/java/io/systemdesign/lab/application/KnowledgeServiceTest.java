package io.systemdesign.lab.application;

import io.systemdesign.lab.domain.model.Diagram;
import io.systemdesign.lab.domain.model.Evidence;
import io.systemdesign.lab.domain.model.Flow;
import io.systemdesign.lab.domain.model.InterviewQuestion;
import io.systemdesign.lab.domain.model.Pattern;
import io.systemdesign.lab.domain.model.SourceRef;
import io.systemdesign.lab.domain.model.Topic;
import io.systemdesign.lab.domain.port.KnowledgeBasePort;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Pure unit test of the use cases with an in-memory fake port — no Spring, no files. */
class KnowledgeServiceTest {

    private static final SourceRef SRC = new SourceRef("pdf", "System Design Workbook", "p.420", null);

    private final KnowledgeBasePort fakePort = new KnowledgeBasePort() {
        @Override
        public List<Topic> topics() {
            return List.of(new Topic("cqrs", "CQRS", "Dados", "sep leitura/escrita", "...",
                    null, null, null, null, null, null, List.of(SRC)));
        }

        @Override
        public List<Pattern> patterns() {
            return List.of(new Pattern("saga", "Saga", "Data", "txn distribuída", "compensação",
                    null, null, null, null, null, null, null, null, List.of(SRC)));
        }

        @Override
        public List<Flow> flows() {
            return List.of();
        }

        @Override
        public List<InterviewQuestion> interviewQuestions() {
            return List.of();
        }

        @Override
        public List<Diagram> diagrams() {
            return List.of();
        }

        @Override
        public List<Evidence> evidence() {
            return List.of();
        }
    };

    private final KnowledgeService service = new KnowledgeService(fakePort);

    @Test
    void returnsTopicWhenIdExists() {
        assertThat(service.getTopic("cqrs").title()).isEqualTo("CQRS");
    }

    @Test
    void throwsNotFoundWhenTopicIdMissing() {
        assertThatThrownBy(() -> service.getTopic("does-not-exist"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Topic");
    }

    @Test
    void throwsNotFoundWhenPatternIdMissing() {
        assertThatThrownBy(() -> service.getPattern("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void statsCountEntities() {
        KnowledgeService.KnowledgeStats stats = service.stats();
        assertThat(stats.topics()).isEqualTo(1);
        assertThat(stats.patterns()).isEqualTo(1);
        assertThat(stats.flows()).isZero();
    }
}
