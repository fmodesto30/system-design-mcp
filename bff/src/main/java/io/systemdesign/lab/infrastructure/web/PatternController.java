package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.Pattern;
import io.systemdesign.lab.infrastructure.web.dto.SummaryDtos.PatternSummary;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// NOTE: the domain model is named Pattern, which collides with jakarta...Pattern (the validation
// annotation). We use the fully-qualified annotation name on the path variable to avoid the clash.
@RestController
@RequestMapping("/api/patterns")
@Validated
public class PatternController {

    private final KnowledgeService service;

    public PatternController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<PatternSummary> list() {
        return service.listPatterns().stream().map(PatternSummary::from).toList();
    }

    @GetMapping("/{id}")
    public Pattern get(
            @PathVariable
            @jakarta.validation.constraints.Pattern(regexp = TopicController.ID_PATTERN)
            String id) {
        return service.getPattern(id);
    }
}
