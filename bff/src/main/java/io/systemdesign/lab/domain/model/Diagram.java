package io.systemdesign.lab.domain.model;

import java.util.List;

/** A Mermaid diagram with its source. The {@code mermaid} field holds raw Mermaid source. */
public record Diagram(
        String id,
        String title,
        String description,
        String mermaid,
        List<String> relatedTopics,
        List<String> relatedPatterns,
        List<SourceRef> sourceRefs) {

    public Diagram {
        relatedTopics = relatedTopics == null ? List.of() : List.copyOf(relatedTopics);
        relatedPatterns = relatedPatterns == null ? List.of() : List.copyOf(relatedPatterns);
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }
}
