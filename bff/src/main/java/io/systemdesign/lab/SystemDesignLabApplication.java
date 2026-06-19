package io.systemdesign.lab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * System Design Specialist Lab — BFF.
 *
 * <p>A read-only Backend for Frontend that serves a locally-curated System Design knowledge base
 * (topics, patterns, flows, interview questions, diagrams and an evidence matrix). It does NOT call
 * any LLM at runtime: all content is versioned JSON grounded in the source material.
 */
@SpringBootApplication
public class SystemDesignLabApplication {

    public static void main(String[] args) {
        SpringApplication.run(SystemDesignLabApplication.class, args);
    }
}
