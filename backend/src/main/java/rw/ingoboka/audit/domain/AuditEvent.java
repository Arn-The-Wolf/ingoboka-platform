package rw.ingoboka.audit.domain;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.context.ApplicationEvent;

public class AuditEvent extends ApplicationEvent {

    private final String eventType;
    private final UUID actorId;
    private final String resourceType;
    private final UUID resourceId;
    private final String action;
    private final Map<String, Object> metadata;
    private final String correlationId;
    private final Instant occurredAt;

    public AuditEvent(
            Object source,
            String eventType,
            UUID actorId,
            String resourceType,
            UUID resourceId,
            String action,
            Map<String, Object> metadata,
            String correlationId) {
        super(source);
        this.eventType = eventType;
        this.actorId = actorId;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.action = action;
        this.metadata = metadata;
        this.correlationId = correlationId;
        this.occurredAt = Instant.now();
    }

    public String getEventType() {
        return eventType;
    }

    public UUID getActorId() {
        return actorId;
    }

    public String getResourceType() {
        return resourceType;
    }

    public UUID getResourceId() {
        return resourceId;
    }

    public String getAction() {
        return action;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }
}
