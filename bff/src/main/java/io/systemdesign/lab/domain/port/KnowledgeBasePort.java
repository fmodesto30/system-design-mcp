package io.systemdesign.lab.domain.port;

import io.systemdesign.lab.domain.model.Database;
import io.systemdesign.lab.domain.model.Diagram;
import io.systemdesign.lab.domain.model.Evidence;
import io.systemdesign.lab.domain.model.Flow;
import io.systemdesign.lab.domain.model.GlossaryEntry;
import io.systemdesign.lab.domain.model.InterviewQuestion;
import io.systemdesign.lab.domain.model.Pattern;
import io.systemdesign.lab.domain.model.Topic;

import java.util.List;

/**
 * Outbound port: the source of the knowledge base. The domain/application layers depend on this
 * interface; the infrastructure provides an adapter (JSON files today, could be a DB tomorrow)
 * without the inner layers knowing.
 */
public interface KnowledgeBasePort {

    List<Topic> topics();

    List<Pattern> patterns();

    List<Flow> flows();

    List<InterviewQuestion> interviewQuestions();

    List<Diagram> diagrams();

    List<Evidence> evidence();

    /** Catálogo de bancos de dados AWS (preço, CAP/PACELC, failover) — alimenta o decisor de bancos. */
    List<Database> databases();

    /** AI &amp; Agents glossary — separate track, sourced to AI references (not the workbook). */
    List<GlossaryEntry> aiGlossary();
}
