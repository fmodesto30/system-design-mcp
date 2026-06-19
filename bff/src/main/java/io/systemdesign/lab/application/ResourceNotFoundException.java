package io.systemdesign.lab.application;

/** Thrown by use cases when a requested entity id does not exist. Mapped to HTTP 404 in the web layer. */
public class ResourceNotFoundException extends RuntimeException {

    private final String type;
    private final String id;

    public ResourceNotFoundException(String type, String id) {
        super(type + " '" + id + "' não encontrado");
        this.type = type;
        this.id = id;
    }

    public String type() {
        return type;
    }

    public String id() {
        return id;
    }
}
