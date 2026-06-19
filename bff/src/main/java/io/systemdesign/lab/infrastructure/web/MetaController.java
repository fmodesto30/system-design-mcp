package io.systemdesign.lab.infrastructure.web;

import io.systemdesign.lab.application.KnowledgeService;
import io.systemdesign.lab.application.KnowledgeService.KnowledgeStats;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Small meta endpoint the frontend home uses to render counts. */
@RestController
@RequestMapping("/api/meta")
public class MetaController {

    private final KnowledgeService service;

    public MetaController(KnowledgeService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    public KnowledgeStats stats() {
        return service.stats();
    }
}
