package rw.ingoboka.shared.exception;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(String resource, Object identifier) {
        super(resource + " not found: " + identifier);
    }
}
