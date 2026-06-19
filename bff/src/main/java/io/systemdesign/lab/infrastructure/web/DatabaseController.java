package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.domain.model.Database;
import io.systemdesign.lab.infrastructure.web.dto.SummaryDtos.DatabaseSummary;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/databases")
@Validated
public class DatabaseController {

    private final KnowledgeService service;

    public DatabaseController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping
    public List<DatabaseSummary> list() {
        return service.listDatabases().stream().map(DatabaseSummary::from).toList();
    }

    @GetMapping("/{id}")
    public Database get(@PathVariable @Pattern(regexp = TopicController.ID_PATTERN) String id) {
        return service.getDatabase(id);
    }
}
