package rw.ingoboka.audit.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import rw.ingoboka.audit.domain.AuditEvent;
import rw.ingoboka.audit.infrastructure.persistence.AuditLogEntity;
import rw.ingoboka.audit.infrastructure.persistence.AuditLogRepository;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onAuditEvent(AuditEvent event) {
        AuditLogEntity log = new AuditLogEntity();
        log.setEventType(event.getEventType());
        log.setActorId(event.getActorId());
        log.setResourceType(event.getResourceType());
        log.setResourceId(event.getResourceId());
        log.setAction(event.getAction());
        log.setPayloadJson(serializeMetadata(event));
        log.setCorrelationId(event.getCorrelationId());
        log.setOccurredAt(event.getOccurredAt());
        auditLogRepository.save(log);
    }

    private String serializeMetadata(AuditEvent event) {
        if (event.getMetadata() == null || event.getMetadata().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(event.getMetadata());
        } catch (JsonProcessingException e) {
            return "{\"serializationError\":true}";
        }
    }
}
