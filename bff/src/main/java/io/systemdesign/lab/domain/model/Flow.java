package io.systemdesign.lab.domain.model;

import java.util.List;

/** A step-by-step architectural flow, typically derived from one of the reference repositories. */
public record Flow(
        String id,
        String title,
        String summary,
        List<String> components,
        List<Step> steps,
        List<String> relatedPatterns,
        String diagram,
        List<SourceRef> sourceRefs) {

    public Flow {
        components = components == null ? List.of() : List.copyOf(components);
        steps = steps == null ? List.of() : List.copyOf(steps);
        relatedPatterns = relatedPatterns == null ? List.of() : List.copyOf(relatedPatterns);
        sourceRefs = sourceRefs == null ? List.of() : List.copyOf(sourceRefs);
    }

    /** One ordered step of a flow. */
    public record Step(int order, String actor, String action, String note) {
    }
}
