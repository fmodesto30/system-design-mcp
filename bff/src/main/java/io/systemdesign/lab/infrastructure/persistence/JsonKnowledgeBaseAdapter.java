package io.systemdesign.lab.infrastructure.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.systemdesign.lab.domain.model.Diagram;
import io.systemdesign.lab.domain.model.Evidence;
import io.systemdesign.lab.domain.model.Flow;
import io.systemdesign.lab.domain.model.InterviewQuestion;
import io.systemdesign.lab.domain.model.Pattern;
import io.systemdesign.lab.domain.model.Topic;
import io.systemdesign.lab.domain.port.KnowledgeBasePort;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Outbound adapter: loads the knowledge base from JSON once at startup and caches it in memory.
 *
 * <p>Source resolution:
 * <ul>
 *   <li>if {@code sdsl.knowledge-base.dir} is set, read the files from that filesystem directory
 *       (lets you edit content live without rebuilding);</li>
 *   <li>otherwise read the classpath copy packaged from {@code ../knowledge-base} at build time.</li>
 * </ul>
 * A missing file degrades to an empty list with a warning, so the app still boots — the
 * integrity test is what fails the build if real content is absent.
 */
@Repository
public class JsonKnowledgeBaseAdapter implements KnowledgeBasePort {

    private static final Logger log = LoggerFactory.getLogger(JsonKnowledgeBaseAdapter.class);

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;
    private final String configuredDir;

    private List<Topic> topics = List.of();
    private List<Pattern> patterns = List.of();
    private List<Flow> flows = List.of();
    private List<InterviewQuestion> interviewQuestions = List.of();
    private List<Diagram> diagrams = List.of();
    private List<Evidence> evidence = List.of();

    public JsonKnowledgeBaseAdapter(ResourceLoader resourceLoader,
                                    ObjectMapper objectMapper,
                                    @Value("${sdsl.knowledge-base.dir:}") String configuredDir) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
        this.configuredDir = configuredDir;
    }

    @PostConstruct
    void load() {
        String origin = StringUtils.hasText(configuredDir) ? ("dir=" + configuredDir) : "classpath:knowledge-base/";
        log.info("Loading knowledge base from {}", origin);
        topics = read("topics.json", new TypeReference<>() {});
        patterns = read("patterns.json", new TypeReference<>() {});
        flows = read("flows.json", new TypeReference<>() {});
        interviewQuestions = read("interview-questions.json", new TypeReference<>() {});
        diagrams = read("diagrams.json", new TypeReference<>() {});
        evidence = read("evidence.json", new TypeReference<>() {});
        log.info("Knowledge base loaded: topics={} patterns={} flows={} questions={} diagrams={} evidence={}",
                topics.size(), patterns.size(), flows.size(), interviewQuestions.size(),
                diagrams.size(), evidence.size());
    }

    private <T> List<T> read(String fileName, TypeReference<List<T>> type) {
        String location = StringUtils.hasText(configuredDir)
                ? "file:" + configuredDir + "/" + fileName
                : "classpath:knowledge-base/" + fileName;
        Resource resource = resourceLoader.getResource(location);
        if (!resource.exists()) {
            log.warn("Knowledge base file not found: {} — serving empty list", location);
            return List.of();
        }
        try (InputStream in = resource.getInputStream()) {
            List<T> parsed = objectMapper.readValue(in, type);
            return parsed == null ? List.of() : List.copyOf(parsed);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read knowledge base file: " + location, e);
        }
    }

    @Override
    public List<Topic> topics() {
        return topics;
    }

    @Override
    public List<Pattern> patterns() {
        return patterns;
    }

    @Override
    public List<Flow> flows() {
        return flows;
    }

    @Override
    public List<InterviewQuestion> interviewQuestions() {
        return interviewQuestions;
    }

    @Override
    public List<Diagram> diagrams() {
        return diagrams;
    }

    @Override
    public List<Evidence> evidence() {
        return evidence;
    }
}
