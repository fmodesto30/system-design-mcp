package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.Diagram;
import io.systemdesign.lab.infrastructure.web.dto.SummaryDtos.DiagramSummary;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/diagrams")
@Validated
public class DiagramController {

    private final KnowledgeService service;

    public DiagramController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<DiagramSummary> list() {
        return service.listDiagrams().stream().map(DiagramSummary::from).toList();
    }

    @GetMapping("/{id}")
    public Diagram get(@PathVariable @Pattern(regexp = TopicController.ID_PATTERN) String id) {
        return service.getDiagram(id);
    }
}
